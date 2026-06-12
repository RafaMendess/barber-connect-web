import api from './api';
import {
  LoginRequestDto,
  RegisterRequestDto,
  AuthResponseDto,
  ForgotPasswordRequestDto,
  ResetPasswordRequestDto,
  ResendVerificationCodeRequestDto,
  LogoutRequestDto,
} from '@/types/api';

export const authService = {
  login: async (data: LoginRequestDto): Promise<AuthResponseDto> => {
    const response = await api.post<AuthResponseDto>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequestDto): Promise<AuthResponseDto> => {
    const response = await api.post<AuthResponseDto>('/auth/register', data);
    return response.data;
  },

  logout: async (data: LogoutRequestDto): Promise<void> => {
    await api.post('/auth/logout', data);
  },

  forgotPassword: async (data: ForgotPasswordRequestDto): Promise<void> => {
    await api.post('/auth/forgot-password', data);
  },

  resetPassword: async (data: ResetPasswordRequestDto): Promise<void> => {
    await api.post('/auth/reset-password', data);
  },

  resendVerification: async (data: ResendVerificationCodeRequestDto): Promise<void> => {
    try {
      await api.post('/auth/resend-verification', data);
    } catch (e: any) {
      // Fallback to an alternative path if backend uses a different name
      if (e?.response?.status === 404) {
        await api.post('/auth/resend-verification-code', data);
        return;
      }
      throw e;
    }
  },
};
