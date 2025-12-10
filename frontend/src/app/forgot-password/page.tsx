'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { toast } from 'sonner'
import { forgotPassword } from '@/lib/actions'

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

// Схема только для Email
const formSchema = z.object({
	email: z.email({ message: 'Введите корректный email.' })
})

export default function ForgotPasswordPage() {
	const [isPending, startTransition] = useTransition()

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { email: '' }
	})

	function onSubmit(values: z.infer<typeof formSchema>) {
		startTransition(async () => {
			const result = await forgotPassword(values.email)
			
			if (result.success) {
				toast.success('Письмо отправлено!', {
					description: 'Проверьте вашу почту (включая папку Спам).'
				})
			} else {
				toast.error('Ошибка', { description: result.error })
			}
		})
	}

	return (
		<div className='flex min-h-[80vh] w-full flex-col items-center justify-center px-4'>
			<div className='w-full max-w-sm space-y-6'>
				<div className='space-y-2 text-center'>
					<h1 className='text-2xl font-bold'>Восстановление пароля</h1>
					<p className='text-muted-foreground text-sm'>
						Введите email, привязанный к аккаунту
					</p>
				</div>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className='space-y-4'
					>
						<FormField
							control={form.control}
							name='email'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											placeholder='name@example.com'
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
							{isPending ? 'Отправка...' : 'Сбросить пароль'}
						</Button>
					</form>
				</Form>

				<div className='text-center text-sm'>
					<Link
						href='/login'
						className='text-primary hover:underline'
					>
						Вернуться ко входу
					</Link>
				</div>
			</div>
		</div>
	)
}