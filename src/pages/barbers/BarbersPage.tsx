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
  Chip,
  Alert,
} from '@mui/material';
import { Edit, ToggleOn, ToggleOff } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { barberSchema, updateBarberSchema, BarberFormData, UpdateBarberFormData } from '@/schemas';
import { barbershopService } from '@/services/barbershopService';
import { barberService } from '@/services/barberService';
import { BarberResponseDto } from '@/types/api';
import { useBarbershop } from '@/contexts/BarbershopContext';
import { PageHeader, LoadingState, EmptyState, ErrorState } from '@/components/shared';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Notification } from '@/components/shared/Notification';
import { useNotification } from '@/hooks/useNotification';

export function BarbersPage() {
  const { currentBarbershop } = useBarbershop();
  const [barbers, setBarbers] = useState<BarberResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BarberResponseDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<BarberResponseDto | null>(null);
  const { notification, success, error: notifyError, close } = useNotification();

  const createForm = useForm<BarberFormData>({ resolver: zodResolver(barberSchema) });
  const editForm = useForm<UpdateBarberFormData>({ resolver: zodResolver(updateBarberSchema) });

  const load = useCallback(async () => {
    if (!currentBarbershop) return;
    setLoading(true);
    setError('');
    try {
      const data = await barbershopService.getBarbers(currentBarbershop.id);
      setBarbers(data);
    } catch {
      setError('Não foi possível carregar os barbeiros.');
    } finally {
      setLoading(false);
    }
  }, [currentBarbershop]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditTarget(null);
    createForm.reset({ specialty: '', description: '' } as BarberFormData);
    setDialogOpen(true);
  };

  const openEdit = (b: BarberResponseDto) => {
    setEditTarget(b);
    editForm.reset({ specialty: b.specialty ?? '', description: b.description ?? '' });
    setDialogOpen(true);
  };

  const onSubmitCreate = async (data: BarberFormData) => {
    if (!currentBarbershop) return;
    setSaving(true);
    try {
      await barberService.create(currentBarbershop.id, data);
      success('Barbeiro cadastrado com sucesso!');
      setDialogOpen(false);
      await load();
    } catch {
      notifyError('Erro ao cadastrar barbeiro.');
    } finally {
      setSaving(false);
    }
  };

  const onSubmitEdit = async (data: UpdateBarberFormData) => {
    if (!editTarget) return;
    setSaving(true);
    try {
      await barberService.update(editTarget.id, data);
      success('Barbeiro atualizado com sucesso!');
      setDialogOpen(false);
      await load();
    } catch {
      notifyError('Erro ao atualizar barbeiro.');
    } finally {
      setSaving(false);
    }
  };

  if (!currentBarbershop) {
    return <Alert severity="warning">Selecione uma barbearia para gerenciar os barbeiros.</Alert>;
  }
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <Box>
      <PageHeader
        title="Barbeiros"
        subtitle={`Barbearia: ${currentBarbershop.name}`}
        action={{ label: 'Novo Barbeiro', onClick: openCreate }}
      />

      {barbers.length === 0 ? (
        <EmptyState
          title="Nenhum barbeiro cadastrado"
          description="Cadastre o primeiro barbeiro da equipe"
          action={{ label: 'Novo Barbeiro', onClick: openCreate }}
        />
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3 }} elevation={0} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Especialidade</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {barbers.map((b) => (
                <TableRow key={b.id} hover>
                  <TableCell>{b.name ?? '-'}</TableCell>
                  <TableCell>{b.email ?? '-'}</TableCell>
                  <TableCell>{b.specialty ?? '-'}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => openEdit(b)}>
                        <Edit fontSize="small" />
                      </IconButton>
                   
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Dialog */}
      {!editTarget && (
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Novo Barbeiro</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} mt={1}>
              <TextField
                label="ID do Usuário *"
                type="number"
                fullWidth
                error={!!createForm.formState.errors.userId}
                helperText={createForm.formState.errors.userId?.message}
                {...createForm.register('userId', { valueAsNumber: true })}
              />
              <TextField
                label="Especialidade"
                fullWidth
                {...createForm.register('specialty')}
              />
              <TextField
                label="Descrição"
                fullWidth
                multiline
                rows={3}
                {...createForm.register('description')}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} disabled={saving}>Cancelar</Button>
            <Button variant="contained" onClick={createForm.handleSubmit(onSubmitCreate)} disabled={saving}>
              {saving ? 'Salvando...' : 'Cadastrar'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Edit Dialog */}
      {editTarget && (
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Editar Barbeiro — {editTarget.name}</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} mt={1}>
              <TextField
                label="Especialidade"
                fullWidth
                {...editForm.register('specialty')}
              />
              <TextField
                label="Descrição"
                fullWidth
                multiline
                rows={3}
                {...editForm.register('description')}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} disabled={saving}>Cancelar</Button>
            <Button variant="contained" onClick={editForm.handleSubmit(onSubmitEdit)} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
      <Notification {...notification} onClose={close} />
    </Box>
  );
}
