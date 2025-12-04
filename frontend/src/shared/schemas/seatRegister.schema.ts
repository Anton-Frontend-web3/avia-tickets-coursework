import { z } from 'zod'

export const checkInAuthSchema = z.object({
	ticketNumber: z.string().min(1, 'Введите номер билета'),
	lastName: z.string().min(1, 'Введите фамилию')
})

export type CheckInAuthValues = z.infer<typeof checkInAuthSchema>
