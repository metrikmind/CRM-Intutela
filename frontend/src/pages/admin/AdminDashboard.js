// src/pages/admin/AdminDashboard.js

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  People,
  Assignment,
  TrendingUp,
  Description,
  AccountBox,
  Schedule,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

import { apiMethods, endpoints } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatsCard from '../../components/common/StatsCard';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiMethods.get(endpoints.admin.dashboard);
      
      if (response.success) {
        setStats(response.data);
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setError('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Prepare monthly chart data
  const monthlyData = stats?.monthly_stats?.map(item => ({
    month: format(new Date(item.month + '-01'), 'MMM', { locale: it }),
    pratiche: item.count,
  })) || [];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Dashboard Amministratore
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Panoramica generale del sistema CRM
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Totale Clienti"
            value={stats?.total_clients || 0}
            icon={<People />}
            color="primary"
            subtitle="Clienti registrati"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Totale Pratiche"
            value={stats?.total_practices || 0}
            icon={<Assignment />}
            color="success"
            subtitle="Pratiche attive"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Pratiche Completate"
            value={stats?.by_status?.find(s => s.nome === 'Già Rimborsato')?.count || 0}
            icon={<TrendingUp />}
            color="info"
            subtitle="Rimborsi effettuati"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="In Lavorazione"
            value={stats?.by_status?.reduce((acc, s) => 
              s.nome !== 'Già Rimborsato' && s.nome !== 'Annullata' ? acc + s.count : acc, 0
            ) || 0}
            icon={<Schedule />}
            color="warning"
            subtitle="Da completare"
          />
        </Grid>
      </Grid>

      {/* Charts and Lists */}
      <Grid container spacing={3}>
        {/* Line Chart - Monthly Trends */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Andamento Pratiche Mensili
              </Typography>
              <Box sx={{ height: 300, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="pratiche"
                      stroke="#1976d2"
                      strokeWidth={3}
                      dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Pie Chart - Status Distribution */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Distribuzione Stati
              </Typography>
              <Box sx={{ height: 300, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.by_status || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="nome"
                      label={({ nome, count }) => `${nome}: ${count}`}
                    >
                      {(stats?.by_status || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Attività Recenti
              </Typography>
              <List>
                {(stats?.recent_practices || []).slice(0, 5).map((practice, index) => (
                  <ListItem key={index} divider={index < 4}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: practice.stato_colore || 'primary.main' }}>
                        <Assignment />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight={500}>
                            {practice.numero_contratto}
                          </Typography>
                          <Chip
                            label={practice.stato_nome}
                            size="small"
                            sx={{
                              backgroundColor: practice.stato_colore,
                              color: 'white',
                              fontSize: '0.7rem',
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Cliente: {practice.nome_completo}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            Aggiornato: {format(new Date(practice.updated_at), 'dd/MM/yyyy HH:mm')}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Status Overview */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Riepilogo Stati Pratiche
              </Typography>
              <Box sx={{ mt: 2 }}>
                {(stats?.by_status || []).map((status, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {status.nome}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {status.count} pratiche
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(status.count / (stats?.total_practices || 1)) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: status.colore || 'primary.main',
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;