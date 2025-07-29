// src/components/common/LoadingSpinner.js

import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Backdrop,
} from '@mui/material';

const LoadingSpinner = ({ 
  message = 'Caricamento...', 
  size = 40, 
  fullScreen = false,
  transparent = false 
}) => {
  const LoadingContent = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        p: 3,
      }}
    >
      <CircularProgress 
        size={size} 
        thickness={4}
        sx={{
          color: 'primary.main',
        }}
      />
      {message && (
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ textAlign: 'center' }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: transparent ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)',
        }}
        open={true}
      >
        <LoadingContent />
      </Backdrop>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
        width: '100%',
      }}
    >
      <LoadingContent />
    </Box>
  );
};

export default LoadingSpinner;