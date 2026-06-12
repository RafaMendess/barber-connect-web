// =====================
// Auth Types
// =====================
export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface LogoutRequestDto {
  refreshToken: string;
}

export interface ForgotPasswordRequestDto {
  email: string;
}

export interface ResetPasswordRequestDto {
  email: string;
  code: string;
  newPassword: string;
}

export interface ResendVerificationCodeRequestDto {
  email: string;
}

export interface UserAuthResponseDto {
  id: number;
  name: string;
  email: string;
  roles: string[];
}

// =====================
// Barbershop Types
// =====================
export interface BarbershopResponseDto {
  id: number;
  name: string;
  phone?: string;
  address?: string;
  businessHours?: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
  owner?: UserSummaryResponseDto;
}

export interface CreateBarbershopRequestDto {
  name: string;
  phone?: string;
  address?: string;
  businessHours?: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateBarbershopRequestDto {
  name?: string;
  phone?: string;
  address?: string;
  businessHours?: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
}

// =====================
// Barber Types
// =====================
export interface BarberResponseDto {
  id: number;
  name: string;
  email: string;
  specialty?: string;
  description?: string;
  active?: boolean;
  
  services?: OfferedServiceSummaryResponseDto[];
}

export interface BarberSummaryResponseDto {
  id: number;
  name?: string;
  specialty?: string;
}

export interface CreateBarberRequestDto {
  userId: number;
  specialty?: string;
  description?: string;
}

export interface UpdateBarberRequestDto {
  specialty?: string;
  description?: string;
}

// =====================
// Service Types
// =====================
export interface OfferedServiceResponseDto {
  id: number;
  name: string;
  description?: string;
  price: number;
  estimatedTime: number;
}

export interface OfferedServiceSummaryResponseDto {
  id: number;
  name: string;
  price?: number;
  estimatedTime?: number;
}

export interface CreateOfferedServiceRequestDto {
  name: string;
  description?: string;
  price: number;
  estimatedTime: number;
}

export interface UpdateOfferedServiceRequestDto {
  name?: string;
  description?: string;
  price?: number;
  estimatedTime?: number;
}

// =====================
// Availability Types
// =====================
export interface AvailabilityResponseDto {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  barberId?: number;
}

export interface CreateAvailabilityRequestDto {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface UpdateAvailabilityRequestDto {
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
}

// =====================
// Schedule Block Types
// =====================
export interface ScheduleBlockResponseDto {
  id: number;
  startDateTime: string;
  endDateTime: string;
  reason?: string;
  barberId?: number;
}

export interface CreateScheduleBlockRequestDto {
  startDateTime: string;
  endDateTime: string;
  reason?: string;
}

export interface UpdateScheduleBlockRequestDto {
  startDateTime?: string;
  endDateTime?: string;
  reason?: string;
}

// =====================
// Appointment Types
// =====================
export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface AppointmentResponseDto {
  id: number;
  appointmentDateTime: string;
  endsAt: string;
  status: AppointmentStatus;
  observation?: string;
  client?: UserSummaryResponseDto;
  barber?: BarberSummaryResponseDto;
  service?: OfferedServiceSummaryResponseDto;
  createdAt: string;
}

export interface AppointmentSummaryDto {
  id: number;
  appointmentDateTime: string;
  endsAt: string;
  status: AppointmentStatus;
  clientName?: string;
  barberName?: string;
  serviceName?: string;
  serviceDurationMinutes?: number;
}

export interface CreateAppointmentRequestDto {
  appointmentDateTime: string;
  barberId: number;
  serviceId: number;
  observation?: string;
}

export interface UpdateAppointmentRequestDto {
  appointmentDateTime?: string;
  status?: AppointmentStatus;
  observation?: string;
}

// =====================
// Payment Types
// =====================
export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';

export interface PaymentResponseDto {
  id: number;
  appointmentId: number;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt?: string;
  createdAt: string;
}

export interface CreatePaymentRequestDto {
  appointmentId: number;
  amount: number;
  method: PaymentMethod;
}

export interface UpdatePaymentStatusRequestDto {
  status: PaymentStatus;
}

// =====================
// Dashboard Types
// =====================
export interface DashboardResponseDto {
  barbershopId: number;
  barbershopName: string;
  totalAppointmentsToday: number;
  totalAppointmentsThisMonth: number;
  totalConfirmed: number;
  totalCancelled: number;
  totalCompleted: number;
  totalPending: number;
  totalActiveBarbers: number;
  totalActiveServices: number;
  upcomingToday: AppointmentSummaryDto[];
}

export interface BarberDashboardResponseDto {
  barberId: number;
  barberName: string;
  totalAppointmentsToday: number;
  totalAppointmentsThisMonth: number;
  totalConfirmed: number;
  totalCancelled: number;
  totalCompleted: number;
  totalPending: number;
  upcomingToday: AppointmentSummaryDto[];
}

// =====================
// User Types
// =====================
export interface UserSummaryResponseDto {
  id: number;
  name: string;
  email?: string;
}

// =====================
// Common Types
// =====================
export interface ApiError {
  message: string;
  status?: number;
}
