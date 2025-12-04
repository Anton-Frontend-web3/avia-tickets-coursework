import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { pool } from '@/lib/db'

interface RouteContext {
	params: Promise<{ flight_id: string }>
}

export async function POST(req: Request, { params }: RouteContext) {
	const { flight_id } = await params
	const session = await getServerSession(authOptions)
	if (!session?.user?.id)
		return NextResponse.json({ error: 'Auth required' }, { status: 401 })

	const userId = parseInt(session.user.id)
	const flightId = parseInt(flight_id)
	const { seatNumbers } = await req.json()

	if (!Array.isArray(seatNumbers)) {
		// Разрешаем пустой массив (для снятия выбора), но не null
		return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
	}

	const client = await pool.connect()

	try {
		await client.query('BEGIN')

		// --- ИЗМЕНЕНИЕ 1: ANTI-ABUSE ПРОВЕРКА ---
		if (seatNumbers.length > 0) {
			const currentHoldsRes = await client.query(
				`SELECT COUNT(*) FROM seat_reservations WHERE flight_id = $1 AND user_id = $2`,
				[flightId, userId]
			)
			// Упрощенная логика: сколько у юзера всего мест (старых + новых)
			// Реальная логика сложнее (надо вычесть пересечения), но для защиты хватит:
			// "Ты не можешь пытаться занять > 9 мест одновременно"
			if (seatNumbers.length > 9) {
				throw new Error(`Нельзя выбрать больше 9 мест.`)
			}
		}
		// ----------------------------------------

		// Очистка (оставляем только те, что прислал юзер сейчас)
		if (seatNumbers.length > 0) {
			const placeholders = seatNumbers.map((_, i) => `$${i + 3}`).join(',')
			await client.query(
				`DELETE FROM seat_reservations 
                 WHERE flight_id = $1 AND user_id = $2 AND seat_number NOT IN (${placeholders})`,
				[flightId, userId, ...seatNumbers]
			)
		} else {
			// Если прислали пустой массив - удаляем всё
			await client.query(
				`DELETE FROM seat_reservations WHERE flight_id = $1 AND user_id = $2`,
				[flightId, userId]
			)
		}

		for (const seat of seatNumbers) {
			const booked = await client.query(
				`SELECT 1 FROM Bookings WHERE flight_id = $1 AND seat_number = $2 AND status = 'Confirmed'`,
				[flightId, seat]
			)
			if ((booked.rowCount ?? 0) > 0)
				throw new Error(`Место ${seat} уже выкуплено`)

			const reserved = await client.query(
				`SELECT user_id FROM seat_reservations 
                 WHERE flight_id = $1 AND seat_number = $2 AND expires_at > NOW()
                 FOR UPDATE`,
				[flightId, seat]
			)

			if ((reserved.rowCount ?? 0) > 0) {
				if (reserved.rows[0].user_id !== userId) {
					throw new Error(`Место ${seat} занято`)
				}
			}

			await client.query(
				`INSERT INTO seat_reservations (flight_id, seat_number, user_id, expires_at)
                 VALUES ($1, $2, $3, NOW() + INTERVAL '10 minutes')
                 ON CONFLICT (flight_id, seat_number) 
                 DO UPDATE SET expires_at = EXCLUDED.expires_at, user_id = EXCLUDED.user_id`,
				[flightId, seat, userId]
			)
		}

		await client.query('COMMIT')

		// Возвращаем время истечения (через 10 мин)
		return NextResponse.json({
			success: true,
			expiresAt: new Date(Date.now() + 10 * 60000)
		})
	} catch (error: any) {
		await client.query('ROLLBACK')
		return NextResponse.json({ error: error.message }, { status: 409 })
	} finally {
		client.release()
	}
}
