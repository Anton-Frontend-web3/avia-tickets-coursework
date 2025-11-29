'use client'

import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { CircleIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

function RadioGroup({
	className,
	...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
	return (
		<RadioGroupPrimitive.Root
			data-slot='radio-group'
			className={cn('grid gap-3', className)}
			{...props}
		/>
	)
}

function RadioGroupItem({
	className,
	...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
	return (
		<RadioGroupPrimitive.Item
			data-slot='radio-group-item'
			className={cn(
				// Базовые стили
				'aspect-square size-5 rounded-full',
				'border border-gray-300', // Серый по умолчанию
				'text-primary ring-offset-background',

				// --- ИЗМЕНЕНИЯ ЗДЕСЬ ---
				// При наведении рамка становится черной
				'transition-colors hover:border-black hover:bg-gray-100',

				'focus-visible:ring-ring focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
				'disabled:cursor-not-allowed disabled:opacity-50',

				// Стили для выбранного состояния (заливка черным/primary)
				'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary',
				className
			)}
			{...props}
		>
			<RadioGroupPrimitive.Indicator
				data-slot='radio-group-indicator'
				className='relative flex items-center justify-center'
			>
				<CircleIcon className='size-2.5 fill-current' />
			</RadioGroupPrimitive.Indicator>
		</RadioGroupPrimitive.Item>
	)
}

export { RadioGroup, RadioGroupItem }
