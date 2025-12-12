import { getPassengersByFlightId } from '@/lib/data'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ flight_id: string }> }
) {
  try {
    const { flight_id } = await params

    if (!flight_id) {
      return NextResponse.json({ error: 'Flight ID is required' }, { status: 400 })
    }

    const passengers = await getPassengersByFlightId(flight_id)
    return NextResponse.json(passengers)
  } catch (error) {
    console.error('API Error fetching passengers:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}