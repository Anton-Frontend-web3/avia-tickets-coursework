import React from 'react'
import { Header } from './Header'

interface LayoutProps {
	children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
	return (
		<div className='flex min-h-screen flex-col bg-gray-50'>
			<Header />

			{/* --- ИСПОЛЬЗУЕМ ЭТОТ ВАРИАНТ --- */}
			<main className='w-full flex-grow'>
				{/* Этот div будет отцентрирован и ограничит ширину контента */}
				<div className='mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8'>
					{children}
				</div>
			</main>

			{/* <footer ...> ... </footer> */}
		</div>
	)
}
