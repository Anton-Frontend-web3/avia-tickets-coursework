import 'server-only'

import { pool } from '@/lib/db'
export type SelectOption = {
	value: string // Будет содержать ID
	label: string // Будет содержать понятное имя
}
// Наш тип Flight
import { IFlight } from '@/app/search/page'
import { IPassengerCheck } from '@/shared/types/pessenger.type'
import { BookingDetails } from '@/shared/types/bookins.interface'
import { differenceInYears } from 'date-fns'
export async function getFlightDetailsById(
	flightId: string
): Promise<IFlight | null> {
	try {
		const sqlQuery = `
            SELECT
                f.flight_id, 
                s.flight_number, 
                f.departure_datetime, 
                f.arrival_datetime, 
                f.base_price,
                dep.city AS departure_city, 
                dep.airport_name as departure_airport, 
                dep.iata_code as departure_iata,
                arr.city AS arrival_city, 
                arr.airport_name as arrival_airport, 
                arr.iata_code as arrival_iata,
                arl.name AS airline_name, 
                arl.logo_url,
                am.model_name as aircraft_model
            FROM Flights f
            JOIN Schedules s ON f.schedule_id = s.schedule_id
            JOIN Airports dep ON s.departure_airport_id = dep.airport_id
            JOIN Airports arr ON s.arrival_airport_id = arr.airport_id
            JOIN Aircrafts ac ON f.aircraft_id = ac.aircraft_id
            JOIN Airlines arl ON ac.airline_id = arl.airline_id
            JOIN Aircraft_Models am ON ac.model_id = am.model_id
            WHERE f.flight_id = $1;
        `
		const result = await pool.query(sqlQuery, [flightId])
		if (result.rows.length === 0) return null
		return result.rows[0] as IFlight
	} catch (error) {
		console.error('Database Error:', error)
		return null
	}
}
export async function getBookingsByUserId(userId: string) {
	try {
		console.log(`Fetching bookings for user ID: ${userId}`)

		const sqlQuery = `
            SELECT
                b.booking_id,
                b.baggage_option,
                b.ticket_number,
                f.flight_id, 
                s.flight_number, 
                f.departure_datetime, 
                f.arrival_datetime, 
                f.base_price,
                dep.city AS departure_city,
                arr.city AS arrival_city,
                arl.name AS airline_name,
                arl.logo_url
            FROM Bookings b
            JOIN Passengers p ON b.passenger_id = p.passenger_id
            JOIN Flights f ON b.flight_id = f.flight_id
            JOIN Schedules s ON f.schedule_id = s.schedule_id
            JOIN Airports dep ON s.departure_airport_id = dep.airport_id
            JOIN Airports arr ON s.arrival_airport_id = arr.airport_id
            JOIN Aircrafts ac ON f.aircraft_id = ac.aircraft_id
            JOIN Airlines arl ON ac.airline_id = arl.airline_id
            WHERE p.user_id = $1
            ORDER BY f.departure_datetime DESC;
        `

		const result = await pool.query(sqlQuery, [userId])

		return result.rows
	} catch (error) {
		console.error('Database Error: Failed to fetch user bookings.', error)
		throw new Error('Failed to fetch user bookings.')
	}
}

export async function getAllSchedules() {
	try {
		const sqlQuery = `
    SELECT 
        s.schedule_id,
        s.flight_number,
        dep.city AS departure_city,
        arr.city AS arrival_city,
        s.departure_time,
        s.arrival_time,
        s.days_of_week
    FROM schedules s
    JOIN 
        Airports dep  ON s.departure_airport_id = dep.airport_id
    JOIN 
        Airports arr ON s.arrival_airport_id = arr.airport_id 
    ORDER BY
        s.schedule_id`

		const result = await pool.query(sqlQuery)
		return result.rows
	} catch (error) {
		console.error('Database Error: Failed to fetch schedules.', error)
		throw new Error(`Failed to fetch schedules.`)
	}
}

export async function getAirportsForSelect(): Promise<SelectOption[]> {
	try {
		const result = await pool.query(
			'SELECT airport_id, airport_name, city, iata_code FROM airports ORDER BY city, airport_name'
		)

		// Преобразуем данные из базы в формат, удобный для <Select> компонента
		return result.rows.map(airport => ({
			value: airport.airport_id.toString(),
			label: `${airport.city} (${airport.iata_code}) - ${airport.airport_name}`
		}))
	} catch (error) {
		console.error('Database Error: Failed to fetch airports.', error)
		throw new Error('Failed to fetch airports.')
	}
}

