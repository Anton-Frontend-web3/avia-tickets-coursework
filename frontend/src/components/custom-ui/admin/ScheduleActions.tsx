'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { deleteSchedule } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/components/ui/alert-dialog'

interface Props {
	scheduleId: number
}

export function ScheduleActions({ scheduleId }: Props) {
	const [isPending, startTransition] = useTransition()
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)

	const handleDelete = () => {
		setShowDeleteDialog(false)
		startTransition(async () => {
			const result = await deleteSchedule(scheduleId)
			if (result.success) {
				toast.success('Расписание удалено')
			} else {
				toast.error(result.error)
			}
		})
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant='ghost'
						className='h-8 w-8 p-0'
						disabled={isPending}
					>
						<span className='sr-only'>Открыть меню</span>
						<MoreHorizontal className='h-4 w-4' />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='end'>
					<DropdownMenuLabel>Действия</DropdownMenuLabel>

					{/* Ссылка на редактирование */}
					<Link href={`/admin/schedules/${scheduleId}`}>
						<DropdownMenuItem className='cursor-pointer'>
							<Pencil className='mr-2 h-4 w-4' />
							Изменить
						</DropdownMenuItem>
					</Link>

					{/* Кнопка удаления */}
					<DropdownMenuItem
						onClick={() => setShowDeleteDialog(true)}
						className='text-destructive focus:text-destructive cursor-pointer'
					>
						<Trash2 className='mr-2 h-4 w-4' />
						Удалить
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Модальное окно подтверждения */}
			<AlertDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Вы абсолютно уверены?</AlertDialogTitle>
						<AlertDialogDescription>
							Это действие нельзя отменить. Расписание будет удалено из базы
							данных.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Отмена</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
						>
							{isPending ? 'Удаление...' : 'Удалить'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
