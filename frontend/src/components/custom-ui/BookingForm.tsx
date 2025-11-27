'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch, type Resolver } from "react-hook-form"

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createBooking } from "@/lib/actions";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCallback } from 'react';
import { MiddleNameSection } from './MiddleNameSection';
import { bookingFormSchema, BookingFormValues } from "@/shared/schemas/booking.schema";

interface Props {
    flightId: number;
}

const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export function BookingForm({ flightId }: Props) {
    const router = useRouter();

    const form = useForm<BookingFormValues>({
        resolver: zodResolver(bookingFormSchema) as Resolver<BookingFormValues>,
        
        defaultValues: {
            lastName: "",
            firstName: "",
            middleName: "",
            documentNumber: "",
            documentSeries: "",
            hasNoMiddleName: false,
            gender: undefined,
            birthDate: undefined, 
            documentType: undefined, 
            validUntil: undefined,
        },
    });

    const documentType = useWatch({ control: form.control, name: 'documentType' });
    const documentSeries = useWatch({ control: form.control, name: 'documentSeries' });
    const { isSubmitting } = form.formState;

    const seriesParts = (documentSeries || '').split('-');
    const romanPart = seriesParts[0] || '';
    const lettersPart = seriesParts.length > 1 ? seriesParts[1] : '';

    const onSubmit = useCallback(async (values: BookingFormValues) => {
        const middleName = values.hasNoMiddleName ? '' : values.middleName;
        
        // Подготавливаем данные (validUntil может быть undefined)
        const validUntil = 'validUntil' in values ? values.validUntil : undefined;

        try {
            const result = await createBooking({
                ...values,
                middleName,
                validUntil, // Передаем срок действия на сервер
                flightId: flightId,
            });

            if (result.success) {
                toast.success(`Бронирование успешно! Номер: ${result.ticketNumber}`);
                form.reset();
                setTimeout(() => router.back(), 3000);
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Произошла ошибка. Попробуйте снова.");
        }
    }, [flightId, router, form]);

    return (
        <div className="bg-white p-6 rounded-lg border shadow-md">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    
                    {/* Секция ФИО */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                        <FormField control={form.control} name="lastName" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Фамилия</FormLabel>
                                <FormControl><Input placeholder="Иванов" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="firstName" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Имя</FormLabel>
                                <FormControl><Input placeholder="Иван" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        
                        <MiddleNameSection control={form.control} />
                    </div>

                    {/* Секция Дата рождения и Пол */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                        <FormField control={form.control} name="birthDate" render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Дата рождения</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="date" 
                                        max={new Date().toISOString().split("T")[0]} 
                                        value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''} 
                                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="gender" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Пол</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center space-x-4 pt-2">
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl><RadioGroupItem value="male" /></FormControl>
                                            <FormLabel className="font-normal">Мужской</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl><RadioGroupItem value="female" /></FormControl>
                                            <FormLabel className="font-normal">Женский</FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    <hr className="border-gray-100" />

                    {/* Секция Документы */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                        
                        {/* Выбор типа документа (На всю ширину или половину) */}
                        <div className="sm:col-span-2">
                            <FormField control={form.control} name="documentType" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Документ</FormLabel>
                                    <Select 
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            form.setValue('documentSeries', ''); // Сброс серии при смене типа
                                            form.setValue('documentNumber', ''); // Сброс номера
                                        }} 
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Тип документа" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="passport_rf">Паспорт РФ</SelectItem>
                                            <SelectItem value="passport_international">Загранпаспорт РФ</SelectItem>
                                            <SelectItem value="birth_certificate">Свидетельство о рождении</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        {/* 1. ПАСПОРТ РФ */}
                        {documentType === 'passport_rf' && (
                            <>
                                <FormField control={form.control} name="documentSeries" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Серия (4 цифры)</FormLabel>
                                        <FormControl><Input {...field} maxLength={4} placeholder="1234" inputMode="numeric" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="documentNumber" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Номер (6 цифр)</FormLabel>
                                        <FormControl><Input {...field} maxLength={6} placeholder="567890" inputMode="numeric" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </>
                        )}

                        {/* 2. ЗАГРАНПАСПОРТ */}
                        {documentType === 'passport_international' && (
                            <>
                                <FormField control={form.control} name="documentSeries" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Серия (2 цифры)</FormLabel>
                                        <FormControl><Input {...field} maxLength={2} placeholder="75" inputMode="numeric" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="documentNumber" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Номер (7 цифр)</FormLabel>
                                        <FormControl><Input {...field} maxLength={7} placeholder="1234567" inputMode="numeric" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="validUntil" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Срок действия</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="date" 
                                                min={new Date().toISOString().split("T")[0]} 
                                                value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''} 
                                                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </>
                        )}

                        {/* 3. СВИДЕТЕЛЬСТВО О РОЖДЕНИИ (Сложная логика) */}
                        {documentType === 'birth_certificate' && (
                            <>
                                {/* БЛОК СЕРИИ (Римские + Буквы) */}
                                <div className="sm:col-span-2 grid grid-cols-12 gap-4 items-start">
                                    {/* Визуальный селект для римских цифр */}
                                    <div className="col-span-4">
                                        <FormLabel className="text-xs text-muted-foreground mb-2 block">Серия (Римские)</FormLabel>
                                        <Select 
                                            value={romanPart}
                                            onValueChange={(val) => {
                                                form.setValue('documentSeries', `${val}-${lettersPart}`, { shouldValidate: true });
                                            }}
                                        >
                                            <SelectTrigger><SelectValue placeholder="I" /></SelectTrigger>
                                            <SelectContent>
                                                {romanNumerals.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Визуальный инпут для букв */}
                                    <div className="col-span-3">
                                        <FormLabel className="text-xs text-muted-foreground mb-2 block">Буквы (Кириллица)</FormLabel>
                                        <Input 
                                            value={lettersPart}
                                            placeholder="АА" 
                                            maxLength={2} 
                                            onChange={(e) => {
                                                // Разрешаем только кириллицу
                                                const val = e.target.value.replace(/[^а-яА-Я]/g, '').toUpperCase();
                                                e.target.value = val; // Обновляем сам инпут
                                                
                                                // Записываем: "ТекущаяЦифра-НовыеБуквы"
                                                form.setValue('documentSeries', `${romanPart}-${val}`, { shouldValidate: true });
                                            }}
                                        />
                                    </div>

                                    {/* Инпут для номера */}
                                    <div className="col-span-5">
                                        <FormField control={form.control} name="documentNumber" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs text-muted-foreground mb-2 block">Номер</FormLabel>
                                                <FormControl><Input {...field} maxLength={6} placeholder="123456" inputMode="numeric" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>

                                {/* Скрытое отображение ошибки для всего поля documentSeries */}
                                <div className="sm:col-span-2 -mt-4">
                                    <FormField control={form.control} name="documentSeries" render={() => <FormMessage />} />
                                </div>
                            </>
                        )}
                    </div>

                    <Button type="submit" className="w-full text-lg font-semibold py-3" disabled={isSubmitting}>
                        {isSubmitting ? 'Бронирование...' : 'Забронировать'}
                    </Button>
                </form>
            </Form>
        </div>
    );
}