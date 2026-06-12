import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  TextField,
  MenuItem,
} from '@mui/material';
import { Cancel } from '@mui/icons-material';
import { appointmentService } from '@/services/appointmentService';
import { barbershopService } from '@/services/barbershopService';
import { AppointmentResponseDto, AppointmentStatus } from '@/types/api';
import { useBarbershop } from '@/contexts/BarbershopContext';
import { PageHeader, LoadingState, EmptyState, ErrorState } from '@/components/shared';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatusChip } from '@/components/shared/StatusChip';
import { Notification } from '@/components/shared/Notification';
import { useNotification } from '@/hooks/useNotification';
import { formatDateTime, formatCurrency } from '@/utils/format';

const STATUS_FILTER_OPTIONS: { value: AppointmentStatus | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'SCHEDULED', label: 'Agendado' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'CANCELLED', label: 'Cancelado' },
  { value: 'COMPLETED', label: 'Concluído' },
];

export function AppointmentsPage() {
  const { currentBarbershop } = useBarbershop();
  const [appointments, setAppointments] = useState<AppointmentResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | ''>('');
  const [cancelTarget, setCancelTarget] = useState<AppointmentResponseDto | null>(null);
  const { notification, success, error: notifyError, close } = useNotification();

  const load = useCallback(async () => {
    if (!currentBarbershop) return;
    setLoading(true);
    setError('');
    try {
      // Fetch barbers of the current barbershop and aggregate appointments per barber
      const barbers = await barbershopService.getBarbers(currentBarbershop.id);
      if (barbers.length === 0) {
        setAppointments([]);
      } else {
        const promises = barbers.map((b) => appointmentService.getByBarber(b.id).catch(() => []));
        const results = await Promise.all(promises);
        const merged = results.flat();
        setAppointments(merged);
      }
    } catch {
      setError('Não foi possível carregar os agendamentos.');
    } finally {
      setLoading(false);
    }
  }, [currentBarbershop]);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      await appointmentService.cancel(cancelTarget.id);
      success('Agendamento cancelado com sucesso!');
      await load();
    } catch {
      notifyError('Erro ao cancelar agendamento.');
    } finally {
      setCancelTarget(null);
    }
  };

  const filtered = statusFilter
    ? appointments.filter((a) => a.status === statusFilter)
    : appointments;

  if (!currentBarbershop) {
    return <Alert severity="warning">Selecione uma barbearia para ver os agendamentos.</Alert>;
  }
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <Box>
      <PageHeader
        title="Agendamentos"
        subtitle={`Barbearia: ${currentBarbershop.name}`}
      />

      {/* Filters */}
      <Box mb={2} display="flex" gap={2} flexWrap="wrap">
        <TextField
          select
          label="Filtrar por status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | '')}
          size="small"
          sx={{ minWidth: 200 }}
        >
          {STATUS_FILTER_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </TextField>
      </Box>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhum agendamento encontrado"
          description={statusFilter ? 'Tente remover o filtro de status' : 'Não há agendamentos para esta barbearia'}
        />
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3 }} elevation={0} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data/Hora</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Barbeiro</TableCell>
                <TableCell>Serviço</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id} hover>
                  <TableCell>{formatDateTime(a.appointmentDateTime)}</TableCell>
                  <TableCell>{a.client?.name ?? '-'}</TableCell>
                  <TableCell>{a.barber?.name ?? '-'}</TableCell>
                  <TableCell>{a.service?.name ?? '-'}</TableCell>
                  <TableCell>
                    {a.service?.price != null ? formatCurrency(a.service.price) : '-'}
                  </TableCell>
                  <TableCell>
                    <StatusChip status={a.status} />
                  </TableCell>
                  <TableCell align="right">
                    {(a.status === 'SCHEDULED' || a.status === 'CONFIRMED') && (
                      <Tooltip title="Cancelar">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setCancelTarget(a)}
                        >
                          <Cancel fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ConfirmDialog
        open={!!cancelTarget}
        title="Cancelar Agendamento"
        message={`Deseja cancelar o agendamento de ${cancelTarget?.client?.name} em ${cancelTarget ? formatDateTime(cancelTarget.appointmentDateTime) : ''}?`}
        confirmLabel="Cancelar Agendamento"
        onConfirm={handleCancel}
        onCancel={() => setCancelTarget(null)}
      />

      <Notification {...notification} onClose={close} />
    </Box>
  );
}
