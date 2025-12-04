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
				router.refresh() // Обновляем UI
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
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Вы уверены?</AlertDialogTitle>
					<AlertDialogDescription>
						Это действие отменит ваше бронирование. Статус билета изменится на
						"Отменен". Это действие необратимо.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Отмена</AlertDialogCancel>
					<AlertDialogAction
						onClick={e => {
							e.preventDefault() // Предотвращаем автоматическое закрытие
							handleCancel()
						}}
						className='bg-red-600 hover:bg-red-700 focus:ring-red-600'
						disabled={isPending}
					>
						{isPending ? 'Возврат...' : 'Да, вернуть билет'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