export async function getPassengersByFlightId(
	flightId: string
): Promise<IPassengerCheck[]> {
	console.log(`--- DATA FUNCTION TRIGGERED for flightId: ${flightId} ---`)
	try {
		const sqlQuery = `
        SELECT 
            b.booking_id,
            b.check_in_status,
            p.first_name,
            p.last_name,
            p.middle_name,
            p.document_number,
            b.seat_number
        FROM Bookings b
        JOIN Passengers p ON b.passenger_id = p.passenger_id
        WHERE b.flight_id = $1 AND b.status  = 'Confirmed'
        ORDER BY p.last_name, p.first_name;
        `
		const result = await pool.query(sqlQuery, [flightId])
		console.log(`Data Function: Found ${result.rows.length} rows in DB.`)
		return result.rows
	} catch (error) {
		console.error('DB Error:', error)
		throw new Error('Failed to fetch passengers.')
	}
}
export async function getBookingDetails(
	bookingId: string
): Promise<BookingDetails | null> {
	try {
		// Мы джоиним не только passengers, но и flights/airports,
		// чтобы получить полную информацию о билете в одном запросе.
		const sqlQuery = `
            SELECT 
                b.booking_id,
                b.baggage_option,
                b.ticket_number,
                b.booking_reference,
                b.status,
                b.seat_number,
                b.booking_datetime,
                
                p.first_name,
                p.last_name,
                p.middle_name,
                p.document_number,
                p.document_series,
                p.document_type,

                s.flight_number,
                dep.city AS departure_city,
                dep.iata_code AS departure_code,
                f.departure_datetime,
                arr.city AS arrival_city,
                arr.iata_code AS arrival_code,
                f.arrival_datetime,
                f.base_price,
                arl.name AS airline_name,
                arl.logo_url

            FROM Bookings b
            JOIN Passengers p ON b.passenger_id = p.passenger_id
            JOIN Flights f ON b.flight_id = f.flight_id
            JOIN Schedules s ON f.schedule_id = s.schedule_id
            JOIN Airports dep ON s.departure_airport_id = dep.airport_id
            JOIN Airports arr ON s.arrival_airport_id = arr.airport_id
            JOIN Aircrafts ac ON f.aircraft_id = ac.aircraft_id
            JOIN Airlines arl ON ac.airline_id = arl.airline_id
            
            WHERE b.booking_id = $1;
        `

		const result = await pool.query(sqlQuery, [bookingId])

		if (result.rows.length === 0) {
			return null
		}

		return result.rows[0] as BookingDetails
	} catch (error) {
		console.error('Database Error: Failed to fetch booking details.', error)
		return null
	}
}
export async function getCheckInSession(ticketNumber: string) {
    // 1. Получаем PNR ... (без изменений)
    const refRes = await pool.query(
        `SELECT booking_reference, flight_id FROM Bookings WHERE ticket_number = $1`, 
        [ticketNumber]
    );
    if (refRes.rows.length === 0) return null;
    const { booking_reference, flight_id } = refRes.rows[0];

    // 2. Получаем данные рейса СНАЧАЛА, чтобы знать дату вылета
    const flightRes = await pool.query(`
        SELECT 
            f.flight_id, 
            f.departure_datetime,
            am.seat_map
        FROM Flights f
        JOIN Aircrafts a ON f.aircraft_id = a.aircraft_id
        JOIN Aircraft_Models am ON a.model_id = am.model_id
        WHERE f.flight_id = $1
    `, [flight_id]);

    const flight = flightRes.rows[0];

    // 3. Теперь тащим пассажиров и сразу считаем, кто младенец
    const groupRes = await pool.query(`
        SELECT 
            b.ticket_number,
            b.seat_number,
            b.check_in_status,
            p.first_name,
            p.last_name,
            p.birth_date -- Нам нужна дата рождения
        FROM Bookings b
        JOIN Passengers p ON b.passenger_id = p.passenger_id
        WHERE b.booking_reference = $1 AND b.flight_id = $2
        ORDER BY p.birth_date -- Сначала старшие, младенцы в конце
    `, [booking_reference, flight_id]);

    // Добавляем флаг is_infant
    const passengers = groupRes.rows.map(p => {
        const age = differenceInYears(new Date(flight.departure_datetime), new Date(p.birth_date));
        return {
            ...p,
            is_infant: age < 2 // Младенец, если меньше 2 лет
        };
    });

    // 4. Занятые места (без изменений)
    const occupiedRes = await pool.query(`
        SELECT seat_number FROM Bookings 
        WHERE flight_id = $1 AND seat_number IS NOT NULL AND status = 'Confirmed'
    `, [flight_id]);

    return {
        flight,
        passengers, 
        occupiedSeats: occupiedRes.rows.map(r => r.seat_number)
    };
}

async function getBoardingPasses(ticketNumber: string) {
    // 1. Узнаем PNR
    const refRes = await pool.query(
        `SELECT booking_reference FROM Bookings WHERE ticket_number = $1`, 
        [ticketNumber]
    );
    
    if (refRes.rows.length === 0) return [];
    const { booking_reference } = refRes.rows[0];

    // 2. Ищем все посадочные талоны этой группы
    const res = await pool.query(`
        SELECT 
            b.ticket_number,
            b.seat_number,
            p.first_name, p.last_name,
            f.departure_datetime, f.arrival_datetime,
            dep.iata_code as dep_code, dep.city as dep_city,
            arr.iata_code as arr_code, arr.city as arr_city,
            s.flight_number,
            arl.name as airline
        FROM Bookings b
        JOIN Passengers p ON b.passenger_id = p.passenger_id
        JOIN Flights f ON b.flight_id = f.flight_id
        JOIN Schedules s ON f.schedule_id = s.schedule_id
        JOIN Airports dep ON s.departure_airport_id = dep.airport_id
        JOIN Airports arr ON s.arrival_airport_id = arr.airport_id
        JOIN Aircrafts a ON f.aircraft_id = a.aircraft_id
        JOIN Airlines arl ON a.airline_id = arl.airline_id
        WHERE b.booking_reference = $1 AND b.check_in_status = 'Checked-in'
        ORDER BY p.last_name
    `, [booking_reference]);

    return res.rows;
}