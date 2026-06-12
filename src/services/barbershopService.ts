import api from './api';
import {
  BarbershopResponseDto,
  CreateBarbershopRequestDto,
  UpdateBarbershopRequestDto,
  BarberResponseDto,
  OfferedServiceResponseDto,
  DashboardResponseDto,
} from '@/types/api';

export const barbershopService = {
  getAll: async (): Promise<BarbershopResponseDto[]> => {
    const response = await api.get<BarbershopResponseDto[]>('/barbershops');
    return response.data;
  },

  getByOwner: async (ownerId: number): Promise<BarbershopResponseDto[]> => {
    const response = await api.get<BarbershopResponseDto[]>(`/barbershops/owner/${ownerId}`);
    return response.data;
  },

  getById: async (id: number): Promise<BarbershopResponseDto> => {
    const response = await api.get<BarbershopResponseDto>(`/barbershops/${id}`);
    return response.data;
  },

  create: async (data: CreateBarbershopRequestDto): Promise<BarbershopResponseDto> => {
    const response = await api.post<BarbershopResponseDto>('/barbershops', data);
    return response.data;
  },

  update: async (id: number, data: UpdateBarbershopRequestDto): Promise<BarbershopResponseDto> => {
    const response = await api.patch<BarbershopResponseDto>(`/barbershops/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/barbershops/${id}`);
  },

  getBarbers: async (barbershopId: number): Promise<BarberResponseDto[]> => {
    const response = await api.get<BarberResponseDto[]>(`/barbershops/${barbershopId}/barbers`);
    return response.data;
  },

  getServices: async (barbershopId: number): Promise<OfferedServiceResponseDto[]> => {
    const response = await api.get<OfferedServiceResponseDto[]>(`/barbershops/${barbershopId}/services`);
    return response.data;
  },

  getDashboard: async (barbershopId: number): Promise<DashboardResponseDto> => {
    const response = await api.get<DashboardResponseDto>(`/dashboard/barbershop/${barbershopId}`);
    return response.data;
  },
};
