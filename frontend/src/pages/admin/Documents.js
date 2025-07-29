// src/pages/admin/Documents.js

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
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Search,
  Download,
  Visibility,
  VisibilityOff,
  Description,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';

import { apiMethods, endpoints } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Documents = () => {
  const { enqueueSnackbar } = useSnackbar();
  
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 25,
    total: 0,
  });

  // Fetch documents
  const fetchDocuments = async (page = 1, searchTerm = '') => {
    try {
      setLoading(true);
      
      const params = {
        page,
        limit: pagination.pageSize,
        search: searchTerm,
      };
      
      const response = await apiMethods.get(endpoints.admin.documents, params);
      
      if (response.success) {
        setDocuments(response.data.documents || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination?.total_records || 0,
        }));
      } else {
        enqueueSnackbar(response.message || 'Errore nel caricamento documenti', { variant: 'error' });
      }
    } catch (error) {
      console.error('Fetch documents error:', error);
      enqueueSnackbar('Errore di connessione', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments(1, search);
  }, [search]);

  // Handle pagination
  const handlePaginationChange = (model) => {
    setPagination(prev => ({
      ...prev,
      page: model.page,
      pageSize: model.pageSize,
    }));
    fetchDocuments(model.page + 1, search);
  };

  // Handle download
  const handleDownload = async (documentId, filename) => {
    try {
      const response = await apiMethods.download(
        `${endpoints.admin.documents}?action=download&id=${documentId}`,
        filename
      );
      
      if (response.success) {
        enqueueSnackbar('Download completato', { variant: 'success' });
      }
    } catch (error) {
      console.error('Download error:', error);
      enqueueSnackbar('Errore durante il download', { variant: 'error' });
    }
  };

  // Handle visibility toggle
  const handleVisibilityToggle = async (documentId, currentVisibility) => {
    try {
      const newVisibility = currentVisibility === 'Si' ? 'No' : 'Si';
      
      const response = await apiMethods.put(`${endpoints.admin.documents}?id=${documentId}`, {
        visibile_cliente: newVisibility,
      });
      
      if (response.success) {
        enqueueSnackbar('Visibilità aggiornata', { variant: 'success' });
        fetchDocuments(pagination.page + 1, search);
      } else {
        enqueueSnackbar(response.message || 'Errore aggiornamento', { variant: 'error' });
      }
    } catch (error) {
      console.error('Visibility toggle error:', error);
      enqueueSnackbar('Errore durante l\'aggiornamento', { variant: 'error' });
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Columns definition
  const columns = [
    {
      field: 'nome_originale',
      headerName: 'Nome File',
      width: 250,
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Description color="action" />
          <Typography variant="body2" noWrap>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'cliente_nome',
      headerName: 'Cliente',
      width: 200,
    },
    {
      field: 'numero_contratto',
      headerName: 'N. Contratto',
      width: 150,
    },
    {
      field: 'tipo_file',
      headerName: 'Tipo',
      width: 120,
      renderCell: (params) => {
        const fileType = params.value?.split('/')[1]?.toUpperCase() || 'FILE';
        return (
          <Chip
            label={fileType}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'dimensione',
      headerName: 'Dimensione',
      width: 120,
      renderCell: (params) => formatFileSize(params.value),
    },
    {
      field: 'visibile_cliente',
      headerName: 'Visibile Cliente',
      width: 140,
      renderCell: (params) => (
        <Tooltip title={`Clicca per ${params.value === 'Si' ? 'nascondere' : 'mostrare'} al cliente`}>
          <IconButton
            size="small"
            onClick={() => handleVisibilityToggle(params.row.id, params.value)}
            color={params.value === 'Si' ? 'success' : 'default'}
          >
            {params.value === 'Si' ? <Visibility /> : <VisibilityOff />}
          </IconButton>
        </Tooltip>
      ),
    },
    {
      field: 'created_at',
      headerName: 'Caricato',
      width: 150,
      type: 'dateTime',
      valueGetter: (params) => {
        return params.value ? new Date(params.value) : null;
      },
    },
    {
      field: 'actions',
      headerName: 'Azioni',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="Scarica documento">
          <IconButton
            size="small"
            onClick={() => handleDownload(params.row.id, params.row.nome_originale)}
            color="primary"
          >
            <Download />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  if (loading && documents.length === 0) {
    return <LoadingSpinner message="Caricamento documenti..." />;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Gestione Documenti
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Visualizza e gestisci tutti i documenti del sistema
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => enqueueSnackbar('Funzione in sviluppo', { variant: 'info' })}
        >
          Carica Documento
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Cerca documenti per nome, cliente o contratto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
            rows={documents}
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
    </Box>
  );
};

export default Documents;