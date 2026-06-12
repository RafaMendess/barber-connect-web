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
  InputAdornment,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { offeredServiceSchema, OfferedServiceFormData } from '@/schemas';
import { barbershopService } from '@/services/barbershopService';
import { offeredServiceService } from '@/services/offeredServiceService';
import { OfferedServiceResponseDto } from '@/types/api';
import { useBarbershop } from '@/contexts/BarbershopContext';
import { PageHeader, LoadingState, EmptyState, ErrorState } from '@/components/shared';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Notification } from '@/components/shared/Notification';
import { useNotification } from '@/hooks/useNotification';
import { formatCurrency, formatMinutes } from '@/utils/format';

export function ServicesPage() {
  const { currentBarbershop } = useBarbershop();
  const [services, setServices] = useState<OfferedServiceResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<OfferedServiceResponseDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OfferedServiceResponseDto | null>(null);
  const [saving, setSaving] = useState(false);
  const { notification, success, error: notifyError, close } = useNotification();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<OfferedServiceFormData>({
    resolver: zodResolver(offeredServiceSchema),
  });

  const load = useCallback(async () => {
    if (!currentBarbershop) return;
    setLoading(true);
    setError('');
    try {
      const data = await barbershopService.getServices(currentBarbershop.id);
      setServices(data);
    } catch {
      setError('Não foi possível carregar os serviços.');
    } finally {
      setLoading(false);
    }
  }, [currentBarbershop]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditTarget(null);
    reset({ name: '', description: '', price: 0, estimatedTime: 30 });
    setDialogOpen(true);
  };

  const openEdit = (s: OfferedServiceResponseDto) => {
    setEditTarget(s);
    reset({ name: s.name, description: s.description ?? '', price: s.price, estimatedTime: s.estimatedTime });
    setDialogOpen(true);
  };

  const onSubmit = async (data: OfferedServiceFormData) => {
    if (!currentBarbershop) return;
    setSaving(true);
    try {
      if (editTarget) {
        await offeredServiceService.update(editTarget.id, data);
        success('Serviço atualizado com sucesso!');
      } else {
        await offeredServiceService.create(currentBarbershop.id, data);
        success('Serviço criado com sucesso!');
      }
      setDialogOpen(false);
      await load();
    } catch {
      notifyError('Erro ao salvar serviço.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await offeredServiceService.delete(deleteTarget.id);
      success('Serviço excluído com sucesso!');
      await load();
    } catch {
      notifyError('Erro ao excluir serviço.');
    } finally {
      setDeleteTarget(null);
    }
  };

  if (!currentBarbershop) {
    return <Alert severity="warning">Selecione uma barbearia para gerenciar os serviços.</Alert>;
  }
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <Box>
      <PageHeader
        title="Serviços"
        subtitle={`Barbearia: ${currentBarbershop.name}`}
        action={{ label: 'Novo Serviço', onClick: openCreate }}
      />

      {services.length === 0 ? (
        <EmptyState
          title="Nenhum serviço cadastrado"
          description="Cadastre os serviços oferecidos pela barbearia"
          action={{ label: 'Novo Serviço', onClick: openCreate }}
        />
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3 }} elevation={0} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Preço</TableCell>
                <TableCell>Duração</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.description ?? '-'}</TableCell>
                  <TableCell>{formatCurrency(s.price)}</TableCell>
                  <TableCell>{formatMinutes(s.estimatedTime)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => openEdit(s)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(s)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editTarget ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Nome *"
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register('name')}
            />
            <TextField
              label="Descrição"
              fullWidth
              multiline
              rows={2}
              {...register('description')}
            />
            <TextField
              label="Preço *"
              type="number"
              fullWidth
              InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
              error={!!errors.price}
              helperText={errors.price?.message}
              {...register('price', { valueAsNumber: true })}
            />
            <TextField
              label="Tempo Estimado (minutos) *"
              type="number"
              fullWidth
              error={!!errors.estimatedTime}
              helperText={errors.estimatedTime?.message}
              {...register('estimatedTime', { valueAsNumber: true })}
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
        title="Excluir Serviço"
        message={`Deseja excluir o serviço "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <Notification {...notification} onClose={close} />
    </Box>
  );
}
