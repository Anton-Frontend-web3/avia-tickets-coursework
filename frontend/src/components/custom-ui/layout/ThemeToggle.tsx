'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
	const { theme, setTheme } = useTheme()
	const [mounted, setMounted] = useState(false)

	useEffect(() => setMounted(true), [])

	if (!mounted) return null

	const isDark = theme === 'dark'

	return (
		<Button
			type='button'
			variant='ghost'
			size='icon'
			aria-label='Toggle theme'
			onClick={() => setTheme(isDark ? 'light' : 'dark')}
			className='h-9 w-9'
		>
			<Sun className={cn('h-5 w-5', isDark && 'hidden')} />
			<Moon className={cn('h-5 w-5', !isDark && 'hidden')} />
		</Button>
	)
}
