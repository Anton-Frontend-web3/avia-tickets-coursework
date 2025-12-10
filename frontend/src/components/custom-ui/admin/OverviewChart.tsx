'use client'

import {
	Bar,
	BarChart,
	ResponsiveContainer,
	XAxis,
	YAxis,
	Tooltip
} from 'recharts'

interface Props {
	data: {
		name: string
		total: number
	}[]
}

// Кастомный компонент подсказки
const CustomTooltip = ({ active, payload, label }: any) => {
	if (active && payload && payload.length) {
		return (
			// Используем классы темы: bg-popover, border-border, text-foreground
			<div className='border-border bg-popover rounded-lg border p-3 shadow-md'>
				<p className='text-muted-foreground mb-1 text-sm font-medium'>
					{label}
				</p>
				<p className='text-foreground text-xl font-bold'>
					{payload[0].value.toLocaleString('ru-RU')} ₽
				</p>
			</div>
		)
	}
	return null
}

export function OverviewChart({ data }: Props) {
	return (
		<ResponsiveContainer
			width='100%'
			height={350}
		>
			<BarChart data={data}>
				<XAxis
					dataKey='name'
					stroke='#888888'
					fontSize={12}
					tickLine={false}
					axisLine={false}
				/>
				<YAxis
					stroke='#888888'
					fontSize={12}
					tickLine={false}
					axisLine={false}
					tickFormatter={value => `₽${value}`}
				/>

				{/* Используем наш кастомный тултип */}
				<Tooltip
					content={<CustomTooltip />}
					cursor={{ fill: 'var(--muted)' }}
				/>

				<Bar
					dataKey='total'
					fill='currentColor'
					radius={[4, 4, 0, 0]}
					className='fill-primary'
				/>
			</BarChart>
		</ResponsiveContainer>
	)
}
