import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from '@/components/ui/popover'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
interface DatePickerProps {
	value?: Date
	onChange: (date?: Date) => void
	disablePastDates?: boolean
}

export function DatePicker({
	value,
	onChange,
	disablePastDates = false
}: DatePickerProps) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={'outline'}
					className={cn(
						'w-full justify-start text-left font-normal',
						!value && 'text-muted-foreground'
					)}
				>
					<CalendarIcon className='mr-2 h-4 w-4' />
					{value ? (
						format(value, 'PPP', { locale: ru })
					) : (
						<span>Выберите дату</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-auto p-0'>
				<Calendar
					mode='single'
					selected={value}
					onSelect={onChange}
					locale={ru}
					disabled={disablePastDates ? { before: new Date() } : undefined}
				/>
			</PopoverContent>
		</Popover>
	)
}
