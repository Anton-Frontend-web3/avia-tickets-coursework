'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { useCities } from '@/hooks/use-cites'
import { CityComboBox } from '@/components/custom-ui/search/CityComboBox'
import { DatePicker } from '@/components/custom-ui/search/DatePicker'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { memo, useEffect } from 'react'

import { PassengerSelector } from '@/components/custom-ui/search/PassengerSelector'

const formSchema = z.object({
  from: z.string().min(1, 'Выберите город вылета.'),
  to: z.string().min(1, 'Выберите город прилета.'),
  date: z
    .object(
      {
        from: z.date({
          error: issue => {
            if (
              issue.code === 'invalid_type' &&
              issue.received === 'undefined'
            ) {
              return { message: 'Выберите дату вылета' }
            }
            return { message: 'Неверный формат даты' } 
          }
        }),
        to: z
          .date({
            error: issue => {
              if (
                issue.code === 'invalid_type' &&
                issue.received === 'undefined'
              ) {
                return { message: 'Выберите дату возврата (опционально)' }
              }
              return { message: 'Неверный формат даты' }
            }
          })
          .optional()
      },
      {
        error: issue => ({ message: 'Выберите даты' }) // Для всего объекта date
      }
    )
    .refine(data => !data.to || data.to >= data.from, {
      message: 'Дата возврата не может быть раньше даты вылета',
      path: ['to']
    }),
  passengers: z.object({
    adults: z.number().min(1),
    children: z.number().min(0),
    infants: z.number().min(0)
  })
}).refine(data => data.from !== data.to, {
  message: 'Город вылета и прилета не могут быть одинаковыми',
  path: ['to']
});

function InputQueryForm() {
  const { cities, isLoading } = useCities()
  const router = useRouter()
  const searchParams = useSearchParams()

	// 1. ПАРСИМ ПАРАМЕТРЫ ИЗ URL ДЛЯ DEFAULTS
	const dateFromParam = searchParams.get('date')
	const dateToParam = searchParams.get('returnDate')

	// Превращаем строки 'YYYY-MM-DD' обратно в объекты Date
	const defaultDate = dateFromParam
		? {
				from: new Date(dateFromParam),
				to: dateToParam ? new Date(dateToParam) : undefined
		  }
		: undefined
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        // ИСПРАВЛЕНИЕ ЗДЕСЬ:
        from: searchParams.get('from') || '', // Берем город из URL
        to: searchParams.get('to') || '',     // Берем город из URL
        
        date: defaultDate,
        passengers: {
          // Берем пассажиров из URL
          adults: Number(searchParams.get('adults')) || 1,
          children: Number(searchParams.get('children')) || 0,
          infants: Number(searchParams.get('infants')) || 0
        }
      },
      mode: 'onChange' 
    })

  const { watch, trigger } = form
  const fromValue = watch('from')
  const toValue = watch('to')

  
  useEffect(() => {
		if (fromValue && toValue) {
			trigger('to')
		}
	}, [fromValue, toValue, trigger])

  function onSubmit(values: z.infer<typeof formSchema>) {
		const queryParams = new URLSearchParams({
			from: values.from,
			to: values.to,
			date: format(values.date.from, 'yyyy-MM-dd'),
			returnDate: values.date.to ? format(values.date.to, 'yyyy-MM-dd') : '',
			adults: values.passengers.adults.toString(),
			children: values.passengers.children.toString(),
			infants: values.passengers.infants.toString()
		})

		if (!values.date.to) queryParams.delete('returnDate')
		
		// Используем replace, если не хотим захламлять историю, или push
		router.push(`/search?${queryParams.toString()}`)
	}

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='grid grid-cols-1 items-end gap-6 pb-6 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]'
      >
        <FormField
          control={form.control}
          name='from'
          render={({ field }) => {
            const filteredCities = toValue
              ? cities.filter(city => city !== toValue)
              : cities
            return (
              <FormItem className='relative flex flex-col'>
                <FormLabel>Откуда</FormLabel>
                <CityComboBox
                  cities={filteredCities}
                  isLoading={isLoading}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Выберите город" 
                />
                <FormMessage className='absolute top-full left-0 mt-1 text-xs' />
              </FormItem>
            )
          }}
        />

        <FormField
          control={form.control}
          name='to'
          render={({ field }) => {
            const filteredCities = fromValue
              ? cities.filter(city => city !== fromValue)
              : cities
            return (
              <FormItem className='relative flex flex-col'>
                <FormLabel>Куда</FormLabel>
                <CityComboBox
                  cities={filteredCities}
                  isLoading={isLoading}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Выберите город" 
                />
                <FormMessage className='absolute top-full left-0 mt-1 text-xs' />
              </FormItem>
            )
          }}
        />

        <FormField
          control={form.control}
          name='date'
          render={({ field }) => (
            <FormItem className='relative flex flex-col'>
              <FormLabel>Когда</FormLabel>
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                disablePastDates={true}
              />
              <FormMessage className='absolute top-full left-0 mt-1 text-xs' />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='passengers'
          render={({ field }) => (
            <FormItem className='relative flex flex-col'>
              <FormLabel>Пассажиры</FormLabel>
              <PassengerSelector
                value={field.value}
                onChange={field.onChange}
              />
              <FormMessage className='absolute top-full left-0 mt-1 text-xs' />
            </FormItem>
          )}
        />

        <Button
          type='submit'
          className='w-full lg:w-auto'
        >
          Найти
        </Button>
      </form>
    </Form>
  )
}

export default memo(InputQueryForm)