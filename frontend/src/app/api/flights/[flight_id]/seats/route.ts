import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { pool } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ flight_id: string }> }) {
    const { flight_id } = await params;
    const flightId = parseInt(flight_id);
    
    const client = await pool.connect();
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id ? parseInt(session.user.id) : null;

    try {
        await client.query(`DELETE FROM seat_reservations WHERE expires_at < NOW()`);

        // --- ИЗМЕНЕНИЕ: ЗАПРОС СХЕМЫ ИЗ БД ---
        const flightData = await client.query(
            `SELECT am.seat_map 
             FROM Flights f
             JOIN Aircrafts a ON f.aircraft_id = a.aircraft_id
             JOIN Aircraft_Models am ON a.model_id = am.model_id
             WHERE f.flight_id = $1`,
            [flightId]
        );

        if (flightData.rows.length === 0 || !flightData.rows[0].seat_map) {
            // Фолбэк, если забыли заполнить БД (чтобы не упало)
            return NextResponse.json({ 
                layout: { rows: 10, letters: ['A','B','C'], aisleAfter: [] },
                booked: [], reservedByOthers: [], myHolds: []
            });
        }

        const layout = flightData.rows[0].seat_map; 
        // -------------------------------------

        const bookedRes = await client.query(
            `SELECT seat_number FROM Bookings WHERE flight_id = $1 AND status = 'Confirmed'`,
            [flightId]
        );
        const booked = bookedRes.rows.map(r => r.seat_number);

        const reservedRes = await client.query(
            `SELECT seat_number, user_id FROM seat_reservations WHERE flight_id = $1`, 
            [flightId]
        );
        
        const reservedByOthers = reservedRes.rows
            .filter(r => r.user_id !== currentUserId)
            .map(r => r.seat_number);

        const myHolds = reservedRes.rows
            .filter(r => r.user_id === currentUserId)
            .map(r => r.seat_number);

        return NextResponse.json({ 
            layout, 
            booked,           
            reservedByOthers, 
            myHolds           
        });

    } finally {
        client.release();
    }
}