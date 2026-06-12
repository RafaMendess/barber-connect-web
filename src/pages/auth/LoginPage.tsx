import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { ContentCut, Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/schemas';
import { useAuth } from '@/contexts/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    try {
      await login(data);
      navigate('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? 'Email ou senha inválidos');
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ bgcolor: 'background.default', p: 2 }}
    >
      <Card sx={{ maxWidth: 420, width: '100%', borderRadius: 3 }} elevation={3}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
          <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={3}>
            <ContentCut color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h5" fontWeight={800} color="primary">
              Barber Connect
            </Typography>
          </Box>

          <Typography variant="h6" fontWeight={600} textAlign="center" mb={0.5}>
            Entrar no painel
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            Acesse sua conta de administrador
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              autoComplete="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register('email')}
            />

            <TextField
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              autoComplete="current-password"
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              {...register('password')}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isSubmitting}
              sx={{ mt: 1, borderRadius: 2, fontWeight: 600 }}
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
