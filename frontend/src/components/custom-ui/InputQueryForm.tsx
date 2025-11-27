"use client"
 
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
 
import { Button } from "@/components/ui/button"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useCities } from "@/hooks/use-cites"
import { CityComboBox } from "./CityComboBox"
import { DatePicker } from "./DatePicker"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { memo } from "react"

import { PassengerSelector, PassengerCounts } from "./PassengerSelector";
const formSchema = z.object({
  from: z
    .string()
    .min(1, 'Выберите город вылета.'), 

  to: z
    .string()
    .min(1, 'Выберите город прилета.'),

  date: z
    .date({
      error: "Выберите дату.", 
    }),
    passengers: z.object({
      adults: z.number().min(1),
      children: z.number().min(0),
      infants: z.number().min(0)
    })
});
 
 function InputQueryForm() {
  const { cities, isLoading } = useCities()
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      from: "",
      to:"",
      date:undefined,
      passengers: {
        adults: 1,
        children: 0,
        infants: 0
      },
    },
  })
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Считаем общее количество мест (взрослые + дети) для URL,
    // так как ваш поиск, скорее всего, ищет по количеству кресел.
    const totalSeats = values.passengers.adults + values.passengers.children;

    const queryParams = new URLSearchParams({
      from: values.from,
      to: values.to,
      date: format(values.date, 'yyyy-MM-dd'), 
      passengers: totalSeats.toString(), // Передаем общее число
      // Можно добавить infants отдельно, если бэкенд это поддерживает
      // infants: values.passengers.infants.toString()
    });
    router.push(`/search?${queryParams.toString()}`);
  }
 
  return (
    <Form {...form}>
      {/* --- ИЗМЕНЕНИЯ ЗДЕСЬ --- */}
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        // 1. По умолчанию - вертикальная сетка, 1 колонка.
        // 2. На lg экранах (1024px+) - переключаемся на сложный грид в ряд.
        className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 items-end pb-6"
      >
        <FormField
          control={form.control}
          name="from"
          render={({ field }) => (
            // Убираем жесткую ширину. `grid` сам распределит место.
            <FormItem className="flex flex-col relative">
              <FormLabel>Откуда</FormLabel>
              <CityComboBox 
              cities={cities}
              isLoading={isLoading}
              value={field.value} 
              onChange={field.onChange}  />
              <FormMessage className="absolute top-full left-0 text-xs mt-1" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="to"
          render={({ field }) => (
            <FormItem className="flex flex-col relative">
              <FormLabel>Куда</FormLabel>
              <CityComboBox 
              cities={cities}
              isLoading={isLoading}
              value={field.value} 
              onChange={field.onChange} 
               />
              
              <FormMessage className="absolute top-full left-0 text-xs mt-1" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col relative">
              <FormLabel>Когда</FormLabel>
              <DatePicker value={field.value} onChange={field.onChange}  disablePastDates={true}/>
              <FormMessage className="absolute top-full left-0 text-xs mt-1" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="passengers"
          render={({ field }) => (
            <FormItem className="flex flex-col relative">
              <FormLabel>Пассажиры</FormLabel>
              <PassengerSelector 
                value={field.value} 
                onChange={field.onChange} 
              />
              <FormMessage className="absolute top-full left-0 text-xs mt-1"/>
            </FormItem>
          )}
        />
        
        {/* Кнопка тоже становится частью сетки */}
        <Button type="submit" className="w-full lg:w-auto">Найти</Button>
      </form>
    </Form>
  )
}

export default memo(InputQueryForm)