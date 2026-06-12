export const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Agendado',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
  COMPLETED: 'Concluído',
  PENDING: 'Pendente',
  PAID: 'Pago',
  REFUNDED: 'Estornado',
  FAILED: 'Falhou',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CREDIT_CARD: 'Cartão de Crédito',
  DEBIT_CARD: 'Cartão de Débito',
  PIX: 'Pix',
  BOLETO: 'Boleto',
  CASH: 'Dinheiro',
};

export function formatCurrency(value?: number | null): string {
  if (value == null) return '-';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatMinutes(minutes?: number | null): string {
  if (minutes == null) return '-';
  return `${minutes} min`;
}

export function formatDateTime(value?: string | Date | null): string {
  if (!value) return '-';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(value?: string | Date | null): string {
  if (!value) return '-';
  if (typeof value === 'string' && /^\d{2}:\d{2}$/.test(value)) return value;
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function formatDayOfWeek(day?: number | null): string {
  if (!day) return '-';
  const map: Record<number, string> = {
    1: 'Segunda-feira',
    2: 'Terça-feira',
    3: 'Quarta-feira',
    4: 'Quinta-feira',
    5: 'Sexta-feira',
    6: 'Sábado',
    7: 'Domingo',
  };
  return map[day] ?? `Dia ${day}`;
}
