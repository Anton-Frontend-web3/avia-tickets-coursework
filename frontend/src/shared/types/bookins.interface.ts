export interface BookingDetails {
	booking_id: number
	ticket_number: string
    booking_reference: string
	base_price: string
	status: 'Confirmed' | 'Cancelled'
	seat_number: string
	booking_datetime: Date
	baggage_option: string
	
	first_name: string
	last_name: string
	middle_name?: string
	document_number: string
	document_series: string
	document_type: string
	
	flight_number: string
	departure_city: string
	departure_code: string
	departure_datetime: Date
	arrival_city: string
	arrival_code: string
	arrival_datetime: Date
	airline_name: string
	logo_url?: string
}
