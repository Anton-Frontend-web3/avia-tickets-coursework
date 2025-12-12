'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

// Схему zod оставляем без изменений, она идеальна
const formSchema = z.object({
	email: z.email({ message: 'Пожалуйста, введите корректный email.' }),
	password: z.string().min(8, { message: 'Пожалуйста, введите пароль.' })
})

// 1. Изменяем тип экшена
type AuthAction = (data: z.infer<typeof formSchema>) => void

interface AuthFormProps {
	action: AuthAction
	buttonText: string
	pendingButtonText: string
	footerLink?: React.ReactNode
}

export function AuthForm({
	action,
	buttonText,
	pendingButtonText,
	footerLink
}: AuthFormProps) {
	const [isPending, startTransition] = useTransition()

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { email: '', password: '' }
	})

	function handleAction(values: z.infer<typeof formSchema>) {
		startTransition(() => {
			action(values)
		})
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleAction)}
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
									placeholder='Enter email...'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='password'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Password</FormLabel>
							<FormControl>
								<Input type="password"
									placeholder='Enter password...'
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
					{isPending ? pendingButtonText : buttonText}
				</Button>
				<div className='flex justify-center'>
					{footerLink && <div className='text-sm'>{footerLink}</div>}
				</div>
			</form>
		</Form>
	)
}
