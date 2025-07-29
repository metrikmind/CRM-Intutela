// src/pages/admin/Practices.js

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
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

const Practices = () => {
  const { enqueueSnackbar } = useSnackbar();
  
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [bankFilter, setBankFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 25,
    total: 0,
  });
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  // Filter options
  const [statuses, setStatuses] = useState([]);
  const [banks, setBanks] = useState([]);

  // Fetch practices
  const fetchPractices = async (page = 1, filters = {}) => {
    try {
      setLoading(true);
      
      const params = {
        page,
        limit: pagination.pageSize,
        search: filters.search || search,
        stato_pratica_id: filters.status || statusFilter,
        banca_id: filters.bank || bankFilter,
      };
      
      const response = await apiMethods.get(endpoints.admin.practices, params);
      
      if (response.success) {
        setPractices(response.data.practices || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination?.total_records || 0,
        }));
      } else {
        enqueueSnackbar(response.message || 'Errore nel caricamento pratiche', { variant: 'error' });
      }
    } catch (error) {
      console.error('Fetch practices error:', error);
      enqueueSnackbar('Errore di connessione', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const [statusesRes, banksRes] = await Promise.all([
        apiMethods.get(endpoints.shared.states),
        apiMethods.get(endpoints.shared.banks),
      ]);
      
      if (statusesRes.success) setStatuses(statusesRes.data);
      if (banksRes.success) setBanks(banksRes.data);
    } catch (error) {
      console.error('Fetch filter options error:', error);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchPractices(1, { search, status: statusFilter, bank: bankFilter });
  }, [search, statusFilter, bankFilter]);

  // Handle pagination
  const handlePaginationChange = (model) => {
    setPagination(prev => ({
      ...prev,
      page: model.page,
      pageSize: model.pageSize,
    }));
    fetchPractices(model.page + 1);
  };

  // Columns definition
  const columns = [
    {
      field: 'numero_contratto',
      headerName: 'N. Contratto',
      width: 150,
      fontFamily: 'monospace',
    },
    {
      field: 'cliente_nome',
      headerName: 'Cliente',
      width: 200,
      flex: 1,
    },
    {
      field: 'banca_nome',
      headerName: 'Banca',
      width: 150,
    },
    {
      field: 'stato_nome',
      headerName: 'Stato',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            backgroundColor: params.row.stato_colore || '#1976d2',
            color: 'white',
            fontWeight: 500,
          }}
        />
      ),
    },
    {
      field: 'importo_reclamo',
      headerName: 'Importo',
      width: 120,
      type: 'number',
      valueFormatter: (params) => {
        return params.value ? `€ ${params.value.toLocaleString('it-IT')}` : '-';
      },
    },
    {
      field: 'euro_incasso',
      headerName: 'Incasso',
      width: 120,
      type: 'number',
      valueFormatter: (params) => {
        return params.value ? `€ ${params.value.toLocaleString('it-IT')}` : '-';
      },
    },
    {
      field: 'num_documenti',
      headerName: 'Doc.',
      width: 80,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'updated_at',
      headerName: 'Aggiornato',
      width: 150,
      type: 'dateTime',
      valueGetter: (params) => {
        return params.value ? new Date(params.value) : null;
      },
    },
  ];

  if (loading && practices.length === 0) {
    return <LoadingSpinner message="Caricamento pratiche..." />;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Gestione Pratiche
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Visualizza e gestisci tutte le pratiche del sistema
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
            Nuova Pratica
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              variant="outlined"
              placeholder="Cerca per contratto, cliente o banca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 300, flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Stato Pratica</InputLabel>
              <Select
                value={statusFilter}
                label="Stato Pratica"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">Tutti gli stati</MenuItem>
                {statuses.map((status) => (
                  <MenuItem key={status.id} value={status.id}>
                    {status.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Banca</InputLabel>
              <Select
                value={bankFilter}
                label="Banca"
                onChange={(e) => setBankFilter(e.target.value)}
              >
                <MenuItem value="">Tutte le banche</MenuItem>
                {banks.map((bank) => (
                  <MenuItem key={bank.id} value={bank.id}>
                    {bank.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Data Grid */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <DataGrid
            rows={practices}
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
          fetchPractices(1);
        }}
      />
    </Box>
  );
};

export default Practices;