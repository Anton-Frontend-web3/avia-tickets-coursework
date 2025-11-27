import { getPassengersByFlightId } from "@/lib/data";
import { NextResponse } from "next/server";

export async function GET(request: Request, context: { params: Promise<{ flight_id: string }> }) {
    console.log("--- PASSENGER API ROUTE TRIGGERED ---")
    try {
        // 2. "Дожидаемся" разрешения Promise с параметрами
        const resolvedParams = await context.params;
        const { flight_id } = resolvedParams;
        console.log(`API Route: Got flight_id = ${flight_id}`);
        
        if (!flight_id) {
            return NextResponse.json({ error: 'Flight ID is required' }, { status: 400 });
        }
        
        // 3. Используем "распакованный" flight_id
        const passengers = await getPassengersByFlightId(flight_id);
        console.log(`API Route: Got ${passengers.length } passengers from data function.`); 
    
        return NextResponse.json(passengers);

    } catch (error) {
        console.error('API Error fetching passengers:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}