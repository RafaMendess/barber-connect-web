import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
} from '@mui/material';
import {
  ContentCut,
  Spa,
  CalendarMonth,
  CheckCircle,
  Cancel,
  Pending,
  Done,
} from '@mui/icons-material';
import { barbershopService } from '@/services/barbershopService';
import { useBarbershop } from '@/contexts/BarbershopContext';
import { DashboardResponseDto } from '@/types/api';
import { formatDateTime, STATUS_LABELS } from '@/utils/format';
import { LoadingState, ErrorState } from '@/components/shared';
import { StatusChip } from '@/components/shared/StatusChip';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.disabled">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              bgcolor: color,
              borderRadius: 2,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.9,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { currentBarbershop, fetchBarbershops, isLoading: shopLoading } = useBarbershop();
  const [dashboard, setDashboard] = useState<DashboardResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async (id: number) => {
    setLoading(true);
    setError('');
    try {
      const data = await barbershopService.getDashboard(id);
      setDashboard(data);
    } catch {
      setError('Não foi possível carregar os dados do dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBarbershops();
  }, [fetchBarbershops]);

  useEffect(() => {
    if (currentBarbershop) {
      loadDashboard(currentBarbershop.id);
    }
  }, [currentBarbershop, loadDashboard]);

  if (shopLoading || loading) return <LoadingState message="Carregando dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={() => currentBarbershop && loadDashboard(currentBarbershop.id)} />;
  if (!currentBarbershop) {
    return (
      <Alert severity="info">
        Nenhuma barbearia encontrada. Cadastre uma barbearia para começar.
      </Alert>
    );
  }

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {dashboard?.barbershopName ?? currentBarbershop.name}
        </Typography>
      </Box>

      {dashboard && (
        <>
          {/* Stats row 1 */}
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Barbeiros Ativos"
                value={dashboard.totalActiveBarbers}
                icon={<ContentCut sx={{ color: 'white', fontSize: 20 }} />}
                color="primary.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Serviços Ativos"
                value={dashboard.totalActiveServices}
                icon={<Spa sx={{ color: 'white', fontSize: 20 }} />}
                color="secondary.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Agendamentos Hoje"
                value={dashboard.totalAppointmentsToday}
                icon={<CalendarMonth sx={{ color: 'white', fontSize: 20 }} />}
                color="info.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Agendamentos no Mês"
                value={dashboard.totalAppointmentsThisMonth}
                icon={<CalendarMonth sx={{ color: 'white', fontSize: 20 }} />}
                color="success.main"
                subtitle="Este mês"
              />
            </Grid>
          </Grid>

          {/* Stats row 2 */}
          <Grid container spacing={2} mb={3}>
            <Grid item xs={6} sm={3}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Pending color="warning" sx={{ fontSize: 32 }} />
                  <Typography variant="h5" fontWeight={700}>{dashboard.totalPending}</Typography>
                  <Typography variant="caption" color="text.secondary">Pendentes</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <CheckCircle color="primary" sx={{ fontSize: 32 }} />
                  <Typography variant="h5" fontWeight={700}>{dashboard.totalConfirmed}</Typography>
                  <Typography variant="caption" color="text.secondary">Confirmados</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Done color="success" sx={{ fontSize: 32 }} />
                  <Typography variant="h5" fontWeight={700}>{dashboard.totalCompleted}</Typography>
                  <Typography variant="caption" color="text.secondary">Concluídos</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Cancel color="error" sx={{ fontSize: 32 }} />
                  <Typography variant="h5" fontWeight={700}>{dashboard.totalCancelled}</Typography>
                  <Typography variant="caption" color="text.secondary">Cancelados</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Upcoming appointments */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Próximos Agendamentos de Hoje
              </Typography>
              {dashboard.upcomingToday.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  Nenhum agendamento próximo para hoje
                </Typography>
              ) : (
                <TableContainer component={Paper} elevation={0} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Horário</TableCell>
                        <TableCell>Cliente</TableCell>
                        <TableCell>Barbeiro</TableCell>
                        <TableCell>Serviço</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashboard.upcomingToday.map((apt) => (
                        <TableRow key={apt.id} hover>
                          <TableCell>
                            {formatDateTime(apt.appointmentDateTime)}
                          </TableCell>
                          <TableCell>{apt.clientName ?? '-'}</TableCell>
                          <TableCell>{apt.barberName ?? '-'}</TableCell>
                          <TableCell>
                            {apt.serviceName ?? '-'}
                            {apt.serviceDurationMinutes && (
                              <Chip
                                label={`${apt.serviceDurationMinutes}min`}
                                size="small"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <StatusChip status={apt.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}
