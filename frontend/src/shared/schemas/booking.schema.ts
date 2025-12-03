import { z } from 'zod'
import { differenceInYears, parseISO, isAfter } from 'date-fns'

// 1. Базовая схема для одного пассажира
export const singlePassengerSchema = z
	.object({
		// Тип пассажира (приходит с фронта, скрытое поле)
		type: z.enum(['adult', 'child', 'infant'], {
			message: 'Выберите тип пассажира.'
		}),

		lastName: z
			.string()
			.min(1, { message: 'Фамилия обязательна.' })
			.max(50, { message: 'Слишком длинная фамилия (макс. 50 символов).' }),
		firstName: z
			.string()
			.min(1, { message: 'Имя обязательно.' })
			.max(50, { message: 'Слишком длинное имя (макс. 50 символов).' }),
		hasNoMiddleName: z.boolean(),
		middleName: z
			.string()
			.optional()
			.refine(val => !val || val.length <= 50, {
				message: 'Слишком длинное отчество (макс. 50 символов).'
			}),

		birthDate: z
			.string({ message: 'Выберите дату рождения.' })
			.regex(/^\d{4}-\d{2}-\d{2}$/, {
				message: 'Неверный формат даты (YYYY-MM-DD).'
			})
			.refine(
				dateString => {
					const date = parseISO(dateString)
					return !isNaN(date.getTime()) && isAfter(new Date(), date) // Valid past date
				},
				{ message: 'Дата рождения должна быть в прошлом и действительной.' }
			),

		gender: z.enum(['male', 'female'], { message: 'Выберите пол.' }),

		documentType: z.enum(
			['passport_rf', 'passport_international', 'birth_certificate'],
			{ message: 'Выберите тип документа.' }
		),
		documentSeries: z
			.string()
			.max(10, { message: 'Серия слишком длинная (макс. 10 символов).' })
			.optional(),
		documentNumber: z
			.string()
			.min(1, { message: 'Введите номер документа.' })
			.max(20, { message: 'Номер слишком длинный (макс. 20 символов).' }),
		validUntil: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		const birthDate = parseISO(data.birthDate)
		const age = differenceInYears(new Date(), birthDate)

		// Валидация возраста по типу
		if (data.type === 'adult' && age < 12) {
			ctx.addIssue({
				code: 'custom',
				message: 'Взрослый должен быть не младше 12 лет.',
				path: ['birthDate']
			})
		}
		if (data.type === 'child' && (age >= 12 || age < 2)) {
			ctx.addIssue({
				code: 'custom',
				message: 'Ребенок: от 2 до 11 лет.',
				path: ['birthDate']
			})
		}
		if (data.type === 'infant' && age >= 2) {
			ctx.addIssue({
				code: 'custom',
				message: 'Младенец: младше 2 лет.',
				path: ['birthDate']
			})
		}

		// Валидация отчества
		if (
			!data.hasNoMiddleName &&
			(!data.middleName || data.middleName.trim().length < 1)
		) {
			ctx.addIssue({
				code: 'custom',
				message: 'Введите отчество или отметьте, что его нет.',
				path: ['middleName']
			})
		}

		// --- ВАЛИДАЦИЯ ДОКУМЕНТОВ ---

		// 1. Свидетельство о рождении
		if (data.documentType === 'birth_certificate') {
			if (!data.documentSeries || data.documentSeries.trim().length < 1) {
				ctx.addIssue({
					code: 'custom',
					message: 'Введите серию свидетельства о рождении.',
					path: ['documentSeries']
				})
			} else if (!/^[IVXLC]{1,4}-[А-Я]{2}$/i.test(data.documentSeries)) {
				ctx.addIssue({
					code: 'custom',
					message: 'Формат серии: I-АА (римские - дефис - кириллица).',
					path: ['documentSeries']
				})
			}

			// ИЗМЕНЕНО: Минимум 6, максимум 10 символов
			if (data.documentNumber.length < 6 || data.documentNumber.length > 10) {
				ctx.addIssue({
					code: 'custom',
					message: 'Номер свидетельства: от 6 до 10 символов.',
					path: ['documentNumber']
				})
			}

			if (age >= 14) {
				ctx.addIssue({
					code: 'custom',
					message: 'Свидетельство о рождении для пассажиров младше 14 лет.',
					path: ['documentType']
				})
			}
		}

		// 2. Паспорт РФ
		if (data.documentType === 'passport_rf') {
			if (age < 14) {
				ctx.addIssue({
					code: 'custom',
					message: 'Паспорт РФ доступен с 14 лет.',
					path: ['birthDate']
				})
			}

			// ИЗМЕНЕНО: Ровно 4 цифры
			if (!data.documentSeries || !/^\d{4}$/.test(data.documentSeries)) {
				ctx.addIssue({
					code: 'custom',
					message: 'Серия паспорта РФ: ровно 4 цифры.',
					path: ['documentSeries']
				})
			}

			if (!/^\d{6}$/.test(data.documentNumber)) {
				ctx.addIssue({
					code: 'custom',
					message: 'Номер паспорта РФ: ровно 6 цифр.',
					path: ['documentNumber']
				})
			}
		}

		// 3. Загранпаспорт РФ
		if (data.documentType === 'passport_international') {
			if (!data.validUntil) {
				ctx.addIssue({
					code: 'custom',
					message: 'Введите дату истечения срока для загранпаспорта.',
					path: ['validUntil']
				})
			} else {
				const expiryDate = parseISO(data.validUntil)
				if (
					!/^\d{4}-\d{2}-\d{2}$/.test(data.validUntil) ||
					isNaN(expiryDate.getTime()) ||
					!isAfter(expiryDate, new Date())
				) {
					ctx.addIssue({
						code: 'custom',
						message: 'Дата истечения должна быть в будущем.',
						path: ['validUntil']
					})
				}
			}
			// Номер загранпаспорта старого образца (9 цифр) или нового (9 цифр), серия (2 цифры)
			if (!/^\d{9}$/.test(data.documentNumber)) {
				ctx.addIssue({
					code: 'custom',
					message: 'Номер загранпаспорта: ровно 9 цифр.',
					path: ['documentNumber']
				})
			}
			// Для загранпаспорта серию обычно проверяют отдельно (2 цифры), если она есть в форме
			if (data.documentSeries && !/^\d{2}$/.test(data.documentSeries)) {
				ctx.addIssue({
					code: 'custom',
					message: 'Серия загранпаспорта: ровно 2 цифры.',
					path: ['documentSeries']
				})
			}
		}
	})

// 2. Главная схема для отправки формы (содержит массив и ID рейса)
export const bookingFormSchema = z.object({
	flightId: z.number({ message: 'Укажите ID рейса.' }),
	passengers: z
		.array(singlePassengerSchema)
		.min(1, { message: 'Нужен хотя бы 1 пассажир.' })
})

export type BookingFormValues = z.infer<typeof bookingFormSchema>
export type SinglePassengerValues = z.infer<typeof singlePassengerSchema>
