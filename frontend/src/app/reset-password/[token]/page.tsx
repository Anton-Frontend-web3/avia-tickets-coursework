'use client'

import { useTransition, use } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { resetPassword } from '@/lib/actions'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form'

// Схема для пароля с подтверждением
const formSchema = z
	.object({
		password: z.string().min(8, 'Минимум 8 символов'),
		confirmPassword: z.string()
	})
	.refine(data => data.password === data.confirmPassword, {
		message: 'Пароли не совпадают',
		path: ['confirmPassword']
	})

interface PageProps {
	params: Promise<{ token: string }>
}

export default function ResetPasswordPage({ params }: PageProps) {
	// В Next.js 15 params это Promise, используем use() для разворачивания
	const { token } = use(params)
	
	const router = useRouter()
	const [isPending, startTransition] = useTransition()

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { password: '', confirmPassword: '' }
	})

	function onSubmit(values: z.infer<typeof formSchema>) {
		startTransition(async () => {
			const result = await resetPassword(token, values.password)

			if (result.success) {
				toast.success('Пароль успешно изменен!')
				router.push('/login')
			} else {
				toast.error('Ошибка', { description: result.error })
			}
		})
	}

	return (
		<div className='flex min-h-[80vh] w-full flex-col items-center justify-center px-4'>
			<div className='w-full max-w-sm space-y-6'>
				<div className='space-y-2 text-center'>
					<h1 className='text-2xl font-bold'>Новый пароль</h1>
					<p className='text-muted-foreground text-sm'>
						Придумайте новый надежный пароль
					</p>
				</div>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className='space-y-4'
					>
						<FormField
							control={form.control}
							name='password'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Новый пароль</FormLabel>
									<FormControl>
										<Input
											type='password'
											placeholder='••••••••'
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='confirmPassword'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Подтвердите пароль</FormLabel>
									<FormControl>
										<Input
											type='password'
											placeholder='••••••••'
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button
							type='submit'
							className='w-full'
							disabled={isPending}
						>
							{isPending ? 'Сохранение...' : 'Сохранить пароль'}
						</Button>
					</form>
				</Form>
			</div>
		</div>
	)
}