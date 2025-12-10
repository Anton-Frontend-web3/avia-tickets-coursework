import { SkeletonLoader } from '@/components/custom-ui/SkeletonLoader'

export default function Loading() {
	return (
		<div className='container mx-auto py-8'>
			<div className='mb-8 h-[300px] animate-pulse rounded-xl' />{' '}
			{/* Скелет формы */}
			<h2 className='mb-4 text-2xl font-bold'>Найденные рейсы</h2>
			<div className='flex flex-col gap-4'>
				<SkeletonLoader
					count={3}
					className='h-[160px] rounded-xl'
				/>
			</div>
		</div>
	)
}
