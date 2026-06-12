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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  MenuItem,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { availabilitySchema, AvailabilityFormData } from '@/schemas';
import { availabilityService } from '@/services/availabilityService';
import { barbershopService } from '@/services/barbershopService';
import { AvailabilityResponseDto, BarberResponseDto } from '@/types/api';
import { useBarbershop } from '@/contexts/BarbershopContext';
import { PageHeader, LoadingState, EmptyState, ErrorState } from '@/components/shared';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Notification } from '@/components/shared/Notification';
import { useNotification } from '@/hooks/useNotification';
import { formatDayOfWeek, formatTime } from '@/utils/format';

const DAYS = [1, 2, 3, 4, 5, 6, 7];

export function AvailabilitiesPage() {
  const { currentBarbershop } = useBarbershop();
  const [barbers, setBarbers] = useState<BarberResponseDto[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState<number | ''>('');
  const [availabilities, setAvailabilities] = useState<AvailabilityResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AvailabilityResponseDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AvailabilityResponseDto | null>(null);
  const [saving, setSaving] = useState(false);
  const { notification, success, error: notifyError, close } = useNotification();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AvailabilityFormData>({
    resolver: zodResolver(availabilitySchema),
  });

  const loadBarbers = useCallback(async () => {
    if (!currentBarbershop) return;
    try {
      const data = await barbershopService.getBarbers(currentBarbershop.id);
      setBarbers(data);
      if (data.length > 0) setSelectedBarberId(data[0].id);
    } catch { /* ignore */ }
  }, [currentBarbershop]);

  const loadAvailabilities = useCallback(async (barberId: number) => {
    setLoading(true);
    setError('');
    try {
      const data = await availabilityService.getAll(barberId);
      setAvailabilities(data);
    } catch {
      setError('Não foi possível carregar as disponibilidades.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBarbers(); }, [loadBarbers]);
  useEffect(() => {
    if (selectedBarberId) loadAvailabilities(Number(selectedBarberId));
  }, [selectedBarberId, loadAvailabilities]);

  const openCreate = () => {
    setEditTarget(null);
    reset({ dayOfWeek: 1, startTime: '08:00', endTime: '18:00' });
    setDialogOpen(true);
  };

  const openEdit = (a: AvailabilityResponseDto) => {
    setEditTarget(a);
    reset({ dayOfWeek: a.dayOfWeek, startTime: formatTime(a.startTime), endTime: formatTime(a.endTime) });
    setDialogOpen(true);
  };

  const onSubmit = async (data: AvailabilityFormData) => {
    if (!selectedBarberId) return;
    setSaving(true);
    try {
      if (editTarget) {
        await availabilityService.update(Number(selectedBarberId), editTarget.id, data);
        success('Disponibilidade atualizada!');
      } else {
        await availabilityService.create(Number(selectedBarberId), data);
        success('Disponibilidade criada!');
      }
      setDialogOpen(false);
      await loadAvailabilities(Number(selectedBarberId));
    } catch {
      notifyError('Erro ao salvar disponibilidade.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !selectedBarberId) return;
    try {
      await availabilityService.delete(Number(selectedBarberId), deleteTarget.id);
      success('Disponibilidade excluída!');
      await loadAvailabilities(Number(selectedBarberId));
    } catch {
      notifyError('Erro ao excluir disponibilidade.');
    } finally {
      setDeleteTarget(null);
    }
  };

  if (!currentBarbershop) {
    return <Alert severity="warning">Selecione uma barbearia para gerenciar disponibilidades.</Alert>;
  }

  return (
    <Box>
      <PageHeader
        title="Disponibilidades"
        subtitle="Gerencie os horários disponíveis dos barbeiros"
        action={selectedBarberId ? { label: 'Nova Disponibilidade', onClick: openCreate } : undefined}
      />

      <Box mb={2}>
        <TextField
          select
          label="Barbeiro"
          value={selectedBarberId}
          onChange={(e) => setSelectedBarberId(Number(e.target.value))}
          sx={{ minWidth: 250 }}
          size="small"
        >
          {barbers.map((b) => (
            <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
          ))}
        </TextField>
      </Box>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => selectedBarberId && loadAvailabilities(Number(selectedBarberId))} />
      ) : !selectedBarberId ? (
        <Alert severity="info">Selecione um barbeiro para ver as disponibilidades.</Alert>
      ) : availabilities.length === 0 ? (
        <EmptyState
          title="Nenhuma disponibilidade cadastrada"
          description="Defina os dias e horários disponíveis do barbeiro"
          action={{ label: 'Nova Disponibilidade', onClick: openCreate }}
        />
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3 }} elevation={0} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Dia da Semana</TableCell>
                <TableCell>Início</TableCell>
                <TableCell>Término</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {availabilities.map((a) => (
                <TableRow key={a.id} hover>
                  <TableCell>{formatDayOfWeek(a.dayOfWeek)}</TableCell>
                  <TableCell>{formatTime(a.startTime)}</TableCell>
                  <TableCell>{formatTime(a.endTime)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => openEdit(a)}><Edit fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(a)}><Delete fontSize="small" /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editTarget ? 'Editar Disponibilidade' : 'Nova Disponibilidade'}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              select
              label="Dia da Semana *"
              fullWidth
              defaultValue={1}
              error={!!errors.dayOfWeek}
              helperText={errors.dayOfWeek?.message}
              {...register('dayOfWeek', { valueAsNumber: true })}
            >
              {DAYS.map((d) => (
                <MenuItem key={d} value={d}>{formatDayOfWeek(d)}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Horário Início *"
              type="time"
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.startTime}
              helperText={errors.startTime?.message}
              {...register('startTime')}
            />
            <TextField
              label="Horário Término *"
              type="time"
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.endTime}
              helperText={errors.endTime?.message}
              {...register('endTime')}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir Disponibilidade"
        message={`Excluir disponibilidade de ${deleteTarget ? formatDayOfWeek(deleteTarget.dayOfWeek) : ''}?`}
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <Notification {...notification} onClose={close} />
    </Box>
  );
}
