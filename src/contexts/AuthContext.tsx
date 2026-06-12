import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '@/services/authService';
import { LoginRequestDto, UserAuthResponseDto } from '@/types/api';
import { jwtDecode } from '@/utils/jwtDecode';

interface AuthContextData {
  user: UserAuthResponseDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequestDto) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserAuthResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (function initFromToken() {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const decoded = jwtDecode(token);
        if (decoded && decoded.exp * 1000 > Date.now()) {
          const extractId = (p: any): number | null => {
            if (!p) return null;
            // Prefer explicit numeric claims
            const preferKeys = ['userId', 'user_id', 'id', 'uid', 'nameid'];
            for (const key of preferKeys) {
              const v = (p as any)[key];
              if (v === undefined || v === null) continue;
              const n = Number(v);
              if (Number.isFinite(n)) return n;
            }
            // Namespaced/other keys
            const nsKeys = Object.keys(p).filter((k) => /nameidentifier|nameid|userid|user.id/i.test(k));
            for (const k of nsKeys) {
              const v = (p as any)[k];
              const n = Number(v);
              if (Number.isFinite(n)) return n;
            }
            // Only use `sub` if it's purely numeric (avoid emails like 'user220@...')
            const sub = p.sub;
            if (sub !== undefined && sub !== null) {
              if (typeof sub === 'number') return sub;
              if (typeof sub === 'string' && /^\d+$/.test(sub)) return Number(sub);
            }
            return null;
          };
          const maybeId = extractId(decoded as any);
          const id = maybeId ?? 0;
          
            // eslint-disable-next-line no-console
            console.log('Decoded JWT payload (AuthProvider init):', decoded, '-> extractedId:', id);
          
          setUser({
            id,
            name: decoded.name || '',
            email: decoded.email || '',
            roles: decoded.roles || [],
          });
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      } catch (e) {
        // on parse error, clear tokens
        // eslint-disable-next-line no-console
        console.warn('Failed to parse accessToken', e);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (data: LoginRequestDto) => {
    const response = await authService.login(data);
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);

    const decoded = jwtDecode(response.accessToken);
    const extractId = (p: any): number | null => {
      if (!p) return null;
      const preferKeys = ['userId', 'user_id', 'id', 'uid', 'nameid'];
      for (const key of preferKeys) {
        const v = (p as any)[key];
        if (v === undefined || v === null) continue;
        const n = Number(v);
        if (Number.isFinite(n)) return n;
      }
      const nsKeys = Object.keys(p).filter((k) => /nameidentifier|nameid|userid|user.id/i.test(k));
      for (const k of nsKeys) {
        const v = (p as any)[k];
        const n = Number(v);
        if (Number.isFinite(n)) return n;
      }
      const sub = p.sub;
      if (sub !== undefined && sub !== null) {
        if (typeof sub === 'number') return sub;
        if (typeof sub === 'string' && /^\d+$/.test(sub)) return Number(sub);
      }
      return null;
    };

    const maybeId = extractId(decoded as any);
    const id = maybeId ?? 0;

   
      // eslint-disable-next-line no-console
      console.log('Decoded JWT payload (login):', decoded, '-> extractedId:', id);
    
    
    setUser({
      id,
      name: decoded?.name || '',
      email: decoded?.email || '',
      roles: decoded?.roles || [],
    });
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await authService.logout({ refreshToken });
      } catch {
        // ignore logout errors
      }
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
