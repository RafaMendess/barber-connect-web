import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const registerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
});

export const barbershopSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  phone: z.string().max(20).optional(),
  address: z.string().max(255).optional(),
  businessHours: z.string().max(100).optional(),
  photoUrl: z.string().max(255).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const barberSchema = z.object({
  userId: z.number({ required_error: 'Usuário é obrigatório' }),
  specialty: z.string().max(255).optional(),
  description: z.string().optional(),
});

export const updateBarberSchema = z.object({
  specialty: z.string().max(255).optional(),
  description: z.string().optional(),
});

export const offeredServiceSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  description: z.string().optional(),
  price: z.number({ required_error: 'Preço é obrigatório' }).min(0, 'Preço inválido'),
  estimatedTime: z
    .number({ required_error: 'Tempo estimado é obrigatório' })
    .int()
    .min(1, 'Informe o tempo em minutos'),
});

export const availabilitySchema = z.object({
  dayOfWeek: z
    .number({ required_error: 'Dia da semana é obrigatório' })
    .int()
    .min(1)
    .max(7),
  startTime: z.string().min(1, 'Horário inicial é obrigatório'),
  endTime: z.string().min(1, 'Horário final é obrigatório'),
});

export const scheduleBlockSchema = z.object({
  startDateTime: z.string().min(1, 'Data/hora de início é obrigatória'),
  endDateTime: z.string().min(1, 'Data/hora de término é obrigatória'),
  reason: z.string().optional(),
});

export const appointmentSchema = z.object({
  appointmentDateTime: z.string().min(1, 'Data/hora é obrigatória'),
  barberId: z.number({ required_error: 'Barbeiro é obrigatório' }),
  serviceId: z.number({ required_error: 'Serviço é obrigatório' }),
  observation: z.string().optional(),
});

export const paymentSchema = z.object({
  appointmentId: z.number({ required_error: 'Agendamento é obrigatório' }),
  amount: z.number({ required_error: 'Valor é obrigatório' }).min(0),
  method: z.enum(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX']),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type BarbershopFormData = z.infer<typeof barbershopSchema>;
export type BarberFormData = z.infer<typeof barberSchema>;
export type UpdateBarberFormData = z.infer<typeof updateBarberSchema>;
export type OfferedServiceFormData = z.infer<typeof offeredServiceSchema>;
export type AvailabilityFormData = z.infer<typeof availabilitySchema>;
export type ScheduleBlockFormData = z.infer<typeof scheduleBlockSchema>;
export type AppointmentFormData = z.infer<typeof appointmentSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
