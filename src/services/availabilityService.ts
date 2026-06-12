import api from './api';
import {
  AvailabilityResponseDto,
  CreateAvailabilityRequestDto,
  UpdateAvailabilityRequestDto,
} from '@/types/api';

export const availabilityService = {
  getAll: async (barberId: number): Promise<AvailabilityResponseDto[]> => {
    const response = await api.get<AvailabilityResponseDto[]>(`/barbers/${barberId}/availabilities`);
    return response.data;
  },

  create: async (
    barberId: number,
    data: CreateAvailabilityRequestDto
  ): Promise<AvailabilityResponseDto> => {
    const response = await api.post<AvailabilityResponseDto>(
      `/barbers/${barberId}/availabilities`,
      data
    );
    return response.data;
  },

  update: async (
    barberId: number,
    availabilityId: number,
    data: UpdateAvailabilityRequestDto
  ): Promise<AvailabilityResponseDto> => {
    const response = await api.patch<AvailabilityResponseDto>(
      `/barbers/${barberId}/availabilities/${availabilityId}`,
      data
    );
    return response.data;
  },

  delete: async (barberId: number, availabilityId: number): Promise<void> => {
    await api.delete(`/barbers/${barberId}/availabilities/${availabilityId}`);
  },
};
