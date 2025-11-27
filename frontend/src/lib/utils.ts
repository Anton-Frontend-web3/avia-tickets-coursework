import { clsx, type ClassValue } from "clsx"
import { differenceInMinutes, format } from "date-fns";
import { ru } from "date-fns/locale";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(dateString: string): string {
  return format(new Date(dateString), 'HH:mm');
}

// 3. Экспортируем функцию для расчета длительности полета
export function calculateDuration(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const minutes = differenceInMinutes(endDate, startDate);
  
  if (isNaN(minutes)) return "N/A"; // Защита от невалидных дат

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}ч ${remainingMinutes}м`;
}

// 4. Экспортируем функцию для форматирования даты с днем недели
export function formatDateWithDay(dateString: string): string {
  return format(new Date(dateString), 'd MMM, EEE', { locale: ru });
}