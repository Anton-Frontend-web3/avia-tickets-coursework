'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { DateRange } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from '@/components/ui/popover'

// Обновляем интерфейс
interface DatePickerProps {
	value: DateRange | undefined 
	onChange: (date: DateRange | undefined) => void
	disablePastDates?: boolean
}

export function DatePicker({
	value,
	onChange,
	disablePastDates
}: DatePickerProps) {
	return (
		<div className={cn('grid gap-2')}>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						id='date'
						variant={'outline'}
						className={cn(
							'w-full justify-start text-left font-normal',
							!value && 'text-muted-foreground'
						)}
					>
						<CalendarIcon className='mr-2 h-4 w-4' />
						{value?.from ? (
							value.to ? (
								<>
									{format(value.from, 'dd MMM yyyy', { locale: ru })} -{' '}
									{format(value.to, 'dd MMM yyyy', { locale: ru })}
								</>
							) : (
								format(value.from, 'dd MMM yyyy', { locale: ru })
							)
						) : (
							<span>Выберите даты</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className='w-auto p-0'
					align='start'
					side='bottom' 
					avoidCollisions={false}
					collisionPadding={10} 
					
				>
					<Calendar
						mode='range'
						defaultMonth={value?.from}
						selected={value}
						onSelect={onChange}
						numberOfMonths={2}
						disabled={date =>
							disablePastDates
								? date < new Date(new Date().setHours(0, 0, 0, 0))
								: false
						}
					/>
				</PopoverContent>
			</Popover>
		</div>
	)
}
