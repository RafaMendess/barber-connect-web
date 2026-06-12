import api from './api';
import {
  ScheduleBlockResponseDto,
  CreateScheduleBlockRequestDto,
  UpdateScheduleBlockRequestDto,
} from '@/types/api';

export const scheduleBlockService = {
  getAll: async (barberId: number): Promise<ScheduleBlockResponseDto[]> => {
    const response = await api.get<ScheduleBlockResponseDto[]>(`/barbers/${barberId}/schedule-blocks`);
    return response.data;
  },

  create: async (
    barberId: number,
    data: CreateScheduleBlockRequestDto
  ): Promise<ScheduleBlockResponseDto> => {
    const response = await api.post<ScheduleBlockResponseDto>(
      `/barbers/${barberId}/schedule-blocks`,
      data
    );
    return response.data;
  },

  update: async (
    barberId: number,
    blockId: number,
    data: UpdateScheduleBlockRequestDto
  ): Promise<ScheduleBlockResponseDto> => {
    const response = await api.patch<ScheduleBlockResponseDto>(
      `/barbers/${barberId}/schedule-blocks/${blockId}`,
      data
    );
    return response.data;
  },

  delete: async (barberId: number, blockId: number): Promise<void> => {
    await api.delete(`/barbers/${barberId}/schedule-blocks/${blockId}`);
  },
};
