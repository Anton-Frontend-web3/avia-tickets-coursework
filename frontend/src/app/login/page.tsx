'use client' // <-- Эта страница теперь КЛИЕНТСКАЯ

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react' // <-- 1. Импортируем signIn с клиента
import { toast } from 'sonner'
import { z } from 'zod'

import { AuthForm } from '@/components/custom-ui/AuthForm'

const formSchema = z.object({
	email: z.email(),
	password: z.string()
})

export default function LoginPage() {
	const router = useRouter()

	const handleSignIn = async (data: z.infer<typeof formSchema>) => {
		const result = await signIn('credentials', {
			redirect: false,
			email: data.email,
			password: data.password
		})

		if (result?.error) {
			toast.error('Ошибка входа', { description: 'Неверный email или пароль.' })
		} else {
			toast.success('Вход выполнен успешно!')

			router.push('/profile')
			router.refresh()
			await new Promise(() => {})
		}
	}

	return (
		<div className='flex w-full flex-col items-center justify-center pt-16'>
			<h1 className='mb-4 text-2xl font-bold'>С возвращением!</h1>
			<AuthForm
				action={handleSignIn}
				buttonText='Войти'
				pendingButtonText='Вход...'
			/>

			<p className='text-muted-foreground mt-4 text-sm'>
				Еще нет аккаунта?{' '}
				<Link
					href='/register'
					className='text-primary font-semibold hover:underline'
				>
					Зарегистрироваться
				</Link>
			</p>
		</div>
	)
}
