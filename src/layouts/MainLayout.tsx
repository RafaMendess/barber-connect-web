import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Button,
  Divider,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Store,
  ContentCut,
  Spa,
  EventAvailable,
  BlockOutlined,
  CalendarMonth,
  Payment,
  LogoutOutlined,
  AccountCircle,
  ChevronLeft,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useBarbershop } from '@/contexts/BarbershopContext';

const DRAWER_WIDTH = 240;
const DRAWER_COLLAPSED = 64;

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { label: 'Barbearias', icon: <Store />, path: '/barbershops' },
  { label: 'Barbeiros', icon: <ContentCut />, path: '/barbers' },
  { label: 'Serviços', icon: <Spa />, path: '/services' },
  { label: 'Disponibilidades', icon: <EventAvailable />, path: '/availabilities' },
  { label: 'Bloqueios', icon: <BlockOutlined />, path: '/schedule-blocks' },
  { label: 'Agendamentos', icon: <CalendarMonth />, path: '/appointments' },
  { label: 'Pagamentos', icon: <Payment />, path: '/payments' },
];

export function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [shopAnchorEl, setShopAnchorEl] = useState<null | HTMLElement>(null);
  const shopsOpen = Boolean(shopAnchorEl);

  const { barbershops, currentBarbershop, setCurrentBarbershop, fetchBarbershops, isLoading: shopsLoading } = useBarbershop();

  const drawerWidth = collapsed && !isMobile ? DRAWER_COLLAPSED : DRAWER_WIDTH;

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    navigate('/login');
  };

  // load barbershops for selector
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchBarbershops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
          px: 1,
        }}
      >
        {(!collapsed || isMobile) && (
          <Box display="flex" alignItems="center" gap={1}>
            <ContentCut color="primary" />
            <Typography variant="h6" fontWeight={700} color="primary" noWrap>
              Barber Connect
            </Typography>
          </Box>
        )}
        {!isMobile && (
          <IconButton size="small" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <MenuIcon /> : <ChevronLeft />}
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List sx={{ flex: 1, py: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={collapsed && !isMobile ? item.label : ''} placement="right">
                <ListItemButton
                  selected={isActive}
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) setMobileOpen(false);
                  }}
                  sx={{
                    mx: 1,
                    borderRadius: 2,
                    justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      '& .MuiListItemIcon-root': { color: 'white' },
                      '&:hover': { bgcolor: 'primary.dark' },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed && !isMobile ? 0 : 40,
                      color: isActive ? 'white' : 'inherit',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {(!collapsed || isMobile) && (
                    <ListItemText primary={item.label} />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          color: 'text.primary',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flex: 1, fontWeight: 600 }}>
            {NAV_ITEMS.find((n) => n.path === location.pathname)?.label ?? 'Admin'}
          </Typography>
          {/* Barbershop selector */}
          <Button
            size="small"
            onClick={(e) => setShopAnchorEl(e.currentTarget)}
            disabled={shopsLoading || barbershops.length === 0}
            sx={{ mr: 2 }}
          >
            {currentBarbershop ? currentBarbershop.name : 'Selecionar Barbearia'}
          </Button>
          <Menu
            anchorEl={shopAnchorEl}
            open={shopsOpen}
            onClose={() => setShopAnchorEl(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {barbershops.map((s) => (
              <MenuItem
                key={s.id}
                selected={currentBarbershop?.id === s.id}
                onClick={() => {
                  setCurrentBarbershop(s);
                  setShopAnchorEl(null);
                }}
              >
                {s.name}
              </MenuItem>
            ))}
          </Menu>
          <Tooltip title="Conta">
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}>
                {user?.name?.[0]?.toUpperCase() ?? <AccountCircle />}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutOutlined fontSize="small" />
              </ListItemIcon>
              Sair
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            overflowX: 'hidden',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          minHeight: '100vh',
          bgcolor: 'background.default',
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
