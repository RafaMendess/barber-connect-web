import api from './api';
import {
  BarberResponseDto,
  CreateBarberRequestDto,
  UpdateBarberRequestDto,
} from '@/types/api';

export const barberService = {
  getById: async (id: number): Promise<BarberResponseDto> => {
    const response = await api.get<BarberResponseDto>(`/barbers/${id}`);
    return response.data;
  },

  create: async (barbershopId: number, data: CreateBarberRequestDto): Promise<BarberResponseDto> => {
    const response = await api.post<BarberResponseDto>(`/barbershops/${barbershopId}/barbers`, data);
    return response.data;
  },

  update: async (id: number, data: UpdateBarberRequestDto): Promise<BarberResponseDto> => {
    const response = await api.patch<BarberResponseDto>(`/barbers/${id}`, data);
    return response.data;
  },



  addService: async (barberId: number, serviceId: number): Promise<BarberResponseDto> => {
    const response = await api.patch<BarberResponseDto>(`/barbers/${barberId}/services/${serviceId}`);
    return response.data;
  },

  removeService: async (barberId: number, serviceId: number): Promise<BarberResponseDto> => {
    const response = await api.delete<BarberResponseDto>(`/barbers/${barberId}/services/${serviceId}`);
    return response.data;
  },
};
