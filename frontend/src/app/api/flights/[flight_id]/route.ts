import { Pool } from 'pg';
import { NextResponse } from 'next/server';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});


export async function GET(request: Request, context: { params: { flight_id: string } }) {
    const  flight_id  = context.params.flight_id;

    if (!flight_id) {
        return NextResponse.json({ error: 'Flight ID is required' }, { status: 400 });
    }

    try {
        const sqlQuery = `
            SELECT
                f.flight_id, s.flight_number, f.departure_datetime, f.arrival_datetime, f.base_price,
                dep.city AS departure_city, dep.airport_name as departure_airport, dep.iata_code as departure_iata,
                arr.city AS arrival_city, arr.airport_name as arrival_airport, arr.iata_code as arrival_iata,
                arl.name AS airline_name, arl.logo_url,
                am.model_name as aircraft_model
            FROM Flights f
            JOIN Schedules s ON f.schedule_id = s.schedule_id
            JOIN Airports dep ON s.departure_airport_id = dep.airport_id
            JOIN Airports arr ON s.arrival_airport_id = arr.airport_id
            JOIN Aircrafts ac ON f.aircraft_id = ac.aircraft_id
            JOIN Airlines arl ON ac.airline_id = arl.airline_id
            JOIN Aircraft_Models am ON ac.model_id = am.model_id
            WHERE f.flight_id = $1;
        `;
        
        const result = await pool.query(sqlQuery, [flight_id]);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
        }

        // Возвращаем один объект, а не массив
        return NextResponse.json(result.rows[0]);

    } catch (error) {
        console.error('Failed to fetch flight details:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}