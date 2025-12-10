'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList
} from '@/components/ui/command'
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from '@/components/ui/popover'

interface CityComboBoxProps {
	cities: string[]
	isLoading: boolean
	value: string
	onChange: (value: string) => void
	placeholder?: string
}

export function CityComboBox({
	cities,
	isLoading,
	value,
	onChange,
	placeholder
}: CityComboBoxProps) {
	const [open, setOpen] = React.useState(false)

	return (
		<Popover
			open={open}
			onOpenChange={setOpen}
		>
			<PopoverTrigger asChild>
				<Button
					variant='outline'
					role='combobox'
					disabled={isLoading}
					aria-expanded={open}
					className='w-full justify-between'
				>
					<span className='flex-grow text-left'>
  {isLoading
    ? 'Loading...'
    : value
      ? cities.find(city => city === value) || value
      : placeholder ?? 'Выберите город'}
</span>
					<ChevronsUpDown className='left ml-2 h-4 w-4 shrink-0 opacity-50' />
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-[--radix-popover-trigger-width] p-0'>
				<Command>
					<CommandInput
						placeholder='Search cites...'
						className='h-9'
					/>
					<CommandList>
						<CommandEmpty>No city found.</CommandEmpty>
						<CommandGroup>
							{cities.map(city => (
								<CommandItem
									key={city}
									value={city}
									onSelect={currentValue => {
										//currentValue === value ? "" : currentValue
										onChange(currentValue)
										setOpen(false)
									}}
								>
									{city}
									<Check
										className={cn(
											'ml-auto',
											value === city ? 'opacity-100' : 'opacity-0'
										)}
									/>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}
