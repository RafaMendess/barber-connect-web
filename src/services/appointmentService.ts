import api from './api';
import {
  AppointmentResponseDto,
  CreateAppointmentRequestDto,
  UpdateAppointmentRequestDto,
} from '@/types/api';
import { barbershopService } from './barbershopService';


export const appointmentService = {
 getAll: async (barbershopId: number): Promise<AppointmentResponseDto[]> => {
  const barbers = await barbershopService.getBarbers(barbershopId);

  const barberIds = barbers.map(barber => barber.id);

  if (barberIds.length === 0) {
    return [];
  }

  const responses = await Promise.all(
    barberIds.map(barberId =>
      api.get<AppointmentResponseDto[]>(
        `/appointments/barber/${barberId}`
      )
    )
  );

  return responses.flatMap(response => response.data);
},

  getByBarber: async (barberId: number): Promise<AppointmentResponseDto[]> => {
    const response = await api.get<AppointmentResponseDto[]>(`/barbers/${barberId}/appointments`);
    return response.data;
  },

  getById: async (id: number): Promise<AppointmentResponseDto> => {
    const response = await api.get<AppointmentResponseDto>(`/appointments/${id}`);
    return response.data;
  },

  create: async (data: CreateAppointmentRequestDto): Promise<AppointmentResponseDto> => {
    const response = await api.post<AppointmentResponseDto>('/appointments', data);
    return response.data;
  },

  update: async (id: number, data: UpdateAppointmentRequestDto): Promise<AppointmentResponseDto> => {
    const response = await api.patch<AppointmentResponseDto>(`/appointments/${id}`, data);
    return response.data;
  },

  cancel: async (id: number): Promise<AppointmentResponseDto> => {
    try {
      const response = await api.patch<AppointmentResponseDto>(`/appointments/${id}/cancel`);
      return response.data;
    } catch (e: any) {
      // If backend expects DELETE for cancel, try that as a fallback
      if (e?.response?.status === 404) {
        await api.delete(`/appointments/${id}/cancel`);
        // attempt to return the updated appointment if available
        try {
          return await appointmentService.getById(id);
        } catch {
          // If we cannot fetch, rethrow original error
          throw e;
        }
      }
      throw e;
    }
  },
};
