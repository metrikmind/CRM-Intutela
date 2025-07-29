// src/components/admin/CSVImport.js

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  List,
  ListItem,
  ListItemText,
  Paper,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  CloudUpload,
  FileUpload,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useSnackbar } from 'notistack';

import { apiMethods, endpoints } from '../../services/api';

const CSVImport = ({ open, onClose, onSuccess }) => {
  const { enqueueSnackbar } = useSnackbar();
  
  const [file, setFile] = useState(null);
  const [importType, setImportType] = useState('practices');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleImportTypeChange = (event) => {
    setImportType(event.target.value);
    setFile(null);
    setResult(null);
  };

  const onDrop = (acceptedFiles) => {
    const csvFile = acceptedFiles[0];
    if (csvFile && csvFile.type === 'text/csv') {
      setFile(csvFile);
      setResult(null);
    } else {
      enqueueSnackbar('Selezionare solo file CSV', { variant: 'error' });
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/csv': ['.csv'],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleUpload = async () => {
    if (!file) {
      enqueueSnackbar('Selezionare un file CSV', { variant: 'warning' });
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('csv_file', file);
      formData.append('import_type', importType);

      const response = await apiMethods.upload(endpoints.admin.importCsv, formData);

      if (response.success) {
        setResult(response.data);
        enqueueSnackbar(response.message, { variant: 'success' });
        if (onSuccess) onSuccess();
      } else {
        enqueueSnackbar(response.message || 'Errore durante l\'importazione', { variant: 'error' });
      }
    } catch (error) {
      console.error('Import error:', error);
      enqueueSnackbar('Errore durante l\'importazione', { variant: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFile(null);
      setResult(null);
      setImportType('practices');
      onClose();
    }
  };

  const getDropzoneStyles = () => {
    let borderColor = 'grey.300';
    let backgroundColor = 'grey.50';
    
    if (isDragActive && !isDragReject) {
      borderColor = 'primary.main';
      backgroundColor = 'primary.50';
    } else if (isDragReject) {
      borderColor = 'error.main';
      backgroundColor = 'error.50';
    } else if (file) {
      borderColor = 'success.main';
      backgroundColor = 'success.50';
    }

    return { borderColor, backgroundColor };
  };

  const styles = getDropzoneStyles();

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FileUpload color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Importa Dati da CSV
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Import Type Selection */}
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
            Tipo di Importazione
          </FormLabel>
          <RadioGroup
            value={importType}
            onChange={handleImportTypeChange}
            row
          >
            <FormControlLabel
              value="practices"
              control={<Radio />}
              label="Pratiche Complete"
            />
            <FormControlLabel
              value="clients"
              control={<Radio />}
              label="Solo Clienti"
            />
          </RadioGroup>
        </FormControl>

        {/* File Upload Area */}
        <Paper
          {...getRootProps()}
          sx={{
            p: 4,
            border: '2px dashed',
            borderColor: styles.borderColor,
            backgroundColor: styles.backgroundColor,
            borderRadius: 2,
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            mb: 3,
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <input {...getInputProps()} />
          
          <CloudUpload 
            sx={{ 
              fontSize: 48, 
              color: file ? 'success.main' : 'text.secondary',
              mb: 2,
            }} 
          />
          
          {file ? (
            <Box>
              <Typography variant="h6" color="success.main" gutterBottom>
                File Selezionato
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {file.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {(file.size / 1024).toFixed(1)} KB
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom>
                {isDragActive 
                  ? 'Rilascia il file qui...' 
                  : 'Trascina un file CSV qui o clicca per selezionare'
                }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Formato supportato: .csv (max 10MB)
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Format Instructions */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Formato CSV Richiesto:
          </Typography>
          <Typography variant="body2">
            {importType === 'practices' 
              ? 'Il file deve contenere tutte le colonne come nel foglio "Monitoraggio" del file Excel originale.'
              : 'Il file deve contenere: Progressivo Cliente, Data Mandato, Nome Completo Cliente.'
            }
          </Typography>
        </Alert>

        {/* Upload Progress */}
        {uploading && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              Importazione in corso...
            </Typography>
            <LinearProgress />
          </Box>
        )}

        {/* Import Results */}
        {result && (
          <Paper sx={{ p: 2, mb: 3, backgroundColor: 'success.50' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CheckCircle color="success" />
              <Typography variant="h6" color="success.main">
                Importazione Completata
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Chip 
                label={`${result.imported} record importati`}
                color="success"
                variant="outlined"
              />
              {result.errors?.length > 0 && (
                <Chip 
                  label={`${result.errors.length} errori`}
                  color="warning"
                  variant="outlined"
                />
              )}
            </Box>

            {result.errors?.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Errori riscontrati:
                </Typography>
                <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {result.errors.slice(0, 10).map((error, index) => (
                    <ListItem key={index}>
                      <ErrorIcon sx={{ mr: 1, fontSize: 16 }} color="warning" />
                      <ListItemText 
                        primary={error}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                  {result.errors.length > 10 && (
                    <ListItem>
                      <ListItemText 
                        primary={`... e altri ${result.errors.length - 10} errori`}
                        primaryTypographyProps={{ variant: 'body2', fontStyle: 'italic' }}
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            )}
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={handleClose} 
          disabled={uploading}
          variant="outlined"
        >
          {result ? 'Chiudi' : 'Annulla'}
        </Button>
        
        {!result && (
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            variant="contained"
            startIcon={<FileUpload />}
          >
            {uploading ? 'Importazione...' : 'Importa CSV'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CSVImport;