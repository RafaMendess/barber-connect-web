import { Chip } from '@mui/material';
import { STATUS_LABELS } from '@/utils/format';

type StatusColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

const STATUS_COLORS: Record<string, StatusColor> = {
  SCHEDULED: 'info',
  CONFIRMED: 'primary',
  CANCELLED: 'error',
  COMPLETED: 'success',
  PENDING: 'warning',
  PAID: 'success',
  REFUNDED: 'secondary',
  FAILED: 'error',
};

interface StatusChipProps {
  status: string;
  size?: 'small' | 'medium';
}

export function StatusChip({ status, size = 'small' }: StatusChipProps) {
  return (
    <Chip
      label={STATUS_LABELS[status] ?? status}
      color={STATUS_COLORS[status] ?? 'default'}
      size={size}
    />
  );
}
