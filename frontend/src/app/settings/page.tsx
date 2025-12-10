'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

import { changeUserPassword, changeUserEmail } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/custom-ui/auth/PasswordInput' // НАШ НОВЫЙ КОМПОНЕНТ
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

// --- СХЕМА: Смена пароля ---
const passwordSchema = z.object({
    oldPassword: z.string().min(1, 'Введите текущий пароль'),
    newPassword: z.string().min(8, 'Минимум 8 символов'),
    confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword']
})

// --- СХЕМА: Смена Email ---
const emailSchema = z.object({
    email: z.email('Некорректный email'),
    password: z.string().min(1, 'Введите пароль для подтверждения')
})


export default function SettingsPage() {
    const { data: session, update } = useSession() // update нужен, чтобы обновить email в сессии без перелогина
    const [isPendingPwd, startTransitionPwd] = useTransition()
    const [isPendingEmail, startTransitionEmail] = useTransition()

    // Форма пароля
    const pwdForm = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' }
    })

    // Форма email
    const emailForm = useForm<z.infer<typeof emailSchema>>({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: '', password: '' }
    })

    // --- ОБРАБОТЧИК: Смена пароля ---
    const onPasswordSubmit = (values: z.infer<typeof passwordSchema>) => {
        startTransitionPwd(async () => {
            const res = await changeUserPassword(values.oldPassword, values.newPassword)
            if (res.success) {
                toast.success('Пароль успешно изменен')
                pwdForm.reset()
            } else {
                toast.error(res.error)
            }
        })
    }

    // --- ОБРАБОТЧИК: Смена Email ---
    const onEmailSubmit = (values: z.infer<typeof emailSchema>) => {
        startTransitionEmail(async () => {
            const res = await changeUserEmail(values.email, values.password)
            if (res.success) {
                toast.success('Email обновлен')
                // Обновляем сессию на клиенте, чтобы в хедере сразу отобразился новый email
                await update({ user: { ...session?.user, email: values.email } })
                emailForm.reset()
            } else {
                toast.error(res.error)
            }
        })
    }

    return (
        <div className="container mx-auto max-w-2xl py-10 px-4 space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Настройки аккаунта</h1>
                <p className="text-muted-foreground">Управление безопасностью и контактными данными.</p>
            </div>

            {/* БЛОК 1: Смена пароля */}
            <Card>
                <CardHeader>
                    <CardTitle>Изменить пароль</CardTitle>
                    <CardDescription>Введите текущий пароль для подтверждения.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...pwdForm}>
                        <form onSubmit={pwdForm.handleSubmit(onPasswordSubmit)} className="space-y-7">
                            
                            {/* Используем наш PasswordInput с глазиком */}
                            <FormField
                                control={pwdForm.control}
                                name="oldPassword"
                                render={({ field }) => (
                                    <FormItem className='relative space-y-1'>
                                        <FormLabel>Текущий пароль</FormLabel>
                                        <FormControl>
                                            <PasswordInput placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage className='absolute top-full left-0 mt-1 text-xs text-red-500' />
                                    </FormItem>
                                )}
                            />
                            
                            <div className="grid gap-6 sm:grid-cols-2">
                                <FormField
                                    control={pwdForm.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem className='relative space-y-1'>
                                            <FormLabel>Новый пароль</FormLabel>
                                            <FormControl>
                                                <PasswordInput placeholder="••••••••" {...field} />
                                            </FormControl>
                                            <FormMessage className='absolute top-full left-0 mt-1 text-xs text-red-500' />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={pwdForm.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem className='relative space-y-1'>
                                            <FormLabel>Повторите пароль</FormLabel>
                                            <FormControl>
                                                <PasswordInput placeholder="••••••••" {...field} />
                                            </FormControl>
                                            <FormMessage  className='absolute top-full left-0 mt-1 text-xs text-red-500'/>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button type="submit" disabled={isPendingPwd}>
                                {isPendingPwd ? 'Сохранение...' : 'Обновить пароль'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* БЛОК 2: Смена Email */}
            <Card>
                <CardHeader>
                    <CardTitle>Изменить Email</CardTitle>
                    <CardDescription>
                        Текущий email: <span className="font-medium text-foreground">{session?.user?.email}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                    <Form {...emailForm}>
                        <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6">
                            <FormField
                                control={emailForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className='relative space-y-1'>
                                        <FormLabel>Новый Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="new@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage className='absolute top-full left-0 mt-1 text-xs text-red-500' />
                                    </FormItem>
                                )}
                            />
                            
                            <FormField
                                control={emailForm.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className='relative space-y-1'>
                                        <FormLabel>Текущий пароль (для подтверждения)</FormLabel>
                                        <FormControl>
                                            <PasswordInput placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage className='absolute top-full left-0 mt-1 text-xs text-red-500' />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" variant="outline" disabled={isPendingEmail}>
                                {isPendingEmail ? 'Обновление...' : 'Сменить Email'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}