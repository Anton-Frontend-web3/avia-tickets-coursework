'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { z } from 'zod'
import { signIn, useSession } from 'next-auth/react' // <--- Добавляем useSession
import { useEffect } from 'react' // <--- Добавляем useEffect

import { AuthForm } from '@/components/custom-ui/auth/AuthForm' // Проверьте путь к компоненту


const formSchema = z.object({
	email: z.email(),
	password: z.string()
})

export default function LoginPage() {
	const router = useRouter()
    
    // 1. Получаем статус сессии
    const { status } = useSession()

    // 2. Если пользователь уже авторизован — сразу уводим его отсюда
    useEffect(() => {
        if (status === 'authenticated') {
            router.replace('/profile')
        }
    }, [status, router])

	const handleLogin = async (data: z.infer<typeof formSchema>) => {
		const res = await signIn('credentials', {
			email: data.email,
			password: data.password,
			redirect: false,
		})

		if (res?.error) {
			toast.error('Ошибка входа', {
				description: 'Неверный email или пароль.'
			})
		} else {
			toast.success('Успешный вход!')
            router.refresh()
			router.push('/profile')
		}
	}

    const ForgotPasswordLink = (
        <Link 
            href="/forgot-password" 
            className="text-xs text-muted-foreground hover:text-primary hover:underline"
        >
            Забыли пароль?
        </Link>
    )

   

	return (
		<div className='flex w-full flex-col items-center justify-center pt-16'>
			<h1 className='mb-4 text-2xl font-bold'>Вход в аккаунт</h1>

			<AuthForm
				action={handleLogin}
				buttonText='Войти'
				pendingButtonText='Вход...'
                footerLink={ForgotPasswordLink} 
			/>

			<p className='text-muted-foreground mt-4 text-sm'>
				Нет аккаунта?{' '}
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