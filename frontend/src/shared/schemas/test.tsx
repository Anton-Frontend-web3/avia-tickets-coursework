'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const pool = new Pool({
	connectionString: process.env.DATABASE_URL
})

// --- ТИПЫ ---

export type RegisterActionState = {
	error?: string
	success?: boolean
} | null

export type CreateBookingResult =
	| {
			success: true
			ticketNumber: string
			ticketNumbers?: string[] // Добавил для группового бронирования
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
	email: z.string().email({ message: 'Некорректный email.' }),
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
	gender: z.enum(['male', 'female'])
	// flightId убрали отсюда, он будет на уровень выше
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
	passengers: z.array(singlePassengerActionSchema).min(1)
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
	const validatedFields = bookingGroupActionSchema.safeParse(data)

	if (!validatedFields.success) {
		console.error('Group Validation Error:', validatedFields.error.format())
		return { success: false, error: 'Ошибка валидации данных.' }
	}

	const { flightId, passengers } = validatedFields.data

	const session = await getServerSession(authOptions)
	let userId: number | null = null

	// Используем клиент из пула для транзакции
	const client = await pool.connect()

	try {
		if (session?.user?.id) {
			const parsedId = parseInt(session.user.id, 10)
			const userExists = await client.query(
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

		await client.query('BEGIN')

		const tickets: string[] = []

		for (const p of passengers) {
			// Безопасное извлечение validUntil для конкретного пассажира
			const validUntil =
				p.documentType === 'passport_international' ? p.validUntil : null

			let passengerResult = await client.query(
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
					p.lastName,
					p.firstName,
					p.middleName || null,
					p.birthDate,
					p.gender,
					p.documentType,
					p.documentSeries || null,
					p.documentNumber,
					validUntil,
					userId
				]
			)

			if (passengerResult.rows.length === 0) {
				passengerResult = await client.query(
					'SELECT passenger_id FROM passengers WHERE document_number = $1',
					[p.documentNumber]
				)
			}

			const passengerId = passengerResult.rows[0].passenger_id
			const ticketNumber = `TKT-${Math.random().toString(36).slice(2, 11).toUpperCase()}`

			tickets.push(ticketNumber)

			await client.query(
				`INSERT INTO bookings (flight_id, passenger_id, ticket_number, status) 
                 VALUES ($1, $2, $3, 'Confirmed')`,
				[flightId, passengerId, ticketNumber]
			)
		}

		await client.query('COMMIT')

		revalidatePath('/profile')

		// Возвращаем первый билет или список (в зависимости от того, что нужно фронтенду)
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
