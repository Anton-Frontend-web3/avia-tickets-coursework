'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { z } from 'zod'

import { AuthForm } from '@/components/custom-ui/AuthForm'
import { registerUser } from '@/lib/actions'

// Тип для данных формы
const formSchema = z.object({
	email: z.email(),
	password: z.string()
})

export default function RegisterPage() {
	const router = useRouter()

	const handleRegister = async (data: z.infer<typeof formSchema>) => {
		try {
			const result = await registerUser(data)

			// --- ДОБАВЛЯЕМ ПРОВЕРКУ ЗДЕСЬ ---
			// Если по какой-то причине result не пришел (например, сетевой сбой)
			if (!result) {
				toast.error('Ошибка регистрации', {
					description: 'Не удалось получить ответ от сервера.'
				})
				return // Выходим из функции
			}

			// Теперь TypeScript уверен, что `result` - это объект
			if (result.success) {
				toast.success('Регистрация прошла успешно!', {
					description: 'Теперь вы можете войти.'
				})
				router.push('/login')
			} else if (result.error) {
				toast.error('Ошибка регистрации', { description: result.error })
			}
		} catch (error) {
			// Этот catch сработает, если сам вызов `registerUser` выбросит исключение
			// (хотя мы спроектировали его так, чтобы он всегда возвращал объект)
			console.error('Critical error calling registerUser:', error)
			toast.error('Критическая ошибка', {
				description: 'Не удалось выполнить действие.'
			})
		}
	}

	return (
		<div className='flex w-full flex-col items-center justify-center pt-16'>
			<h1 className='mb-4 text-2xl font-bold'>Создать аккаунт</h1>

			<AuthForm
				action={handleRegister}
				buttonText='Зарегистрироваться'
				pendingButtonText='Регистрация...'
			/>

			<p className='text-muted-foreground mt-4 text-sm'>
				Уже есть аккаунт?{' '}
				<Link
					href='/login'
					className='text-primary font-semibold hover:underline'
				>
					Войти
				</Link>
			</p>
		</div>
	)
}
