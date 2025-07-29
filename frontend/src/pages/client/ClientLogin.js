// src/pages/client/ClientLogin.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Paper,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  AccountCircle,
  Login,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ClientLogin = () => {
  const navigate = useNavigate();
  const { loginClient, isLoading, error, clearError } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    codiceFiscale: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'codiceFiscale' ? value.toUpperCase() : value,
    }));
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
    
    // Clear global error
    if (error) {
      clearError();
    }
  };

  const validateCodiceFiscale = (cf) => {
    const regex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;
    return regex.test(cf);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.codiceFiscale.trim()) {
      errors.codiceFiscale = 'Codice fiscale è obbligatorio';
    } else if (!validateCodiceFiscale(formData.codiceFiscale)) {
      errors.codiceFiscale = 'Formato codice fiscale non valido';
    }
    
    if (!formData.password) {
      errors.password = 'Password è obbligatoria';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const result = await loginClient(formData.codiceFiscale, formData.password);
      
      if (result.success) {
        enqueueSnackbar('Accesso effettuato con successo!', { variant: 'success' });
        navigate('/client/dashboard');
      } else {
        enqueueSnackbar(result.message || 'Errore durante l\'accesso', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('Errore di connessione', { variant: 'error' });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
              color: 'white',
              p: 4,
              textAlign: 'center',
            }}
          >
            <AccountCircle sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Area Cliente
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              InTutela CRM
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  name="codiceFiscale"
                  label="Codice Fiscale"
                  value={formData.codiceFiscale}
                  onChange={handleChange}
                  error={!!formErrors.codiceFiscale}
                  helperText={formErrors.codiceFiscale}
                  variant="outlined"
                  sx={{ mb: 2 }}
                  inputProps={{ 
                    maxLength: 16,
                    style: { textTransform: 'uppercase' }
                  }}
                />

                <TextField
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={togglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                startIcon={<Login />}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
                  },
                }}
              >
                {isLoading ? 'Accesso in corso...' : 'Accedi'}
              </Button>
            </form>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Sei un amministratore?{' '}
                <Link
                  to="/admin/login"
                  style={{
                    color: '#2e7d32',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Accedi al Pannello Admin
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Paper>

        {/* Help Section */}
        <Paper
          sx={{
            mt: 2,
            p: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
          }}
        >
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            <strong>Prima volta?</strong> La password ti sarà fornita dal nostro staff
          </Typography>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            Contatta il numero: <strong>+39 xxx xxx xxxx</strong>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default ClientLogin;