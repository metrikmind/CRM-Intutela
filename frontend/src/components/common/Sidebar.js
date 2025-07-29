// src/components/common/Sidebar.js

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Chip,
} from '@mui/material';
import {
  Dashboard,
  People,
  Assignment,
  Description,
  AccountCircle,
  Home,
  Assignment as AssignmentIcon,
  CloudDownload,
} from '@mui/icons-material';

const Sidebar = ({ userType = 'admin', onItemClick }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    if (onItemClick) onItemClick();
  };

  const isActive = (path) => location.pathname === path;

  // Admin menu items
  const adminMenuItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/admin/dashboard',
      color: 'primary',
    },
    {
      text: 'Clienti',
      icon: <People />,
      path: '/admin/clients',
      color: 'success',
    },
    {
      text: 'Pratiche',
      icon: <Assignment />,
      path: '/admin/practices',
      color: 'warning',
    },
    {
      text: 'Documenti',
      icon: <Description />,
      path: '/admin/documents',
      color: 'info',
    },
  ];

  // Client menu items
  const clientMenuItems = [
    {
      text: 'Le Mie Pratiche',
      icon: <AssignmentIcon />,
      path: '/client/dashboard',
      color: 'primary',
    },
    {
      text: 'Documenti',
      icon: <CloudDownload />,
      path: '/client/documents',
      color: 'info',
    },
  ];

  const menuItems = userType === 'admin' ? adminMenuItems : clientMenuItems;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Brand */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.2rem',
          }}
        >
          IT
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700} color="primary">
            InTutela
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Sistema CRM
          </Typography>
        </Box>
      </Box>

      {/* User Type Badge */}
      <Box sx={{ p: 2, pb: 1 }}>
        <Chip
          label={userType === 'admin' ? 'Amministratore' : 'Area Cliente'}
          color={userType === 'admin' ? 'primary' : 'secondary'}
          size="small"
          sx={{ width: '100%' }}
        />
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, px: 1 }}>
        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.path}
              selected={isActive(item.path)}
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                mx: 1,
                '&.Mui-selected': {
                  backgroundColor: `${item.color}.50`,
                  color: `${item.color}.main`,
                  '& .MuiListItemIcon-root': {
                    color: `${item.color}.main`,
                  },
                  '&:hover': {
                    backgroundColor: `${item.color}.100`,
                  },
                },
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: isActive(item.path) ? `${item.color}.main` : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: isActive(item.path) ? 600 : 400,
                  fontSize: '0.95rem',
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Divider />

      {/* Footer */}
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          InTutela CRM v1.0
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          © 2024 Tutti i diritti riservati
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;