'use client'

import { Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'
import { memo } from 'react'

export interface BaggageOption {
	id: string
	name: string
	price: number
}

interface BaggageSelectorProps {
	options: BaggageOption[]
	selectedOption: BaggageOption
	onSelect: (option: BaggageOption) => void
}

function BaggageSelectorComponent({
	options,
	selectedOption,
	onSelect
}: BaggageSelectorProps) {
	return (
		// 1. Изменил ширину контейнера:
		// w-full max-w-sm — чтобы не растягивался слишком сильно
		// grid-cols-3 — держим 3 колонки всегда (чтобы были в ряд)
		<div className='mx-auto grid w-full max-w-[340px] grid-cols-3 gap-2'>
			{options.map(option => (
				<button
					key={option.id}
					onClick={() => onSelect(option)}
					className={cn(
						'flex flex-col items-center justify-center rounded-md border p-1.5 text-center transition-all',
						selectedOption.id === option.id
							? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
							: 'border-gray-300 bg-white hover:bg-gray-50'
					)}
				>
					<Briefcase className='mb-1 h-5 w-4.5 text-gray-600' />
					<p className='text-[10px] leading-tight font-semibold'>
						{option.name}
					</p>
					{option.price > 0 && (
						<p className='text-[10px] text-gray-500'>
							+ {option.price.toLocaleString('ru-RU')}
						</p>
					)}
				</button>
			))}
		</div>
	)
}

export const BaggageSelector = memo(BaggageSelectorComponent)