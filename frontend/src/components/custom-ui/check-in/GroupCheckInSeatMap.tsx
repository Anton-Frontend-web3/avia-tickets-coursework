'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { User, Check, Loader2, Users, Baby } from 'lucide-react' // Добавил иконку Baby
import { processGroupCheckIn } from '@/lib/actions'

interface Passenger {
    ticket_number: string
    first_name: string
    last_name: string
    seat_number: string | null
    check_in_status: string
    is_infant: boolean // <--- Новое поле
}

interface Props {
    layout: any
    occupiedSeats: string[]
    passengers: Passenger[]
}

export function GroupCheckInSeatMap({ layout, occupiedSeats, passengers }: Props) {
    // Фильтруем тех, кому НУЖНО место (взрослые и дети > 2 лет)
    const passengersNeedSeats = passengers.filter(p => !p.is_infant);

    const [selections, setSelections] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {}
        passengersNeedSeats.forEach(p => {
            if (p.seat_number) initial[p.ticket_number] = p.seat_number
        })
        return initial
    })
    
    // Активным может быть только тот, кому нужно место
    const [activeTicket, setActiveTicket] = useState<string>(
        passengersNeedSeats.find(p => !p.seat_number)?.ticket_number || passengersNeedSeats[0].ticket_number
    )
    
    const [isPending, setIsPending] = useState(false)

    // ... (getSeatPrice, calculateFinancials, handleSeatClick - БЕЗ ИЗМЕНЕНИЙ) ...
    // Вставьте сюда те же функции, что были в прошлом ответе.
    // Важно: в handleSeatClick, nextPassenger ищем только среди passengersNeedSeats!
    
    // --- ПОВТОРЯЮ ФУНКЦИИ ДЛЯ КОНТЕКСТА ---
    const getBaseSeatPrice = (row: number, letter: string) => {
        let price = 0
        if (layout.rowPrices?.[row.toString()]) price += layout.rowPrices[row.toString()]
        if (layout.prices?.[letter]) price += layout.prices[letter]
        return price
    }

    const calculateFinancials = () => {
        const seats = Object.values(selections);
        let baseTotal = 0;
        let neighborSurcharge = 0;

        seats.forEach(seat => {
            const row = parseInt(seat);
            const letter = seat.replace(/[0-9]/g, '');
            baseTotal += getBaseSeatPrice(row, letter);
        });

        const rowsMap: Record<string, number[]> = {};
        seats.forEach(seat => {
            const row = seat.match(/\d+/)?.[0] || "";
            const letter = seat.replace(/\d+/, "");
            const letterIndex = layout.letters.indexOf(letter);
            if (!rowsMap[row]) rowsMap[row] = [];
            rowsMap[row].push(letterIndex);
        });

        Object.values(rowsMap).forEach(indices => {
            indices.sort((a, b) => a - b);
            for (let i = 0; i < indices.length - 1; i++) {
                if (indices[i + 1] === indices[i] + 1) {
                    neighborSurcharge += 500;
                }
            }
        });

        return { baseTotal, neighborSurcharge, total: baseTotal + neighborSurcharge };
    }
    const financials = calculateFinancials();

    const handleSeatClick = (seatId: string) => {
        if (occupiedSeats.includes(seatId) && !Object.values(selections).includes(seatId)) return

        const occupiedByFamily = Object.entries(selections).find(([ticket, seat]) => seat === seatId && ticket !== activeTicket)
        if (occupiedByFamily) {
            setActiveTicket(occupiedByFamily[0])
            return
        }

        setSelections(prev => ({ ...prev, [activeTicket]: seatId }))

        // Ищем следующего пассажира ТОЛЬКО среди тех, кому нужно место
        const nextPassenger = passengersNeedSeats.find(p => p.ticket_number !== activeTicket && !selections[p.ticket_number])
        if (nextPassenger) {
            setActiveTicket(nextPassenger.ticket_number)
        }
    }
    // ---------------------------------------

    const handleConfirm = async () => {
        // Проверяем только тех, кому нужны места
        if (Object.keys(selections).length < passengersNeedSeats.length) {
            toast.error("Пожалуйста, выберите места для всех взрослых и детей")
            return
        }

        setIsPending(true)
        try {
            // Важно: передаем еще и список младенцев, чтобы сервер их тоже зарегистрировал
            const infantTickets = passengers.filter(p => p.is_infant).map(p => p.ticket_number);
            await processGroupCheckIn(selections, infantTickets)
        } catch (e) {
            toast.error("Ошибка сохранения")
            setIsPending(false)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 flex flex-col h-full">
                <div className="flex-1 space-y-3">
                    <h3 className="font-bold text-lg mb-4">Пассажиры</h3>
                    {passengers.map((p) => {
                        const selectedSeat = selections[p.ticket_number]
                        const isActive = activeTicket === p.ticket_number
                        const seatPrice = selectedSeat ? getBaseSeatPrice(parseInt(selectedSeat), selectedSeat.replace(/[0-9]/g, '')) : 0;

                        // РЕНДЕР ДЛЯ МЛАДЕНЦА
                        if (p.is_infant) {
                            return (
                                <div key={p.ticket_number} className="p-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex justify-between items-center opacity-80 cursor-default">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className="p-2 rounded-full bg-orange-100 text-orange-600">
                                            <Baby className="h-4 w-4" />
                                        </div>
                                        <div className="truncate">
                                            <p className="text-sm font-medium">{p.first_name}</p>
                                            <p className="text-xs text-gray-500">Младенец</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">На руках</span>
                                </div>
                            )
                        }

                        // РЕНДЕР ДЛЯ ОБЫЧНОГО ПАССАЖИРА
                        return (
                            <div 
                                key={p.ticket_number}
                                onClick={() => setActiveTicket(p.ticket_number)}
                                className={cn(
                                    "p-3 rounded-lg border cursor-pointer transition-all flex justify-between items-center",
                                    isActive ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-gray-200 hover:bg-gray-50",
                                    selectedSeat && !isActive ? "bg-green-50 border-green-200" : ""
                                )}
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div className={cn("p-2 rounded-full", isActive ? "bg-blue-200 text-blue-700" : "bg-gray-200 text-gray-500")}>
                                        <User className="h-4 w-4" />
                                    </div>
                                    <div className="truncate">
                                        <p className="text-sm font-medium">{p.first_name}</p>
                                        {seatPrice > 0 && <span className="text-[10px] text-purple-600 font-bold">+{seatPrice}₽</span>}
                                    </div>
                                </div>
                                {selectedSeat ? (
                                    <span className="font-bold text-blue-600 bg-white px-2 py-1 rounded border text-xs min-w-[30px] text-center">
                                        {selectedSeat}
                                    </span>
                                ) : (
                                    <span className="text-xs text-gray-400">Выбрать</span>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* ИТОГОВЫЙ БЛОК */}
                <div className="mt-6 pt-4 border-t bg-white sticky bottom-0 lg:static z-10 pb-4 lg:pb-0 space-y-2">
                    {financials.neighborSurcharge > 0 && (
                        <div className="flex justify-between items-center text-sm text-orange-600 bg-orange-50 p-2 rounded">
                            <span className="flex items-center gap-1"><Users className="h-4 w-4"/> Выбор мест рядом:</span>
                            <span className="font-bold">+{financials.neighborSurcharge} ₽</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600">Итого к оплате:</span>
                        <span className={cn("text-xl font-bold", financials.total > 0 ? "text-purple-600" : "text-green-600")}>
                            {financials.total > 0 ? `${financials.total} ₽` : "Бесплатно"}
                        </span>
                    </div>
                    <Button 
                        onClick={handleConfirm} 
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={isPending || Object.keys(selections).length < passengersNeedSeats.length}
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {financials.total > 0 ? "Перейти к оплате" : "Зарегистрировать всех"}
                    </Button>
                </div>
            </div>

            {/* ПРАВАЯ КОЛОНКА (КАРТА - без изменений, код большой, не дублирую, он такой же как в прошлом ответе) */}
            <div className="lg:col-span-3 flex flex-col gap-6">
                 {/* ... (Ваш код отрисовки карты с прошлого ответа) ... */}
                 {/* Только убедитесь, что когда рендерите карту, вы берете layout из пропсов */}
                 {/* Вставьте сюда блок <div className='flex flex-wrap...'> (легенда) и <div className="bg-white..."> (сетка) */}
                 {/* ... */}
                 {/* Для полноты картины вставлю сокращенный рендер карты, чтобы файл был рабочим: */}
                 <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col items-center flex-1 min-h-[500px]">
                    <div className="flex flex-col gap-2 overflow-auto max-h-[600px] w-full items-center">
                        {Array.from({ length: layout.rows }).map((_, i) => {
                            const rowNum = i + 1
                            return (
                                <div key={rowNum} className="flex items-center justify-center gap-3">
                                    <span className="w-6 text-xs text-gray-400 text-center">{rowNum}</span>
                                    {layout.letters.map((letter: string) => {
                                        const seatId = `${rowNum}${letter}`
                                        const isTaken = occupiedSeats.includes(seatId) && !Object.values(selections).includes(seatId)
                                        const selectedByTicket = Object.keys(selections).find(k => selections[k] === seatId)
                                        const isSelected = !!selectedByTicket
                                        const isMyActive = selectedByTicket === activeTicket 
                                        const passengerName = selectedByTicket ? passengers.find(p => p.ticket_number === selectedByTicket)?.first_name : ''
                                        const price = getBaseSeatPrice(rowNum, letter) // Используем getBaseSeatPrice
                                        const isPaid = price > 0

                                        return (
                                            <button
                                                key={seatId}
                                                disabled={isTaken || isPending}
                                                onClick={() => handleSeatClick(seatId)}
                                                className={cn(
                                                    "w-9 h-9 rounded-md text-[10px] font-bold flex flex-col items-center justify-center transition-all relative",
                                                    isTaken ? "bg-gray-200 text-gray-400 cursor-not-allowed" :
                                                    isMyActive ? "bg-green-600 text-white shadow-md scale-110 z-20 ring-2 ring-offset-1 ring-green-400" :
                                                    isSelected ? "bg-green-200 text-green-900 border border-green-300" :
                                                    isPaid ? "bg-purple-50 border-purple-200 text-purple-900 hover:bg-purple-100" :
                                                    "bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100"
                                                )}
                                            >
                                                {isSelected ? <span className="text-[9px] uppercase">{passengerName ? passengerName[0] : <Check className="h-3 w-3"/>}</span> : <span>{letter}</span>}
                                                {!isTaken && !isSelected && isPaid && <span className="text-[7px] opacity-70">{price}</span>}
                                            </button>
                                        )
                                    })}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}