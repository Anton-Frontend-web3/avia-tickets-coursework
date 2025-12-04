'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'
import { pool } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getCheckInStatus } from '@/lib/utils'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
// --- ТИПЫ ---

export type RegisterActionState = {
	error?: string
	success?: boolean
} | null

export type CreateBookingResult =
	| {
			success: true
			ticketNumber: string
			ticketNumbers?: string[]
	  }
	| {
			success: false
			error: string
	  }

export type CreateScheduleResult = {
	error?: string
	success?: boolean
}

// --- СХЕМЫ ---

const registerSchema = z.object({
	email: z.email({ message: 'Некорректный email.' }),
	password: z
		.string()
		.min(8, { message: 'Пароль должен быть не менее 8 символов.' })
})

const scheduleSchemaOnServer = z.object({
	flight_number: z.string().min(3, { message: 'Номер рейса обязателен.' }),
	departure_airport_id: z.coerce.number(),
	arrival_airport_id: z.coerce.number(),
	departure_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
		message: 'Время в формате ЧЧ:ММ'
	}),
	arrival_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
		message: 'Время в формате ЧЧ:ММ'
	}),
	days_of_week: z
		.array(z.string())
		.min(1, { message: 'Выберите хотя бы один день недели.' })
})
type ScheduleData = z.infer<typeof scheduleSchemaOnServer>

// --- СХЕМЫ ДЛЯ БРОНИРОВАНИЯ ---

// 1. Базовая схема
const bookingBaseSchema = z.object({
	lastName: z.string().min(1),
	firstName: z.string().min(1),
	middleName: z.string().optional(),
	birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	gender: z.enum(['male', 'female']),
	// Добавляем опциональное место, если оно было выбрано на карте
	seatNumber: z.string().optional()
})

// 2. Схемы документов (ПЕРЕМЕСТИЛИ ИХ НАВЕРХ)
const passportRFSchema = bookingBaseSchema.extend({
	documentType: z.literal('passport_rf'),
	documentSeries: z.string().length(4),
	documentNumber: z.string().length(6),
	validUntil: z.undefined()
})

const passportIntSchema = bookingBaseSchema.extend({
	documentType: z.literal('passport_international'),
	documentSeries: z.string().length(2),
	documentNumber: z.string().length(7),
	validUntil: z.string()
})

const birthCertSchema = bookingBaseSchema.extend({
	documentType: z.literal('birth_certificate'),
	documentSeries: z.string().min(1),
	documentNumber: z.string().length(6),
	validUntil: z.undefined()
})

// 3. Схема одного пассажира (теперь passportRFSchema уже объявлена)
const singlePassengerActionSchema = z.discriminatedUnion('documentType', [
	passportRFSchema,
	passportIntSchema,
	birthCertSchema
])

// 4. Схема для одиночного бронирования (legacy, если используется старой формой)
const bookingActionSchema = singlePassengerActionSchema.and(
	z.object({ flightId: z.number() })
)

// 5. Схема для группового бронирования
const bookingGroupActionSchema = z.object({
	flightId: z.number(),
	passengers: z.array(singlePassengerActionSchema).min(1),
	baggageOption: z.string().optional()
})

// --- ACTIONS ---

