import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { BarbershopResponseDto } from '@/types/api';
import { barbershopService } from '@/services/barbershopService';
import { useAuth } from '@/contexts/AuthContext';

interface BarbershopContextData {
  barbershops: BarbershopResponseDto[];
  currentBarbershop: BarbershopResponseDto | null;
  setCurrentBarbershop: (b: BarbershopResponseDto | null) => void;
  fetchBarbershops: () => Promise<void>;
  isLoading: boolean;
}

const BarbershopContext = createContext<BarbershopContextData>({} as BarbershopContextData);

export function BarbershopProvider({ children }: { children: React.ReactNode }) {
  const [barbershops, setBarbershops] = useState<BarbershopResponseDto[]>([]);
  const [currentBarbershop, setCurrentBarbershop] = useState<BarbershopResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const initialized = useRef(false);

  const { user } = useAuth();

  const fetchBarbershops = useCallback(async () => {
    setIsLoading(true);
    try {
      // Busca as barbearias do usuário logado (endpoint: /barbershops/owner/:id)
      if (!user) {
        setBarbershops([]);
        setCurrentBarbershop(null);
        return;
      }
      const ownerId = Number(user.id);
      if (!Number.isFinite(ownerId)) {
        setBarbershops([]);
        setCurrentBarbershop(null);
        return;
      }
      const data = await barbershopService.getByOwner(ownerId);
      setBarbershops(data);
      // Seleciona a primeira barbearia na primeira carga, se existir
      if (!initialized.current && data.length > 0) {
        setCurrentBarbershop(data[0]);
        initialized.current = true;
      }
      // Se a lista mudar e currentBarbershop não pertencer mais ao usuário, reseta para primeira
      if (currentBarbershop && !data.find((b) => b.id === currentBarbershop.id)) {
        setCurrentBarbershop(data[0] ?? null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, currentBarbershop]);

  // Re-fetch when user changes
  useEffect(() => {
    // reset initialized when user changes to allow selecting default for new user
    initialized.current = false;
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchBarbershops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <BarbershopContext.Provider
      value={{ barbershops, currentBarbershop, setCurrentBarbershop, fetchBarbershops, isLoading }}
    >
      {children}
    </BarbershopContext.Provider>
  );
}

export function useBarbershop() {
  const context = useContext(BarbershopContext);
  if (!context) throw new Error('useBarbershop must be used within BarbershopProvider');
  return context;
}
