import { z } from 'zod';
import { differenceInYears } from 'date-fns';

// Базовая схема (имя, пол, дата рождения)
const baseSchema = z.object({
  lastName: z.string().min(1, { message: "Фамилия обязательна." }),
  firstName: z.string().min(1, { message: "Имя обязательно." }),
  hasNoMiddleName: z.boolean().default(false),
  middleName: z.string().optional(),
  birthDate: z.date({ error: "Выберите дату рождения." })
    .refine((date) => differenceInYears(new Date(), date) >= 14, {
       message: "Пассажирам должно быть не менее 14 лет.",
    }),
    gender: z.enum(['male', 'female'], {
        error: (issue) => {
            if (issue.input === undefined) {
                return 'Выберите пол.';
            }
            return 'Неверный пол.';
        },
    }),
    documentType: z.enum(['passport_rf', 'passport_international', 'birth_certificate'], {
        error: (issue) => {
          if (issue.input === undefined) {
            return "Выберите тип документа.";
          }
          return "Выберите тип документа."; 
        },
      }),
}).superRefine((data, ctx) => {
    if (!data.hasNoMiddleName && (!data.middleName || data.middleName.length < 1)) {
        ctx.addIssue({ code: "custom", message: "Введите отчество или отметьте, что его нет.", path: ["middleName"] });
    }
});

// Схема для Паспорта РФ
const passportRFSchema = z.object({
    documentType: z.literal('passport_rf'),
    documentSeries: z.string().regex(/^\d{4}$/, "Серия: 4 цифры"),
    documentNumber: z.string().regex(/^\d{6}$/, "Номер: 6 цифр"),
    validUntil: z.undefined(), // Нет срока действия
});

// Схема для Загранпаспорта
const passportInternationalSchema = z.object({
    documentType: z.literal('passport_international'),
    documentSeries: z.string().regex(/^\d{2}$/, "Серия: 2 цифры"),
    documentNumber: z.string().regex(/^\d{7}$/, "Номер: 7 цифр"),
    validUntil: z.date({ error: "Укажите срок действия" })
        .refine((date) => date > new Date(), "Срок действия истек"),
});

// Схема для Свидетельства о рождении
const birthCertificateSchema = z.object({
    documentType: z.literal('birth_certificate'),
    // Мы будем собирать серию из двух полей на фронте, но в схему придет одна строка
    documentSeries: z.string().regex(/^[IVXLC]{1,4}-[А-Я]{2}$/, "Формат: I-АА"),
    documentNumber: z.string().regex(/^\d{6}$/, "Номер: 6 цифр"),
    validUntil: z.undefined(),
});

// Объединяем все
export const bookingFormSchema = z.intersection(
    baseSchema,
    z.discriminatedUnion('documentType', [
        passportRFSchema,
        passportInternationalSchema,
        birthCertificateSchema
    ])
);

export type BookingFormValues = z.infer<typeof bookingFormSchema>;