// Старый экшен для одного пассажира
export async function createBooking(
	data: unknown
): Promise<CreateBookingResult> {
	const validatedFields = bookingActionSchema.safeParse(data)

	if (!validatedFields.success) {
		console.error('Booking Validation Error:', validatedFields.error.format())
		return { success: false, error: 'Ошибка валидации.' }
	}

	const passengerData = validatedFields.data
	const { flightId, documentNumber } = passengerData

	// Безопасное получение validUntil без `any`
	const validUntil =
		passengerData.documentType === 'passport_international'
			? passengerData.validUntil
			: null

	try {
		const session = await getServerSession(authOptions)
		let userId: number | null = null

		if (session?.user?.id) {
			const parsedId = parseInt(session.user.id, 10)
			const userExists = await pool.query(
				'SELECT user_id FROM users WHERE user_id = $1',
				[parsedId]
			)

			if (userExists.rows.length > 0) {
				userId = parsedId
			} else {
				const cookieStore = await cookies()
				cookieStore.delete('next-auth.session-token')
				cookieStore.delete('__Secure-next-auth.session-token')
				throw new Error('REDIRECT_LOGIN')
			}
		}

		let passengerResult = await pool.query(
			`INSERT INTO passengers (
              last_name, first_name, middle_name, birth_date, gender, 
              document_type, document_series, document_number, valid_until, user_id
           ) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
           ON CONFLICT (document_number) DO UPDATE SET 
              last_name = EXCLUDED.last_name, 
              first_name = EXCLUDED.first_name, 
              middle_name = EXCLUDED.middle_name,
              birth_date = EXCLUDED.birth_date,
              gender = EXCLUDED.gender,
              document_type = EXCLUDED.document_type,
              document_series = EXCLUDED.document_series,
              valid_until = EXCLUDED.valid_until,
              user_id = EXCLUDED.user_id
           RETURNING passenger_id`,
			[
				passengerData.lastName,
				passengerData.firstName,
				passengerData.middleName || null,
				passengerData.birthDate,
				passengerData.gender,
				passengerData.documentType,
				passengerData.documentSeries || null,
				passengerData.documentNumber,
				validUntil,
				userId
			]
		)

		if (passengerResult.rows.length === 0) {
			passengerResult = await pool.query(
				'SELECT passenger_id FROM passengers WHERE document_number = $1',
				[documentNumber]
			)
		}

		const passengerId = passengerResult.rows[0].passenger_id
		const ticketNumber = `TKT-${Math.random().toString(36).slice(2, 11).toUpperCase()}`

		await pool.query(
			`INSERT INTO bookings (flight_id, passenger_id, ticket_number, status) 
             VALUES ($1, $2, $3, 'Confirmed')`,
			[flightId, passengerId, ticketNumber]
		)
		return { success: true, ticketNumber: ticketNumber }
	} catch (error: unknown) {
		if (error instanceof Error && error.message === 'REDIRECT_LOGIN') {
			redirect('/login')
		}
		console.error('Database Error:', error)
		return { success: false, error: 'Ошибка базы данных.' }
	}
}

// Новый экшен для ГРУППЫ пассажиров
export async function createBookingGroup(
	data: unknown
): Promise<CreateBookingResult> {
    // ... валидация и получение сессии (без изменений) ...
	const validatedFields = bookingGroupActionSchema.safeParse(data)
	if (!validatedFields.success) { return { success: false, error: 'Ошибка валидации.' } }
	const { flightId, passengers, baggageOption } = validatedFields.data
	const safeBaggage = baggageOption || 'no_baggage'
	const session = await getServerSession(authOptions)
	let userId: number | null = null
	const client = await pool.connect()

	try {
        // ... (проверка зомби-сессии без изменений) ...
		if (session?.user?.id) {
			const parsedId = parseInt(session.user.id, 10)
			const userExists = await client.query('SELECT user_id FROM users WHERE user_id = $1', [parsedId])
			if (userExists.rows.length > 0) {
				userId = parsedId
			} else {
				const cookieStore = await cookies()
				cookieStore.delete('next-auth.session-token')
				cookieStore.delete('__Secure-next-auth.session-token')
				throw new Error('REDIRECT_LOGIN')
			}
		} else {
			throw new Error('REDIRECT_LOGIN')
		}

		await client.query('BEGIN')

        // --- ИЗМЕНЕНИЕ 1: Генерируем общий код бронирования (PNR) для всей группы ---
        const bookingReference = Math.random().toString(36).substring(2, 8).toUpperCase();

		const tickets: string[] = []

		for (const p of passengers) {
			const validUntil = p.documentType === 'passport_international' ? p.validUntil : null

			// ... (INSERT пассажира без изменений) ...
			let passengerResult = await client.query(
				`INSERT INTO passengers (
                    last_name, first_name, middle_name, birth_date, gender, 
                    document_type, document_series, document_number, valid_until, user_id
                 ) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
                 ON CONFLICT (document_type, document_number) DO UPDATE SET 
                    last_name = EXCLUDED.last_name, 
                    first_name = EXCLUDED.first_name, 
                    middle_name = EXCLUDED.middle_name,
                    birth_date = EXCLUDED.birth_date,
                    gender = EXCLUDED.gender,
                    document_series = EXCLUDED.document_series,
                    valid_until = EXCLUDED.valid_until,
                    user_id = EXCLUDED.user_id
                 RETURNING passenger_id`,
				[p.lastName, p.firstName, p.middleName || null, p.birthDate, p.gender, p.documentType, p.documentSeries || null, p.documentNumber, validUntil, userId]
			)

			if (passengerResult.rows.length === 0) {
				passengerResult = await client.query(
					'SELECT passenger_id FROM passengers WHERE document_type = $1 AND document_number = $2',
					[p.documentType, p.documentNumber]
				)
			}

			const passengerId = passengerResult.rows[0].passenger_id
			const ticketNumber = `TKT-${Math.random().toString(36).slice(2, 11).toUpperCase()}`
			tickets.push(ticketNumber)

			// --- ИЗМЕНЕНИЕ 2: Добавляем booking_reference в INSERT ---
			await client.query(
				`INSERT INTO bookings (
                    flight_id, 
                    passenger_id, 
                    ticket_number, 
                    status, 
                    baggage_option, 
                    seat_number, 
                    booking_reference  
                ) 
				 VALUES ($1, $2, $3, 'Confirmed', $4, NULL, $5)`, 
				[
                    flightId, 
                    passengerId, 
                    ticketNumber, 
                    safeBaggage, 
                    bookingReference 
                ]
			)
		}

		await client.query('COMMIT')

		revalidatePath('/profile')
		return { success: true, ticketNumber: tickets[0], ticketNumbers: tickets }
        
	} catch (error: unknown) {
		await client.query('ROLLBACK')
		if (error instanceof Error && error.message === 'REDIRECT_LOGIN') {
			redirect('/login')
		}
		console.error('Group Booking Error:', error)
		return { success: false, error: 'Сбой при бронировании.' }
	} finally {
		client.release()
	}
}

