// src/pages/admin/Clients.js

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Add,
  Search,
  Upload,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';

import { apiMethods, endpoints } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CSVImport from '../../components/admin/CSVImport';

const Clients = () => {
  const { enqueueSnackbar } = useSnackbar();
  
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 25,
    total: 0,
  });
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // Fetch clients
  const fetchClients = async (page = 1, searchTerm = '') => {
    try {
      setLoading(true);
      
      const params = {
        page,
        limit: pagination.pageSize,
        search: searchTerm,
      };
      
      const response = await apiMethods.get(endpoints.admin.clients, params);
      
      if (response.success) {
        setClients(response.data.clients || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination?.total_records || 0,
        }));
      } else {
        enqueueSnackbar(response.message || 'Errore nel caricamento clienti', { variant: 'error' });
      }
    } catch (error) {
      console.error('Fetch clients error:', error);
      enqueueSnackbar('Errore di connessione', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients(1, search);
  }, [search]);

  // Handle pagination
  const handlePaginationChange = (model) => {
    setPagination(prev => ({
      ...prev,
      page: model.page,
      pageSize: model.pageSize,
    }));
    fetchClients(model.page + 1, search);
  };

  // Handle search
  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  // Columns definition
  const columns = [
    {
      field: 'progressivo_cliente',
      headerName: 'Progressivo',
      width: 120,
      type: 'number',
    },
    {
      field: 'nome_completo',
      headerName: 'Nome Completo',
      width: 250,
      flex: 1,
    },
    {
      field: 'codice_fiscale',
      headerName: 'Codice Fiscale',
      width: 180,
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
    },
    {
      field: 'telefono',
      headerName: 'Telefono',
      width: 150,
    },
    {
      field: 'num_pratiche',
      headerName: 'Pratiche',
      width: 100,
      type: 'number',
      renderCell: (params) => (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: '100%',
          height: '100%'
        }}>
          {params.value || 0}
        </Box>
      ),
    },
    {
      field: 'created_at',
      headerName: 'Creato',
      width: 150,
      type: 'dateTime',
      valueGetter: (params) => {
        return params.value ? new Date(params.value) : null;
      },
    },
  ];

  if (loading && clients.length === 0) {
    return <LoadingSpinner message="Caricamento clienti..." />;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Gestione Clienti
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Visualizza e gestisci tutti i clienti del sistema
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Upload />}
            onClick={() => setImportDialogOpen(true)}
          >
            Importa CSV
          </Button>
          
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => enqueueSnackbar('Funzione in sviluppo', { variant: 'info' })}
          >
            Nuovo Cliente
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Cerca clienti per nome, codice fiscale o progressivo..."
              value={search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Data Grid */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <DataGrid
            rows={clients}
            columns={columns}
            pagination
            paginationMode="server"
            rowCount={pagination.total}
            page={pagination.page}
            pageSize={pagination.pageSize}
            onPaginationModelChange={handlePaginationChange}
            loading={loading}
            disableSelectionOnClick
            autoHeight
            sx={{
              minHeight: 400,
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid rgba(0,0,0,0.05)',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'rgba(0,0,0,0.02)',
              },
            }}
          />
        </CardContent>
      </Card>

      {/* CSV Import Dialog */}
      <CSVImport
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onSuccess={() => {
          setImportDialogOpen(false);
          fetchClients(1, search);
        }}
      />
    </Box>
  );
};

export default Clients;