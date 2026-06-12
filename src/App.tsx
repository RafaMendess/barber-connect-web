import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from '@/contexts/AuthContext';
import { BarbershopProvider } from '@/contexts/BarbershopContext';
import { AppRoutes } from '@/routes/AppRoutes';
import theme from '@/utils/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <BarbershopProvider>
            <AppRoutes />
          </BarbershopProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
