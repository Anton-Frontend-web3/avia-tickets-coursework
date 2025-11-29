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
		<div className='mt-6 grid grid-cols-1 gap-6 border-t border-gray-100 pt-6 sm:grid-cols-2'>
			{/* --- ВЫБОР ТИПА ДОКУМЕНТА --- */}
			<div className='pb-6 sm:col-span-2'>
				{' '}
				{/* pb-6 резерв места под ошибку */}
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

			{/* --- ЛОГИКА ДЛЯ СВИДЕТЕЛЬСТВА О РОЖДЕНИИ --- */}
			{documentType === 'birth_certificate' ? (
				<div className='grid grid-cols-12 items-start gap-4 sm:col-span-2'>
					{/* 1. Серия (Римские цифры) */}
					<div className='relative col-span-4 pb-6'>
						<FormLabel className='text-muted-foreground mb-2 block text-xs'>
							Серия
						</FormLabel>
						<Select
							value={romanPart} // Значение берется из useWatch
							onValueChange={newRoman => {
								// Берем текущие буквы (или пустую строку) и склеиваем
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

					{/* 2. Серия (Буквы Кириллицы) */}
					<div className='relative col-span-3 pb-6'>
						<FormLabel className='text-muted-foreground mb-2 block text-xs'>
							Буквы
						</FormLabel>
						<Input
							value={lettersPart} // Значение берется из useWatch
							placeholder='АА'
							maxLength={2}
							onChange={e => {
								// Оставляем только кириллицу и переводим в верхний регистр
								const val = e.target.value
									.replace(/[^а-яА-Я]/g, '')
									.toUpperCase()
								// Если римская цифра еще не выбрана, ставим 'I' по умолчанию
								const currentRoman = romanPart || 'I'
								const newValue = `${currentRoman}-${val}`
								setValue(`passengers.${index}.documentSeries`, newValue, {
									shouldValidate: true
								})
							}}
						/>
					</div>

					{/* 3. Номер документа */}
					<div className='relative col-span-5 pb-6'>
						<FormField
							control={control}
							name={`passengers.${index}.documentNumber`}
							render={({ field }) => (
								<FormItem className='relative space-y-0'>
									<FormLabel className='text-muted-foreground mb-2 block text-xs'>
										Номер
									</FormLabel>
									<FormControl>
										<Input
											placeholder='123456'
											maxLength={6}
											inputMode='numeric'
											{...field}
										/>
									</FormControl>
									<FormMessage className='absolute top-full left-0 mt-1 text-xs text-red-500' />
								</FormItem>
							)}
						/>
					</div>

					{/* 4. СКРЫТОЕ ПОЛЕ ДЛЯ ОШИБКИ СЕРИИ */}
					{/* Это поле невидимо, но оно отображает ошибку для documentSeries (например, "Введите серию") */}
					<div className='relative col-span-12 -mt-6 h-4'>
						<FormField
							control={control}
							name={`passengers.${index}.documentSeries`}
							render={({ fieldState }) => (
								<p className='absolute top-0 left-0 text-xs text-red-500'>
									{fieldState.error?.message}
								</p>
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
