import { Pool } from 'pg';
import { NextResponse } from 'next/server';


const pool = new Pool({
    connectionString: process.env.DATABASE_URL, 
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const departureCity = searchParams.get('from');
    const arrivalCity = searchParams.get('to');
    const departureDate = searchParams.get('date');

    const sqlQuery = `
        SELECT
            f.flight_id, s.flight_number, f.departure_datetime, f.arrival_datetime, f.base_price,
            dep.city AS departure_city, arr.city AS arrival_city, arl.name AS airline_name,arl.logo_url
        FROM Flights f
        JOIN Schedules s ON f.schedule_id = s.schedule_id
        JOIN Airports dep ON s.departure_airport_id = dep.airport_id
        JOIN Airports arr ON s.arrival_airport_id = arr.airport_id
        JOIN Aircrafts ac ON f.aircraft_id = ac.aircraft_id
        JOIN Airlines arl ON ac.airline_id = arl.airline_id
        WHERE
            dep.city = $1 AND
            arr.city = $2 AND
            DATE(f.departure_datetime) = $3;
    `;
    
    const result = await pool.query(sqlQuery, [departureCity, arrivalCity, departureDate]);

    return NextResponse.json(result.rows);
}