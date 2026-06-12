import api from './api';
import {
  OfferedServiceResponseDto,
  CreateOfferedServiceRequestDto,
  UpdateOfferedServiceRequestDto,
} from '@/types/api';

export const offeredServiceService = {
  create: async (
    barbershopId: number,
    data: CreateOfferedServiceRequestDto
  ): Promise<OfferedServiceResponseDto> => {
    const response = await api.post<OfferedServiceResponseDto>(
      `/barbershops/${barbershopId}/services`,
      data
    );
    return response.data;
  },

  update: async (
    serviceId: number,
    data: UpdateOfferedServiceRequestDto
  ): Promise<OfferedServiceResponseDto> => {
    const response = await api.patch<OfferedServiceResponseDto>(`/services/${serviceId}`, data);
    return response.data;
  },

  delete: async (serviceId: number): Promise<void> => {
    await api.delete(`/services/${serviceId}`);
  },
};
