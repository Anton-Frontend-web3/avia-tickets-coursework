import { cn } from '@/lib/utils'
import type { CSSProperties } from 'react'

interface ISkeletonLoader {
	count?: number
	style?: CSSProperties
	className?: string
}

export function SkeletonLoader({
	count = 1,
	style,
	className
}: ISkeletonLoader) {
	return (
		<>
			{Array.from({ length: count }, (_, index) => (
				<div
					key={index}
					className={cn(
						'bg-background mb-[0.65rem] h-10 animate-pulse rounded-3xl',
						className
					)}
					style={style}
				></div>
			))}
		</>
	)
}
