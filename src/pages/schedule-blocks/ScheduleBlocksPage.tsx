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
import { scheduleBlockSchema, ScheduleBlockFormData } from '@/schemas';
import { scheduleBlockService } from '@/services/scheduleBlockService';
import { barbershopService } from '@/services/barbershopService';
import { ScheduleBlockResponseDto, BarberResponseDto } from '@/types/api';
import { useBarbershop } from '@/contexts/BarbershopContext';
import { PageHeader, LoadingState, EmptyState, ErrorState } from '@/components/shared';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Notification } from '@/components/shared/Notification';
import { useNotification } from '@/hooks/useNotification';
import { formatDateTime } from '@/utils/format';

export function ScheduleBlocksPage() {
  const { currentBarbershop } = useBarbershop();
  const [barbers, setBarbers] = useState<BarberResponseDto[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState<number | ''>('');
  const [blocks, setBlocks] = useState<ScheduleBlockResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ScheduleBlockResponseDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ScheduleBlockResponseDto | null>(null);
  const [saving, setSaving] = useState(false);
  const { notification, success, error: notifyError, close } = useNotification();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ScheduleBlockFormData>({
    resolver: zodResolver(scheduleBlockSchema),
  });

  const loadBarbers = useCallback(async () => {
    if (!currentBarbershop) return;
    try {
      const data = await barbershopService.getBarbers(currentBarbershop.id);
      setBarbers(data);
      if (data.length > 0) setSelectedBarberId(data[0].id);
    } catch { /* ignore */ }
  }, [currentBarbershop]);

  const loadBlocks = useCallback(async (barberId: number) => {
    setLoading(true);
    setError('');
    try {
      const data = await scheduleBlockService.getAll(barberId);
      setBlocks(data);
    } catch {
      setError('Não foi possível carregar os bloqueios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBarbers(); }, [loadBarbers]);
  useEffect(() => {
    if (selectedBarberId) loadBlocks(Number(selectedBarberId));
  }, [selectedBarberId, loadBlocks]);

  const toLocalInput = (iso: string) => iso.replace('Z', '').substring(0, 16);

  const openCreate = () => {
    setEditTarget(null);
    reset({ startDateTime: '', endDateTime: '', reason: '' });
    setDialogOpen(true);
  };

  const openEdit = (b: ScheduleBlockResponseDto) => {
    setEditTarget(b);
    reset({
      startDateTime: toLocalInput(b.startDateTime),
      endDateTime: toLocalInput(b.endDateTime),
      reason: b.reason ?? '',
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: ScheduleBlockFormData) => {
    if (!selectedBarberId) return;
    setSaving(true);
    try {
      if (editTarget) {
        await scheduleBlockService.update(Number(selectedBarberId), editTarget.id, data);
        success('Bloqueio atualizado!');
      } else {
        await scheduleBlockService.create(Number(selectedBarberId), data);
        success('Bloqueio criado!');
      }
      setDialogOpen(false);
      await loadBlocks(Number(selectedBarberId));
    } catch {
      notifyError('Erro ao salvar bloqueio.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !selectedBarberId) return;
    try {
      await scheduleBlockService.delete(Number(selectedBarberId), deleteTarget.id);
      success('Bloqueio excluído!');
      await loadBlocks(Number(selectedBarberId));
    } catch {
      notifyError('Erro ao excluir bloqueio.');
    } finally {
      setDeleteTarget(null);
    }
  };

  if (!currentBarbershop) {
    return <Alert severity="warning">Selecione uma barbearia para gerenciar bloqueios.</Alert>;
  }

  return (
    <Box>
      <PageHeader
        title="Bloqueios de Agenda"
        subtitle="Gerencie os períodos bloqueados dos barbeiros"
        action={selectedBarberId ? { label: 'Novo Bloqueio', onClick: openCreate } : undefined}
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
            <MenuItem key={b.id} value={b.id}>{b.name ?? `Barbeiro #${b.id}`}</MenuItem>
          ))}
        </TextField>
      </Box>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => selectedBarberId && loadBlocks(Number(selectedBarberId))} />
      ) : !selectedBarberId ? (
        <Alert severity="info">Selecione um barbeiro para ver os bloqueios.</Alert>
      ) : blocks.length === 0 ? (
        <EmptyState
          title="Nenhum bloqueio cadastrado"
          description="Bloqueie períodos de indisponibilidade do barbeiro"
          action={{ label: 'Novo Bloqueio', onClick: openCreate }}
        />
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3 }} elevation={0} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Início</TableCell>
                <TableCell>Término</TableCell>
                <TableCell>Motivo</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {blocks.map((b) => (
                <TableRow key={b.id} hover>
                  <TableCell>{formatDateTime(b.startDateTime)}</TableCell>
                  <TableCell>{formatDateTime(b.endDateTime)}</TableCell>
                  <TableCell>{b.reason ?? '-'}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => openEdit(b)}><Edit fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(b)}><Delete fontSize="small" /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editTarget ? 'Editar Bloqueio' : 'Novo Bloqueio'}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Data/Hora Início *"
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.startDateTime}
              helperText={errors.startDateTime?.message}
              {...register('startDateTime')}
            />
            <TextField
              label="Data/Hora Término *"
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.endDateTime}
              helperText={errors.endDateTime?.message}
              {...register('endDateTime')}
            />
            <TextField
              label="Motivo"
              fullWidth
              multiline
              rows={2}
              placeholder="Ex: Férias, compromisso pessoal..."
              {...register('reason')}
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
        title="Excluir Bloqueio"
        message="Deseja excluir este bloqueio de agenda?"
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <Notification {...notification} onClose={close} />
    </Box>
  );
}
