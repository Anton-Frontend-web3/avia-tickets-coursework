'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { processRandomCheckIn } from '@/lib/actions'

interface Props {
	ticketNumber: string
}

export function RandomCheckInButton({ ticketNumber }: Props) {
	const [isPending, startTransition] = useTransition()

	const handleRandomCheckIn = () => {
		startTransition(async () => {
			try {
				// Вызываем серверный экшен
				const result = await processRandomCheckIn(ticketNumber)

				// Если вернулась ошибка - показываем её
				if (result && 'error' in result) {
					toast.error(result.error)
				}
				// Если успех - произойдет редирект на сервере
			} catch (e) {
				toast.error('Произошла ошибка при регистрации')
			}
		})
	}

	return (
		<div className='rounded-xl border border-blue-100 bg-blue-50 p-6'>
			<h3 className='mb-2 flex items-center gap-2 font-semibold text-blue-900'>
				<Sparkles className='h-5 w-5 text-blue-600' />
				Мне повезет!
			</h3>
			<p className='mb-4 text-sm text-blue-700'>
				Система автоматически подберет для вас любое доступное
				<span className='font-bold'> бесплатное</span> место.
			</p>

			<Button
				onClick={handleRandomCheckIn}
				disabled={isPending}
				className='w-full bg-blue-600 hover:bg-blue-700'
			>
				{isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
				Получить случайное место
			</Button>
		</div>
	)
}
