// src/pages/client/ClientArea.js

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Assignment,
  CheckCircle,
  Schedule,
  Cancel,
  Description,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

import { apiMethods, endpoints } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatsCard from '../../components/common/StatsCard';

const ClientArea = () => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const response = await apiMethods.get(endpoints.client.dashboard);
      
      if (response.success) {
        setDashboardData(response.data);
      } else {
        enqueueSnackbar(response.message || 'Errore nel caricamento dati', { variant: 'error' });
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      enqueueSnackbar('Errore di connessione', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Caricamento area cliente..." />;
  }

  if (!dashboardData) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="error">
          Errore nel caricamento dei dati
        </Typography>
      </Box>
    );
  }

  const { total_practices, completed, in_progress, cancelled, practices } = dashboardData;

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Benvenuto, {user?.nome_completo}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Ecco il riepilogo delle tue pratiche e documenti
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Totale Pratiche"
            value={total_practices}
            icon={<Assignment />}
            color="primary"
            subtitle="Pratiche totali"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Completate"
            value={completed}
            icon={<CheckCircle />}
            color="success"
            subtitle="Rimborsi ricevuti"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="In Lavorazione"
            value={in_progress}
            icon={<Schedule />}
            color="warning"
            subtitle="In corso"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Annullate"
            value={cancelled}
            icon={<Cancel />}
            color="error"
            subtitle="Non processabili"
          />
        </Grid>
      </Grid>

      {/* Practices List */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Le Tue Pratiche
              </Typography>
              
              {practices && practices.length > 0 ? (
                <List>
                  {practices.map((practice, index) => (
                    <React.Fragment key={practice.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Assignment color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                Contratto N. {practice.numero_contratto}
                              </Typography>
                              <Chip
                                label={practice.stato_nome}
                                size="small"
                                sx={{
                                  backgroundColor: practice.stato_colore || '#1976d2',
                                  color: 'white',
                                  fontWeight: 500,
                                }}
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Banca: {practice.banca_nome || 'Non specificata'}
                              </Typography>
                              {practice.importo_reclamo && (
                                <Typography variant="body2" color="text.secondary">
                                  Importo: € {practice.importo_reclamo.toLocaleString('it-IT')}
                                </Typography>
                              )}
                              <Typography variant="caption" color="text.secondary">
                                Aggiornato: {new Date(practice.updated_at).toLocaleDateString('it-IT')}
                              </Typography>
                            </Box>
                          }
                        />
                        {practice.num_documenti > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Description color="action" />
                            <Typography variant="caption" color="text.secondary">
                              {practice.num_documenti} doc.
                            </Typography>
                          </Box>
                        )}
                      </ListItem>
                      {index < practices.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Nessuna pratica trovata
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Info Panel */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Informazioni Account
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Nome Completo
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {user?.nome_completo}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Codice Fiscale
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {user?.codice_fiscale}
                </Typography>
              </Box>
              
              {user?.email && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Email
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {user.email}
                  </Typography>
                </Box>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2" color="text.secondary" align="center">
                Per assistenza contatta il nostro ufficio
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClientArea;