'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cancelBooking } from '@/lib/actions'

import { Button } from '@/components/ui/button'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger
} from '@/components/ui/alert-dialog'

interface Props {
	bookingId: number
}

export function CancelBookingButton({ bookingId }: Props) {
	const [isPending, startTransition] = useTransition()
	const router = useRouter()
	const [open, setOpen] = useState(false)

	const handleCancel = () => {
		startTransition(async () => {
			const result = await cancelBooking(bookingId)

			if (result.success) {
				toast.success('Билет успешно возвращен')
				setOpen(false)
				router.refresh()
			} else {
				toast.error(result.error || 'Ошибка')
			}
		})
	}

	return (
		<AlertDialog
			open={open}
			onOpenChange={setOpen}
		>
			<AlertDialogTrigger asChild>
				<Button
					variant='destructive'
					className='w-full sm:w-auto'
				>
					Вернуть билет
				</Button>
			</AlertDialogTrigger>

			<AlertDialogContent className='bg-background border-border sm:max-w-[425px]'>
				<AlertDialogHeader>
					<AlertDialogTitle className='text-foreground'>
						Вы уверены?
					</AlertDialogTitle>
					<AlertDialogDescription className='text-muted-foreground'>
						Это действие отменит ваше бронирование. Статус билета изменится на
						"Отменен". Это действие необратимо.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel
						disabled={isPending}
						className='bg-background text-foreground border-border hover:bg-muted'
					>
						Отмена
					</AlertDialogCancel>

					<AlertDialogAction
						onClick={e => {
							e.preventDefault()
							handleCancel()
						}}
						// Адаптация красной кнопки:
						// Light: Ярко-красный фон, белый текст
						// Dark: Темно-красный фон (red-900), светлый текст (red-100) — чтобы не резало глаза
						className='bg-red-600 text-white hover:bg-red-700 dark:border-red-900 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800'
						disabled={isPending}
					>
						{isPending ? 'Возврат...' : 'Да, вернуть билет'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
