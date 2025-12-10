import React from 'react'
import { Header } from '@/components/custom-ui/layout/Header'

interface LayoutProps {
	children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
	return (
		<div className='bg-background text-foreground flex min-h-screen flex-col'>
			<Header />

			<main className='w-full flex-grow'>
				<div className='mx-auto w-full max-w-5xl px-2 py-8 sm:px-6 lg:px-8'>
					{children}
				</div>
			</main>

			{/* <footer ...> ... </footer> */}
		</div>
	)
}
