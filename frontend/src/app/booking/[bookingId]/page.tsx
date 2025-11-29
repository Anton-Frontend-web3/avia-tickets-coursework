import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plane, User, CreditCard } from "lucide-react"; // Calendar убрал, он не используется

import { getBookingDetails } from "@/lib/data";
import { formatTime, formatDateWithDay } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CancelBookingButton } from "@/components/custom-ui/CancelBookingButton";

// Словарь для перевода типов документов
const DOC_TYPE_LABELS: Record<string, string> = {
    'passport_rf': 'Паспорт РФ',
    'passport_international': 'Загранпаспорт',
    'birth_certificate': 'Свид. о рождении'
};

interface PageProps {
    params: Promise<{ bookingId: string }>;
}

export default async function BookingDetailsPage({ params }: PageProps) {
    const { bookingId } = await params;
    const booking = await getBookingDetails(bookingId);

    if (!booking) {
        return notFound();
    }

    const isConfirmed = booking.status === 'Confirmed';
    
    const statusClasses = isConfirmed 
        ? "bg-green-50 text-green-700 border-green-200" 
        : "bg-red-50 text-red-700 border-red-200";
        
    const statusLabel = isConfirmed ? "Оплачено и подтверждено" : "Бронирование отменено";

    const departureDate = formatDateWithDay(booking.departure_datetime.toString());
    const departureTime = formatTime(booking.departure_datetime.toString());
    const arrivalDate = formatDateWithDay(booking.arrival_datetime.toString());
    const arrivalTime = formatTime(booking.arrival_datetime.toString());

    // Формируем красивое название документа
    const documentLabel = DOC_TYPE_LABELS[booking.document_type] || 'Документ';
    
    // Формируем строку "Серия Номер" (если серии нет, то просто номер)
    const fullDocumentNumber = booking.document_series 
        ? `${booking.document_series} ${booking.document_number}`
        : booking.document_number;

    return (
        <div className="container mx-auto py-10 px-4 max-w-3xl">
            <div className="mb-6">
                <Link href="/profile">
                    <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-blue-600">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Вернуться в личный кабинет
                    </Button>
                </Link>
            </div>

            <Card className="shadow-md border-gray-200 overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardDescription className="mb-1">Номер билета</CardDescription>
                            <CardTitle className="text-2xl font-bold font-mono text-blue-600 tracking-wide">
                                {booking.ticket_number}
                            </CardTitle>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full border text-sm font-medium w-fit ${statusClasses}`}>
                            {statusLabel}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-8">
                    {/* Информация о рейсе */}
                    <section>
                        <div className="flex items-center gap-2 mb-4 text-gray-800">
                            <Plane className="h-5 w-5 text-blue-500" />
                            <h3 className="text-lg font-semibold">Информация о рейсе</h3>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-gray-100 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-900">{booking.airline_name}</span>
                                <span className="text-sm text-gray-500">Рейс {booking.flight_number}</span>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <div className="text-left">
                                    <p className="text-3xl font-bold text-gray-900">{departureTime}</p>
                                    <p className="text-sm font-medium text-gray-600">{departureDate}</p>
                                    <p className="text-xs text-gray-400 mt-1">{booking.departure_city} ({booking.departure_code})</p>
                                </div>

                                <div className="flex-1 flex flex-col items-center px-2">
                                    <div className="w-full h-[2px] bg-gray-200 relative mt-2">
                                        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 bg-gray-300 rounded-full"></div>
                                        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 bg-gray-300 rounded-full"></div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-3xl font-bold text-gray-900">{arrivalTime}</p>
                                    <p className="text-sm font-medium text-gray-600">{arrivalDate}</p>
                                    <p className="text-xs text-gray-400 mt-1">{booking.arrival_city} ({booking.arrival_code})</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <Separator />

                    {/* Пассажир - ИЗМЕНЕНИЯ ЗДЕСЬ */}
                    <section>
                        <div className="flex items-center gap-2 mb-4 text-gray-800">
                            <User className="h-5 w-5 text-blue-500" />
                            <h3 className="text-lg font-semibold">Пассажир</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-gray-50/50 rounded-lg">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Фамилия Имя Отчество</p>
                                <p className="font-medium text-gray-900">
                                    {booking.last_name} {booking.first_name} {booking.middle_name}
                                </p>
                            </div>
                            <div>
                                {/* Выводим тип документа (Паспорт РФ) */}
                                <p className="text-xs text-gray-500 mb-1">{documentLabel}</p>
                                {/* Выводим Серию и Номер */}
                                <p className="font-medium text-gray-900">
                                    {fullDocumentNumber}
                                </p>
                            </div>
                        </div>
                    </section>

                    <Separator />

                    {/* Оплата и Багаж */}
                     <section>
                        <div className="flex items-center gap-2 mb-4 text-gray-800">
                            <CreditCard className="h-5 w-5 text-blue-500" />
                            <h3 className="text-lg font-semibold">Оплата и услуги</h3>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center p-4 border rounded-lg">
                                <span className="text-gray-600">Стоимость билета</span>
                                <span className="text-xl font-bold text-gray-900">
                                    {parseInt(booking.base_price).toLocaleString('ru-RU')} ₽
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center p-4 border rounded-lg bg-blue-50/50">
                                <span className="text-gray-600">Багаж</span>
                                <span className="font-medium text-blue-900">
                                    {booking.baggage_option === 'no_baggage' 
                                        ? 'Без багажа' 
                                        : booking.baggage_option === 'baggage_10' 
                                            ? 'Багаж 10 кг' 
                                            : 'Багаж 20 кг' 
                                    }
                                </span>
                            </div>
                        </div>
                    </section>
                </CardContent>
                {isConfirmed && (
                    <CardFooter className="bg-gray-50 border-t p-6 flex justify-end">
                        <CancelBookingButton bookingId={booking.booking_id} />
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}