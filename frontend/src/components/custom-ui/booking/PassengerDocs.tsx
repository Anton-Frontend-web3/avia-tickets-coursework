'use client'

import { useFormContext, useWatch } from 'react-hook-form'
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import { BookingFormValues } from '@/shared/schemas/booking.schema'

interface Props {
	index: number
}

const romanNumerals = [
	'I',
	'II',
	'III',
	'IV',
	'V',
	'VI',
	'VII',
	'VIII',
	'IX',
	'X'
]

export function PassengerDocs({ index }: Props) {
	// Используем контекст, чтобы не прокидывать control и getValues
	const { control, setValue } = useFormContext<BookingFormValues>()

	// 1. СЛЕДИМ ЗА ИЗМЕНЕНИЯМИ (РЕРЕНДЕР)
	// useWatch заставляет компонент перерисовываться при изменении этих полей
	const documentType = useWatch({
		control,
		name: `passengers.${index}.documentType`
	})
	const passengerType = useWatch({ control, name: `passengers.${index}.type` })
	const documentSeries = useWatch({
		control,
		name: `passengers.${index}.documentSeries`
	})

	// 2. ВЫЧИСЛЯЕМ ЗНАЧЕНИЯ ДЛЯ ПОЛЕЙ СВИДЕТЕЛЬСТВА
	// Разбиваем строку "I-АА" на части. Если строки нет, будут пустые строки.
	const seriesParts = (documentSeries || '').split('-')
	const romanPart = seriesParts[0] || ''
	const lettersPart = seriesParts.length > 1 ? seriesParts[1] : ''

	return (
		<div className='mt-6 grid grid-cols-1 gap-6 pt-6 sm:grid-cols-2'>
			<div className='pb-6 sm:col-span-2'>
				<FormField
					control={control}
					name={`passengers.${index}.documentType`}
					render={({ field }) => (
						<FormItem className='relative space-y-1'>
							<FormLabel>Документ</FormLabel>
							<Select
								onValueChange={val => {
									field.onChange(val)
									// Очищаем поля серии и номера при смене типа документа,
									// чтобы старые данные не мешали валидации новой схемы
									setValue(`passengers.${index}.documentSeries`, '')
									setValue(`passengers.${index}.documentNumber`, '')
								}}
								value={field.value}
								defaultValue={field.value}
							>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder='Выберите тип документа' />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{passengerType === 'adult' && (
										<>
											<SelectItem value='passport_rf'>Паспорт РФ</SelectItem>
											<SelectItem value='passport_international'>
												Загранпаспорт РФ
											</SelectItem>
										</>
									)}
									<SelectItem value='birth_certificate'>
										Свидетельство о рождении
									</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage className='absolute top-full left-0 mt-1 text-xs text-red-500' />
						</FormItem>
					)}
				/>
			</div>

			{documentType === 'birth_certificate' ? (
				<div className='col-span-2'>
					{/* Контейнер: Flex, выравнивание по верху, отступ между элементами */}
					<div className='flex w-full items-start gap-4'>
						{/* 1. Серия (Римские цифры) - Фиксированная ширина */}
						<div className='w-[80px] shrink-0'>
							<FormLabel className='text-muted-foreground mb-2 block text-xs'>
								Серия
							</FormLabel>
							<Select
								value={romanPart}
								onValueChange={newRoman => {
									const newValue = `${newRoman}-${lettersPart}`
									setValue(`passengers.${index}.documentSeries`, newValue, {
										shouldValidate: true
									})
								}}
							>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder='I' />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{romanNumerals.map(r => (
										<SelectItem
											key={r}
											value={r}
										>
											{r}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* 2. Серия (Буквы) - Фиксированная ширина */}
						<div className='w-[80px] shrink-0'>
							<FormLabel className='text-muted-foreground mb-2 block text-xs'>
								Буквы
							</FormLabel>
							<Input
								value={lettersPart}
								placeholder='АА'
								maxLength={2}
								className='uppercase'
								onChange={e => {
									const val = e.target.value
										.replace(/[^а-яА-Я]/g, '')
										.toUpperCase()
									const currentRoman = romanPart || 'I'
									const newValue = `${currentRoman}-${val}`
									setValue(`passengers.${index}.documentSeries`, newValue, {
										shouldValidate: true
									})
								}}
							/>
						</div>

						{/* 3. Номер документа - РАСТЯГИВАЕТСЯ (flex-1) */}
						<div className='flex-1'>
							<FormField
								control={control}
								name={`passengers.${index}.documentNumber`}
								render={({ field }) => (
									<FormItem className='gap-0 space-y-0'>
										<FormLabel className='text-muted-foreground mb-2 block text-xs'>
											Номер
										</FormLabel>
										<FormControl>
											<Input
												placeholder='123456'
												maxLength={6}
												inputMode='numeric'
												className='w-full' // Гарантирует ширину
												{...field}
											/>
										</FormControl>
										{/* Ошибка именно для поля "Номер" */}
										<FormMessage className='mt-1 text-xs text-red-500' />
									</FormItem>
								)}
							/>
						</div>
					</div>

					{/* 4. Общая ошибка для СЕРИИ (выводится под полями) */}
					{/* Используем стандартный FormItem + FormMessage для корректной работы */}
					<div className='mt-1 min-h-[20px]'>
						<FormField
							control={control}
							name={`passengers.${index}.documentSeries`}
							render={({ field }) => (
								<FormItem className='space-y-0'>
									{/* Мы скрываем input, так как он составной выше, но показываем ошибку */}
									<FormControl>
										<input
											type='hidden'
											{...field}
										/>
									</FormControl>
									<FormMessage className='text-xs text-red-500' />
								</FormItem>
							)}
						/>
					</div>
				</div>
			) : (
				// --- ЛОГИКА ДЛЯ ПАСПОРТОВ (РФ и Загран) ---
				<>
					{/* Серия */}
					<div className='relative pb-6'>
						<FormField
							control={control}
							name={`passengers.${index}.documentSeries`}
							render={({ field }) => (
								<FormItem className='relative space-y-1'>
									<FormLabel>Серия</FormLabel>
									<FormControl>
										<Input
											{...field}
											maxLength={
												documentType === 'passport_international' ? 2 : 4
											}
											placeholder={
												documentType === 'passport_international'
													? '75'
													: '1234'
											}
											inputMode='numeric'
										/>
									</FormControl>
									<FormMessage className='absolute top-full left-0 mt-1 text-xs text-red-500' />
								</FormItem>
							)}
						/>
					</div>

					{/* Номер */}
					<div className='relative pb-6'>
						<FormField
							control={control}
							name={`passengers.${index}.documentNumber`}
							render={({ field }) => (
								<FormItem className='relative space-y-1'>
									<FormLabel>Номер</FormLabel>
									<FormControl>
										<Input
											{...field}
											maxLength={
												documentType === 'passport_international' ? 7 : 6
											}
											placeholder={
												documentType === 'passport_international'
													? '1234567'
													: '123456'
											}
											inputMode='numeric'
										/>
									</FormControl>
									<FormMessage className='absolute top-full left-0 mt-1 text-xs text-red-500' />
								</FormItem>
							)}
						/>
					</div>
				</>
			)}

			{/* --- СРОК ДЕЙСТВИЯ (Только для загранпаспорта) --- */}
			{documentType === 'passport_international' && (
				<div className='relative pb-6'>
					<FormField
						control={control}
						name={`passengers.${index}.validUntil`}
						render={({ field }) => (
							<FormItem className='relative space-y-1'>
								<FormLabel>Срок действия</FormLabel>
								<FormControl>
									<Input
										type='date'
										min={new Date().toISOString().split('T')[0]}
										{...field}
										value={field.value || ''}
									/>
								</FormControl>
								<FormMessage className='absolute top-full left-0 mt-1 text-xs text-red-500' />
							</FormItem>
						)}
					/>
				</div>
			)}
		</div>
	)
}
