import InputQueryForm from '@/components/custom-ui/search/InputQueryForm'

export default function HomePage() {
	return (
		
		<main className='flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-center bg-background px-3 py-10 sm:px-6 lg:px-8'>
			
			<div className='flex w-full max-w-5xl flex-col items-center gap-6 sm:gap-10'>
				
				
				<h1 className='text-center text-2xl font-extrabold tracking-tight text-primary sm:text-4xl md:text-5xl lg:text-6xl'>
					Поиск дешевых авиабилетов
				</h1>
				<div className='w-full'>
					<InputQueryForm />
				</div>
			</div>
		</main>
	)
}