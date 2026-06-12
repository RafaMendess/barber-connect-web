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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { paymentService } from '@/services/paymentService';
import { PaymentResponseDto, PaymentStatus } from '@/types/api';
import { useBarbershop } from '@/contexts/BarbershopContext';
import { PageHeader, LoadingState, EmptyState, ErrorState } from '@/components/shared';
import { StatusChip } from '@/components/shared/StatusChip';
import { Notification } from '@/components/shared/Notification';
import { useNotification } from '@/hooks/useNotification';
import { formatDateTime, formatCurrency, PAYMENT_METHOD_LABELS } from '@/utils/format';

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'REFUNDED', 'FAILED']),
});

type UpdateStatusForm = z.infer<typeof updateStatusSchema>;

const PAYMENT_STATUSES: PaymentStatus[] = ['PENDING', 'PAID', 'REFUNDED', 'FAILED'];

export function PaymentsPage() {
  const { currentBarbershop } = useBarbershop();
  const [payments, setPayments] = useState<PaymentResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editTarget, setEditTarget] = useState<PaymentResponseDto | null>(null);
  const [saving, setSaving] = useState(false);
  const { notification, success, error: notifyError, close } = useNotification();

  const { register, handleSubmit, reset } = useForm<UpdateStatusForm>({
    resolver: zodResolver(updateStatusSchema),
  });

  const load = useCallback(async () => {
    if (!currentBarbershop) return;
    setLoading(true);
    setError('');
    try {
      const data = await paymentService.getAll(currentBarbershop.id);
      setPayments(data);
    } catch {
      setError('Não foi possível carregar os pagamentos.');
    } finally {
      setLoading(false);
    }
  }, [currentBarbershop]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (p: PaymentResponseDto) => {
    setEditTarget(p);
    reset({ status: p.status });
  };

  const onSubmit = async (data: UpdateStatusForm) => {
    if (!editTarget) return;
    setSaving(true);
    try {
      await paymentService.updateStatus(editTarget.id, data);
      success('Status do pagamento atualizado!');
      setEditTarget(null);
      await load();
    } catch {
      notifyError('Erro ao atualizar status.');
    } finally {
      setSaving(false);
    }
  };

  if (!currentBarbershop) {
    return <Alert severity="warning">Selecione uma barbearia para ver os pagamentos.</Alert>;
  }
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <Box>
      <PageHeader
        title="Pagamentos"
        subtitle={`Barbearia: ${currentBarbershop.name}`}
      />

      {payments.length === 0 ? (
        <EmptyState
          title="Nenhum pagamento encontrado"
          description="Os pagamentos aparecerão aqui conforme os agendamentos forem concluídos"
        />
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3 }} elevation={0} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID Agendamento</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Método</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Data Pagamento</TableCell>
                <TableCell>Criado em</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>#{p.appointmentId}</TableCell>
                  <TableCell>{formatCurrency(p.amount)}</TableCell>
                  <TableCell>{PAYMENT_METHOD_LABELS[p.method] ?? p.method}</TableCell>
                  <TableCell><StatusChip status={p.status} /></TableCell>
                  <TableCell>{p.paidAt ? formatDateTime(p.paidAt) : '-'}</TableCell>
                  <TableCell>{formatDateTime(p.createdAt)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Alterar Status">
                      <IconButton size="small" onClick={() => openEdit(p)}>
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

      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Alterar Status do Pagamento</DialogTitle>
        <DialogContent>
          <Box mt={1}>
            <TextField
              select
              label="Status *"
              fullWidth
              defaultValue={editTarget?.status ?? 'PENDING'}
              {...register('status')}
            >
              {PAYMENT_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  <StatusChip status={s} />
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTarget(null)} disabled={saving}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Notification {...notification} onClose={close} />
    </Box>
  );
}
