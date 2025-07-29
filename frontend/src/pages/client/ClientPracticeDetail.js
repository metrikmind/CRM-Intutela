// src/pages/client/ClientPracticeDetail.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack,
  Assignment,
  AccountBalance,
  Euro,
  CalendarToday,
  Description,
  Download,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

import { apiMethods, endpoints } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ClientPracticeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const [practice, setPractice] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch practice details
  const fetchPracticeDetail = async () => {
    try {
      setLoading(true);
      
      const response = await apiMethods.get(`${endpoints.client.practices}?id=${id}`);
      
      if (response.success) {
        setPractice(response.data.practice);
        setDocuments(response.data.documents || []);
      } else {
        enqueueSnackbar(response.message || 'Errore nel caricamento pratica', { variant: 'error' });
        navigate('/client/dashboard');
      }
    } catch (error) {
      console.error('Practice detail fetch error:', error);
      enqueueSnackbar('Errore di connessione', { variant: 'error' });
      navigate('/client/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Handle document download
  const handleDownload = async (documentId, filename) => {
    try {
      const response = await apiMethods.download(
        `${endpoints.client.documents}?action=download&id=${documentId}`,
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

  useEffect(() => {
    if (id) {
      fetchPracticeDetail();
    }
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Caricamento dettagli pratica..." />;
  }

  if (!practice) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="error">
          Pratica non trovata
        </Typography>
        <Button onClick={() => navigate('/client/dashboard')} sx={{ mt: 2 }}>
          Torna alla Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/client/dashboard')}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Contratto N. {practice.numero_contratto}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Dettagli completi della pratica
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Practice Info */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Assignment color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Informazioni Pratica
                </Typography>
                <Chip
                  label={practice.stato_nome}
                  sx={{
                    backgroundColor: practice.stato_colore || '#1976d2',
                    color: 'white',
                    fontWeight: 500,
                  }}
                />
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Numero Contratto
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {practice.numero_contratto}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Banca
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {practice.banca_nome || 'Non specificata'}
                    </Typography>
                  </Box>
                </Grid>

                {practice.data_contratto && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Data Contratto
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {new Date(practice.data_contratto).toLocaleDateString('it-IT')}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {practice.durata_contratto && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Durata Contratto
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {practice.durata_contratto} mesi
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {practice.importo_reclamo && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Importo Reclamo
                      </Typography>
                      <Typography variant="body1" fontWeight={500} color="primary">
                        € {practice.importo_reclamo.toLocaleString('it-IT')}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {practice.euro_incasso && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Importo Incassato
                      </Typography>
                      <Typography variant="body1" fontWeight={500} color="success.main">
                        € {practice.euro_incasso.toLocaleString('it-IT')}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {practice.modalita_incasso && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Modalità Incasso
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {practice.modalita_incasso}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {practice.note && (
                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Note
                      </Typography>
                      <Typography variant="body1">
                        {practice.note}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Description color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Documenti ({documents.length})
                </Typography>
              </Box>

              {documents && documents.length > 0 ? (
                <List>
                  {documents.map((document, index) => (
                    <React.Fragment key={document.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Description color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary={document.nome_originale}
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Caricato: {new Date(document.created_at).toLocaleDateString('it-IT')}
                              </Typography>
                              {document.descrizione && (
                                <>
                                  <br />
                                  <Typography variant="caption" color="text.secondary">
                                    {document.descrizione}
                                  </Typography>
                                </>
                              )}
                            </Box>
                          }
                        />
                        <Tooltip title="Scarica documento">
                          <IconButton
                            onClick={() => handleDownload(document.id, document.nome_originale)}
                            color="primary"
                          >
                            <Download />
                          </IconButton>
                        </Tooltip>
                      </ListItem>
                      {index < documents.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Nessun documento disponibile per questa pratica
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Timeline/Status */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Stato Attuale
              </Typography>
              
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Chip
                  label={practice.stato_nome}
                  size="large"
                  sx={{
                    backgroundColor: practice.stato_colore || '#1976d2',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '1rem',
                    px: 2,
                    py: 1,
                  }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Informazioni Aggiuntive
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Ultima Modifica
                </Typography>
                <Typography variant="body2">
                  {new Date(practice.updated_at).toLocaleDateString('it-IT')} alle{' '}
                  {new Date(practice.updated_at).toLocaleTimeString('it-IT')}
                </Typography>
              </Box>

              {practice.percentuale_mandato && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Percentuale Mandato
                  </Typography>
                  <Typography variant="body2">
                    {(practice.percentuale_mandato * 100).toFixed(1)}%
                  </Typography>
                </Box>
              )}

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Per informazioni contatta il nostro ufficio
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClientPracticeDetail;