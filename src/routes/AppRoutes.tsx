import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '@/layouts/MainLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { BarbershopsPage } from '@/pages/barbershops/BarbershopsPage';
import { BarbersPage } from '@/pages/barbers/BarbersPage';
import { ServicesPage } from '@/pages/services/ServicesPage';
import { AvailabilitiesPage } from '@/pages/availabilities/AvailabilitiesPage';
import { ScheduleBlocksPage } from '@/pages/schedule-blocks/ScheduleBlocksPage';
import { AppointmentsPage } from '@/pages/appointments/AppointmentsPage';
import { PaymentsPage } from '@/pages/payments/PaymentsPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/barbershops" element={<BarbershopsPage />} />
          <Route path="/barbers" element={<BarbersPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/availabilities" element={<AvailabilitiesPage />} />
          <Route path="/schedule-blocks" element={<ScheduleBlocksPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