export async function updateCheckInStatus(
	bookingId: number,
	isChecked: boolean
) {
	const newStatus = isChecked ? 'Checked-in' : 'Pending'
	console.log(`--- ACTION: Updating booking ${bookingId} to ${newStatus} ---`)

	try {
		const result = await pool.query(
			`UPDATE Bookings SET check_in_status = $1 WHERE booking_id = $2`,
			[newStatus, bookingId]
		)
		console.log(
			`--- ACTION: DB responded. Rows affected: ${result.rowCount} ---`
		)
		return { success: true }
	} catch (error) {
		console.error('Database Error: Failed to update check-in status.', error)
		return { success: false, error: 'Не удалось обновить статус пассажира.' }
	}
}

export async function createSchedule(
	data: unknown
): Promise<CreateScheduleResult> {
	const validatedFields = scheduleSchemaOnServer.safeParse(data)

	if (!validatedFields.success) {
		const firstErrorMessage =
			validatedFields.error.issues[0]?.message || 'Ошибка валидации.'
		return { success: false, error: firstErrorMessage }
	}

	const {
		flight_number,
		departure_airport_id,
		arrival_airport_id,
		departure_time,
		arrival_time,
		days_of_week
	} = validatedFields.data

	try {
		await pool.query(
			`INSERT INTO schedules 
          (flight_number, departure_airport_id, arrival_airport_id, departure_time, arrival_time, days_of_week) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
			[
				flight_number,
				departure_airport_id,
				arrival_airport_id,
				departure_time,
				arrival_time,
				days_of_week.map(day => parseInt(day, 10))
			]
		)
	} catch (error) {
		console.error('Database Error: Failed to create schedule.', error)
		return { success: false, error: 'Не удалось создать расписание.' }
	}

	revalidatePath('/admin/schedules')
	redirect('/admin/schedules')
}
export async function registerUser(
	data: z.infer<typeof registerSchema>
): Promise<RegisterActionState> {
	const validatedFields = registerSchema.safeParse(data)

	if (!validatedFields.success) {
		return { error: 'Ошибка валидации. Проверьте введенные данные.' }
	}

	const { email, password } = validatedFields.data

	try {
		const hashedPassword = await bcrypt.hash(password, 10)

		await pool.query(
			`INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'client')`,
			[email, hashedPassword]
		)
	} catch (error: unknown) {
		if (
			error &&
			typeof error === 'object' &&
			'code' in error &&
			error.code === '23505'
		) {
			console.log(`Attempted to register existing email: ${email}`)
			return { success: true }
		}
		console.error('Registration Database Error:', error)
		return { error: 'Не удалось создать пользователя. Попробуйте позже.' }
	}
	return { success: true }
}

export async function cancelBooking(bookingId: number) {
	try {
		// 1. Проверяем авторизацию
		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return { success: false, error: 'Не авторизован' }
		}
		const userId = parseInt(session.user.id)

		// 2. Выполняем UPDATE, но с проверкой владельца!
		// Мы используем FROM passengers, чтобы убедиться, что билет принадлежит именно этому юзеру
		const result = await pool.query(
			`UPDATE bookings
		 SET status = 'Cancelled'
		 FROM passengers
		 WHERE bookings.passenger_id = passengers.passenger_id
		   AND bookings.booking_id = $1
		   AND passengers.user_id = $2
		   AND bookings.status = 'Confirmed'`, // Отменяем только подтвержденные
			[bookingId, userId]
		)

		if (result.rowCount === 0) {
			return {
				success: false,
				error: 'Бронирование не найдено или уже отменено.'
			}
		}

		// 3. Обновляем кэш страниц
		revalidatePath('/profile')
		revalidatePath(`/booking/${bookingId}`)

		return { success: true }
	} catch (error) {
		console.error('Cancel Booking Error:', error)
		return { success: false, error: 'Ошибка при отмене бронирования.' }
	}
}

export async function findBookingForCheckIn(data: unknown) {
	const schema = z.object({
		ticketNumber: z.string(),
		lastName: z.string()
	})

	const validated = schema.safeParse(data)
	if (!validated.success) {
		return { error: 'Неверные данные' }
	}

	const { ticketNumber, lastName } = validated.data

	try {
		// 1. Ищем бронирование:
        // - Либо по номеру билета
        // - Либо по коду бронирования (PNR)
        // - ОБЯЗАТЕЛЬНО проверяем фамилию, чтобы найти нужного человека в группе
		const result = await pool.query(
			`SELECT 
                b.booking_id, 
                b.check_in_status,
                b.ticket_number, -- Нам нужен именно номер билета для редиректа
                f.departure_datetime,
                p.last_name,
                p.first_name
             FROM Bookings b
             JOIN Passengers p ON b.passenger_id = p.passenger_id
             JOIN Flights f ON b.flight_id = f.flight_id
             WHERE (b.ticket_number = $1 OR b.booking_reference = $1)
               AND LOWER(p.last_name) = LOWER($2)`,
			[ticketNumber, lastName]
		)

		if (result.rows.length === 0) {
			return { error: 'Бронирование не найдено. Проверьте номер/код и фамилию.' }
		}

		const booking = result.rows[0]

        // (Проверка фамилии в JS больше не нужна, мы проверили её в SQL, но можно оставить для надежности)

		// 3. Проверяем время (24 часа)
		const timeStatus = getCheckInStatus(booking.departure_datetime)

		if (!timeStatus.isOpen) {
			return { error: timeStatus.message }
		}

		// 4. Проверка статуса
		if (booking.check_in_status === 'Checked-in') {
            // Если уже зарегистрирован, всё равно возвращаем успех и номер билета,
            // чтобы перекинуть его на посадочный талон
		}

		// 5. Всё супер -> Возвращаем найденный НОМЕР БИЛЕТА
        // Даже если юзер ввел PNR, мы вернем TKT-XXXXX
		return { success: true, redirectTicket: booking.ticket_number }

	} catch (error) {
		console.error('Check-in find error:', error)
		return { error: 'Ошибка сервера при поиске бронирования.' }
	}
}

export async function processRandomCheckIn(ticketNumber: string) {
	const client = await pool.connect()
	try {
		await client.query('BEGIN')

		// Получаем ID рейса и схему
		const flightData = await client.query(
			`
            SELECT f.flight_id, am.seat_map
            FROM Bookings b
            JOIN Flights f ON b.flight_id = f.flight_id
            JOIN Aircrafts a ON f.aircraft_id = a.aircraft_id
            JOIN Aircraft_Models am ON a.model_id = am.model_id
            WHERE b.ticket_number = $1
        `,
			[ticketNumber]
		)

		if (flightData.rows.length === 0) throw new Error('Бронь не найдена')

		const { flight_id, seat_map } = flightData.rows[0]

		// Получаем занятые места
		const occupiedRes = await client.query(
			`SELECT seat_number FROM Bookings WHERE flight_id = $1 AND seat_number IS NOT NULL`,
			[flight_id]
		)
		const occupied = new Set(occupiedRes.rows.map(r => r.seat_number))

		// Генерируем список ВСЕХ мест
		let allSeats: string[] = []
		const rows = seat_map.rows
		const letters = seat_map.letters

		for (let r = 1; r <= rows; r++) {
			for (const l of letters) {
				allSeats.push(`${r}${l}`)
			}
		}

		// Фильтруем:
		// 1. Свободные
		// 2. Бесплатные (проверяем по rowPrices и prices из JSON)
		const freeSeats = allSeats.filter(seat => {
			if (occupied.has(seat)) return false

			const row = parseInt(seat)
			const letter = seat.replace(/[0-9]/g, '')

			// Если есть цена за ряд - пропускаем (это платно)
			if (seat_map.rowPrices && seat_map.rowPrices[row.toString()]) return false
			// Если есть цена за букву - пропускаем
			if (seat_map.prices && seat_map.prices[letter]) return false

			return true
		})

		if (freeSeats.length === 0)
			throw new Error('Нет бесплатных мест (система полная)')

		// Выбираем случайное
		const randomSeat = freeSeats[Math.floor(Math.random() * freeSeats.length)]

		// Обновляем бронь
		await client.query(
			`
            UPDATE Bookings 
            SET seat_number = $1, check_in_status = 'Checked-in'
            WHERE ticket_number = $2
        `,
			[randomSeat, ticketNumber]
		)

		await client.query('COMMIT')

		// Редирект на посадочный
		redirect(`/check-in/success?ticket=${ticketNumber}`)
	} catch (e) {
		if (isRedirectError(e)) {
			throw e
		}
		await client.query('ROLLBACK')
		console.error(e)
		return { error: 'Ошибка при регистрации' }
	} finally {
		client.release()
	}
}

// 2. Выбор конкретного места (Платное или Бесплатное)
export async function processSeatSelection(
	ticketNumber: string,
	seatNumber: string,
	price: number
) {
	// В реальном проекте тут была бы интеграция с Payment Gateway, если price > 0
	// Мы делаем заглушку: считаем, что оплата прошла успешно.

	try {
		// Простая проверка, не заняли ли место, пока мы думали
		// (Для полной надежности лучше использовать транзакцию как выше)

		await pool.query(
			`
            UPDATE Bookings 
            SET seat_number = $1, check_in_status = 'Checked-in'
            WHERE ticket_number = $2
        `,
			[seatNumber, ticketNumber]
		)

		revalidatePath(`/check-in/${ticketNumber}`)
		redirect(`/check-in/success?ticket=${ticketNumber}`)
	} catch (e) {
		if (isRedirectError(e)) {
			throw e
		}
		console.error(e)
		return { error: 'Не удалось выбрать место. Возможно, оно уже занято.' }
	}
}

export async function processGroupCheckIn(
    selections: Record<string, string>, 
    infantTickets: string[] = [] // По умолчанию пустой массив
) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Регистрируем пассажиров с местами
        for (const [ticketNumber, seatNumber] of Object.entries(selections)) {
            // Можно добавить проверку занятости here
            await client.query(`
                UPDATE Bookings 
                SET seat_number = $1, check_in_status = 'Checked-in'
                WHERE ticket_number = $2
            `, [seatNumber, ticketNumber]);
        }

        // 2. Регистрируем младенцев (без места)
        for (const ticketNumber of infantTickets) {
            await client.query(`
                UPDATE Bookings 
                SET seat_number = NULL, check_in_status = 'Checked-in'
                WHERE ticket_number = $1
            `, [ticketNumber]);
        }

        await client.query('COMMIT');
        
        // Редирект на любой билет из группы (включая младенца, так как PNR один)
        const firstTicket = Object.keys(selections)[0] || infantTickets[0];
        redirect(`/check-in/success?ticket=${firstTicket}`); 

    } catch (e) {
        if (isRedirectError(e)) throw e;
        await client.query('ROLLBACK');
        console.error(e);
        return { error: "Ошибка сохранения" };
    } finally {
        client.release();
    }
}