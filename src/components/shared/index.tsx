import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ErrorOutline, SearchOff, Add } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';

// =====================
// PageHeader
// =====================
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
      <Box>
        <Typography variant="h5" fontWeight={700}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && (
        <Button
          variant="contained"
          startIcon={action.icon ?? <Add />}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
}

// =====================
// LoadingState
// =====================
export function LoadingState({ message = 'Carregando...' }: { message?: string }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={8}
      gap={2}
    >
      <CircularProgress />
      <Typography color="text.secondary">{message}</Typography>
    </Box>
  );
}

// =====================
// EmptyState
// =====================
interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={8}
      gap={2}
    >
      <SearchOff sx={{ fontSize: 60, color: 'text.disabled' }} />
      <Typography variant="h6" color="text.secondary">
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.disabled" textAlign="center">
          {description}
        </Typography>
      )}
      {action && (
        <Button variant="outlined" startIcon={<Add />} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </Box>
  );
}

// =====================
// ErrorState
// =====================
interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={8}
      gap={2}
    >
      <ErrorOutline sx={{ fontSize: 60, color: 'error.main' }} />
      <Typography color="error">{message}</Typography>
      {onRetry && (
        <Button variant="outlined" color="error" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </Box>
  );
}
