import { clsx, type ClassValue } from 'clsx'
import { differenceInMinutes, format, differenceInHours, parseISO } from 'date-fns' // Добавил parseISO
import { ru } from 'date-fns/locale'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

// 1. ИСПРАВЛЕНО: Жесткое форматирование времени
// Мы берем строку "2025-12-13T01:00:00..." и просто вырезаем "01:00"
// Это защищает от сдвига часовых поясов браузера.
export function formatTime(dateString: string | Date): string {
	const str = typeof dateString === 'string' ? dateString : dateString.toISOString()
	
    // Проверка на валидность строки, чтобы не упало
    if (!str.includes('T')) return '00:00';

    // Берем 5 символов после 'T' (часы:минуты)
	return str.split('T')[1].slice(0, 5)
}

// 2. ИСПРАВЛЕНО: Форматирование даты
export function formatDateWithDay(dateString: string | Date): string {
    const str = typeof dateString === 'string' ? dateString : dateString.toISOString()
	return format(parseISO(str), 'd MMM, EEE', { locale: ru })
}

// 3. ВНИМАНИЕ: Эта функция может врать для рейсов между часовыми поясами,
// так как dateString теперь приходят в локальном времени аэропортов.
// Лучше считать длительность на сервере (SQL), но пока оставим как есть.
export function calculateDuration(start: string | Date, end: string | Date): string {
	const startDate = new Date(start)
	const endDate = new Date(end)
	const minutes = differenceInMinutes(endDate, startDate)

	if (isNaN(minutes)) return ''

	const hours = Math.floor(minutes / 60)
	const remainingMinutes = minutes % 60
	return `${hours}ч ${remainingMinutes}м`
}

export type CheckInStatus =
	| { isOpen: true }
	| {
			isOpen: false
			reason: 'too_early' | 'too_late'
			message: string
			openTime?: Date
	  }

// 4. Логика чекина (работает корректно, если передавать реальное время сервера)
export function getCheckInStatus(departureDate: Date | string): CheckInStatus {
	const departure = new Date(departureDate)
	const now = new Date()

	const hoursBefore = differenceInHours(departure, now)
	const minutesBefore = differenceInMinutes(departure, now)

	if (hoursBefore > 24) {
		const openTime = new Date(departure.getTime() - 24 * 60 * 60 * 1000)
		return {
			isOpen: false,
			reason: 'too_early',
			message: `Онлайн-регистрация откроется ${openTime.toLocaleString('ru-RU')}`,
			openTime
		}
	}

	if (minutesBefore < 40) {
		return {
			isOpen: false,
			reason: 'too_late',
			message:
				'Онлайн-регистрация завершена. Пожалуйста, обратитесь на стойку регистрации в аэропорту.'
		}
	}

	return { isOpen: true }
}
export function formatTimeZoneOffset(dateStr: string, timeZone: string): string {
    try {
        const date = new Date(dateStr);
        // Получаем строку вида "GMT+3"
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone,
            timeZoneName: 'shortOffset',
        }).formatToParts(date);
        
        const offset = parts.find(p => p.type === 'timeZoneName')?.value;
        
        // Заменяем GMT на UTC для красоты (опционально)
        return offset ? offset.replace('GMT', 'UTC') : '';
    } catch (e) {
        return '';
    }
}