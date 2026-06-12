import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Edit, Store } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { barbershopSchema, BarbershopFormData } from '@/schemas';
import { barbershopService } from '@/services/barbershopService';
import { BarbershopResponseDto } from '@/types/api';
import { useBarbershop } from '@/contexts/BarbershopContext';
import { PageHeader, LoadingState, EmptyState, ErrorState } from '@/components/shared';
import { Notification } from '@/components/shared/Notification';
import { useNotification } from '@/hooks/useNotification';

export function BarbershopsPage() {
  const { barbershops, fetchBarbershops, isLoading } = useBarbershop();
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BarbershopResponseDto | null>(null);
  const [saving, setSaving] = useState(false);
  const { notification, success, error: notifyError, close } = useNotification();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BarbershopFormData>({ resolver: zodResolver(barbershopSchema) });

  const load = useCallback(async () => {
    setError('');
    try {
      await fetchBarbershops();
    } catch {
      setError('Não foi possível carregar as barbearias.');
    }
  }, [fetchBarbershops]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditTarget(null);
    reset({ name: '', phone: '', address: '', businessHours: '', photoUrl: '' });
    setDialogOpen(true);
  };

  const openEdit = (b: BarbershopResponseDto) => {
    setEditTarget(b);
    reset({
      name: b.name,
      phone: b.phone ?? '',
      address: b.address ?? '',
      businessHours: b.businessHours ?? '',
      photoUrl: b.photoUrl ?? '',
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: BarbershopFormData) => {
    setSaving(true);
    try {
      if (editTarget) {
        await barbershopService.update(editTarget.id, data);
        success('Barbearia atualizada com sucesso!');
      } else {
        await barbershopService.create(data);
        success('Barbearia criada com sucesso!');
      }
      setDialogOpen(false);
      await load();
    } catch {
      notifyError('Erro ao salvar barbearia.');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <Box>
      <PageHeader
        title="Barbearias"
        subtitle="Gerencie as barbearias cadastradas"
        action={{ label: 'Nova Barbearia', onClick: openCreate }}
      />

      {barbershops.length === 0 ? (
        <EmptyState
          title="Nenhuma barbearia cadastrada"
          description="Cadastre sua primeira barbearia para começar"
          action={{ label: 'Nova Barbearia', onClick: openCreate }}
        />
      ) : (
        <Grid container spacing={2}>
          {barbershops.map((b) => (
            <Grid item xs={12} sm={6} md={4} key={b.id}>
              <Card sx={{ borderRadius: 3, height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Store color="primary" />
                    <Typography variant="h6" fontWeight={600}>{b.name}</Typography>
                  </Box>
                  {b.phone && (
                    <Typography variant="body2" color="text.secondary">📞 {b.phone}</Typography>
                  )}
                  {b.address && (
                    <Typography variant="body2" color="text.secondary">📍 {b.address}</Typography>
                  )}
                  {b.businessHours && (
                    <Typography variant="body2" color="text.secondary">🕐 {b.businessHours}</Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => openEdit(b)}
                  >
                    Editar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editTarget ? 'Editar Barbearia' : 'Nova Barbearia'}</DialogTitle>
        <DialogContent>
          <Box component="form" display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Nome *"
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register('name')}
            />
            <TextField
              label="Telefone"
              fullWidth
              error={!!errors.phone}
              helperText={errors.phone?.message}
              {...register('phone')}
            />
            <TextField
              label="Endereço"
              fullWidth
              error={!!errors.address}
              helperText={errors.address?.message}
              {...register('address')}
            />
            <TextField
              label="Horário de Funcionamento"
              fullWidth
              placeholder="Ex: Seg-Sex 08:00-18:00"
              error={!!errors.businessHours}
              helperText={errors.businessHours?.message}
              {...register('businessHours')}
            />
            <TextField
              label="URL da Foto"
              fullWidth
              error={!!errors.photoUrl}
              helperText={errors.photoUrl?.message}
              {...register('photoUrl')}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit(onSubmit)}
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Notification {...notification} onClose={close} />
    </Box>
  );
}
