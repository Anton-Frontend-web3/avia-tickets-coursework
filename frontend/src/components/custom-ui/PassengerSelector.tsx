'use client'

import { Users, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface PassengerCounts {
	adults: number
	children: number
	infants: number
}

interface PassengerSelectorProps {
	value: PassengerCounts
	onChange: (value: PassengerCounts) => void
}

// КОНСТАНТА ДЛЯ МАКСИМАЛЬНОГО КОЛИЧЕСТВА ПАССАЖИРОВ
const MAX_PASSENGERS = 5

export function PassengerSelector({ value, onChange }: PassengerSelectorProps) {
	const counts = {
		adults: value?.adults ?? 1,
		children: value?.children ?? 0,
		infants: value?.infants ?? 0
	}

	// Считаем ОБЩЕЕ количество всех пассажиров
	const totalCount = counts.adults + counts.children + counts.infants

	const updateCount = (type: keyof PassengerCounts, delta: number) => {
		const current = counts[type]
		const updated = current + delta

		// Проверки:

		// 1. Нельзя меньше 0
		if (updated < 0) return

		// 2. Взрослых не меньше 1
		if (type === 'adults' && updated < 1) return

		// 3. Не превышаем общий лимит (MAX_PASSENGERS)
		// Если мы увеличиваем (delta > 0) и общее число уже достигло максимума, запрещаем
		if (delta > 0 && totalCount >= MAX_PASSENGERS) return

		// 4. Специфическое правило для младенцев: их не может быть больше, чем взрослых
		// (обычно 1 младенец на руках у 1 взрослого)
		if (type === 'infants' && updated > counts.adults) return
		// Если уменьшаем взрослых, проверяем, чтобы младенцев не осталось больше, чем взрослых
		if (type === 'adults' && updated < counts.infants) {
			// Если взрослых становится меньше, уменьшаем и младенцев
			onChange({ ...counts, adults: updated, infants: updated })
			return
		}

		onChange({ ...counts, [type]: updated })
	}

	// Вспомогательный компонент
	const CounterRow = ({
		label,
		subLabel,
		count,
		onDecrement,
		onIncrement,
		min = 0
		// Убираем max из пропсов, так как проверка теперь общая
	}: {
		label: string
		subLabel: string
		count: number
		onDecrement: () => void
		onIncrement: () => void
		min?: number
	}) => (
		<div className='flex items-center justify-between border-b py-3 last:border-0'>
			<div className='flex flex-col'>
				<span className='text-sm font-medium'>{label}</span>
				<span className='text-muted-foreground text-xs'>{subLabel}</span>
			</div>
			<div className='flex items-center gap-3'>
				<Button
					type='button'
					variant='outline'
					size='icon'
					className='h-8 w-8 rounded-md border-none bg-slate-100 text-slate-600 hover:bg-slate-200'
					onClick={onDecrement}
					disabled={count <= min}
				>
					<Minus className='h-3 w-3' />
				</Button>
				<span className='w-4 text-center text-sm font-medium'>{count}</span>
				<Button
					type='button'
					variant='outline'
					size='icon'
					className='h-8 w-8 rounded-md border-none bg-blue-50 text-blue-600 hover:bg-blue-100'
					onClick={onIncrement}
					// Кнопка "+" блокируется, если достигнут ОБЩИЙ лимит
					// ИЛИ (для младенцев) если их количество догоняет количество взрослых
					disabled={
						totalCount >= MAX_PASSENGERS ||
						(label === 'Младенцы' && count >= counts.adults)
					}
				>
					<Plus className='h-3 w-3' />
				</Button>
			</div>
		</div>
	)

	const getLabel = () => {
		let label = `${counts.adults + counts.children} пасс.`
		if (counts.infants > 0) {
			label += `, ${counts.infants} млад.`
		}
		return label
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant='outline'
					className={cn(
						'w-full justify-start text-left font-normal',
						!value && 'text-muted-foreground'
					)}
				>
					<Users className='mr-2 h-4 w-4' />
					<span>{getLabel()}</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className='w-80 p-4'
				align='start'
			>
				<div className='flex flex-col'>
					<CounterRow
						label='Взрослые'
						subLabel='12 лет и старше'
						count={counts.adults}
						onDecrement={() => updateCount('adults', -1)}
						onIncrement={() => updateCount('adults', 1)}
						min={1}
					/>
					<CounterRow
						label='Дети'
						subLabel='от 2 до 12 лет'
						count={counts.children}
						onDecrement={() => updateCount('children', -1)}
						onIncrement={() => updateCount('children', 1)}
					/>
					<CounterRow
						label='Младенцы'
						subLabel='до 2 лет, без места'
						count={counts.infants}
						onDecrement={() => updateCount('infants', -1)}
						onIncrement={() => updateCount('infants', 1)}
					/>
				</div>
			</PopoverContent>
		</Popover>
	)
}
