'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface ReservationTimerProps {
    expiresAt: Date | null
}

export function ReservationTimer({ expiresAt }: ReservationTimerProps) {
    const [timeLeft, setTimeLeft] = useState<string>("")

    useEffect(() => {
        if (!expiresAt) {
            setTimeLeft("")
            return
        }

        const updateTimer = () => {
            const now = new Date().getTime()
            const end = new Date(expiresAt).getTime()
            const diff = end - now

            if (diff <= 0) {
                setTimeLeft("00:00")
            } else {
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                const seconds = Math.floor((diff % (1000 * 60)) / 1000)
                setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`)
            }
        }

        updateTimer()
        const timer = setInterval(updateTimer, 1000)
        return () => clearInterval(timer)
    }, [expiresAt])

    if (!expiresAt || timeLeft === "00:00") return null

    return (
        <div className="flex items-center justify-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg border border-yellow-200 mb-4 animate-in fade-in slide-in-from-top-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">
                Бронь истекает через: <span className="font-mono font-bold text-lg">{timeLeft}</span>
            </span>
        </div>
    )
}