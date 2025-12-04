import { clsx, type ClassValue } from 'clsx'
import { differenceInMinutes, format, differenceInHours } from 'date-fns'
import { ru } from 'date-fns/locale'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function formatTime(dateString: string): string {
	return format(new Date(dateString), 'HH:mm')
}

// 3. Экспортируем функцию для расчета длительности полета
export function calculateDuration(start: string, end: string): string {
	const startDate = new Date(start)
	const endDate = new Date(end)
	const minutes = differenceInMinutes(endDate, startDate)

	if (isNaN(minutes)) return 'N/A' // Защита от невалидных дат

	const hours = Math.floor(minutes / 60)
	const remainingMinutes = minutes % 60
	return `${hours}ч ${remainingMinutes}м`
}

// 4. Экспортируем функцию для форматирования даты с днем недели
export function formatDateWithDay(dateString: string): string {
	return format(new Date(dateString), 'd MMM, EEE', { locale: ru })
}

export type CheckInStatus =
	| { isOpen: true }
	| {
			isOpen: false
			reason: 'too_early' | 'too_late'
			message: string
			openTime?: Date
	  }

export function getCheckInStatus(departureDate: Date | string): CheckInStatus {
	const departure = new Date(departureDate)
	const now = new Date()

	const hoursBefore = differenceInHours(departure, now)
	const minutesBefore = differenceInMinutes(departure, now)

	// 1. Слишком рано (более 24 часов до вылета)
	if (hoursBefore > 24) {
		const openTime = new Date(departure.getTime() - 24 * 60 * 60 * 1000)
		return {
			isOpen: false,
			reason: 'too_early',
			message: `Онлайн-регистрация откроется ${openTime.toLocaleString('ru-RU')}`,
			openTime
		}
	}

	// 2. Слишком поздно (менее 40 минут до вылета)
	if (minutesBefore < 40) {
		return {
			isOpen: false,
			reason: 'too_late',
			message:
				'Онлайн-регистрация завершена. Пожалуйста, обратитесь на стойку регистрации в аэропорту.'
		}
	}

	// 3. Всё ок
	return { isOpen: true }
}
