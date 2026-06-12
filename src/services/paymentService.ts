import api from './api';
import {
  PaymentResponseDto,
  CreatePaymentRequestDto,
  UpdatePaymentStatusRequestDto,
} from '@/types/api';
import { appointmentService } from './appointmentService';

export const paymentService = {
  getAll: async (barbershopId: number): Promise<PaymentResponseDto[]> => {
    // The backend does not expose a direct GET /barbershops/{id}/payments endpoint.
    // We fetch appointments for the barbershop and then request payment by appointment.
    const appointments = await appointmentService.getAll(barbershopId);
    const promises = appointments.map((a) =>
      paymentService.getByAppointment(a.id).then((p) => p).catch(() => null)
    );
    const results = await Promise.all(promises);
    return results.filter((r): r is PaymentResponseDto => r !== null);
  },

  getById: async (id: number): Promise<PaymentResponseDto> => {
    const response = await api.get<PaymentResponseDto>(`/payments/${id}`);
    return response.data;
  },

  create: async (data: CreatePaymentRequestDto): Promise<PaymentResponseDto> => {
    const response = await api.post<PaymentResponseDto>('/payments', data);
    return response.data;
  },

  updateStatus: async (
    id: number,
    data: UpdatePaymentStatusRequestDto
  ): Promise<PaymentResponseDto> => {
    const response = await api.patch<PaymentResponseDto>(`/payments/${id}/status`, data);
    return response.data;
  },
  getByAppointment: async (appointmentId: number): Promise<PaymentResponseDto> => {
    try {
      const response = await api.get<PaymentResponseDto>(`/payments/appointments/${appointmentId}`);
      return response.data;
    } catch (e: any) {
      if (e?.response?.status === 404) {
        // fallback to alternative path if backend uses singular
        const response2 = await api.get<PaymentResponseDto>(`/payments/appointment/${appointmentId}`);
        return response2.data;
      }
      throw e;
    }
  },
};
