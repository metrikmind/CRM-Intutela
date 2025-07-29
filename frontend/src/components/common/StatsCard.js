// src/components/common/StatsCard.js

import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
} from '@mui/material';
import { TrendingUp } from '@mui/icons-material';

const StatsCard = ({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  trend = null,
  trendDirection = 'up',
}) => {
  const getColorVariants = (colorName) => {
    const colorMap = {
      primary: {
        main: '#1976d2',
        light: '#e3f2fd',
        dark: '#1565c0',
      },
      success: {
        main: '#2e7d32',
        light: '#e8f5e8',
        dark: '#1b5e20',
      },
      warning: {
        main: '#ed6c02',
        light: '#fff4e6',
        dark: '#e65100',
      },
      error: {
        main: '#d32f2f',
        light: '#ffebee',
        dark: '#c62828',
      },
      info: {
        main: '#0288d1',
        light: '#e1f5fe',
        dark: '#01579b',
      },
    };
    
    return colorMap[colorName] || colorMap.primary;
  };

  const colors = getColorVariants(color);

  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${colors.light} 0%, rgba(255,255,255,0.8) 100%)`,
        border: `1px solid ${colors.main}20`,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 25px ${colors.main}20`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: colors.main,
                fontSize: { xs: '1.8rem', sm: '2.2rem' },
                lineHeight: 1,
                mb: 0.5,
              }}
            >
              {typeof value === 'number' ? value.toLocaleString('it-IT') : value}
            </Typography>
            
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                mb: 0.5,
              }}
            >
              {title}
            </Typography>
            
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '0.85rem',
              }}
            >
              {subtitle}
            </Typography>
          </Box>

          <Avatar
            sx={{
              bgcolor: colors.main,
              width: 56,
              height: 56,
              ml: 2,
              boxShadow: `0 4px 14px ${colors.main}30`,
            }}
          >
            {icon}
          </Avatar>
        </Box>

        {/* Trend indicator */}
        {trend && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              pt: 1,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <TrendingUp
              sx={{
                fontSize: 16,
                color: trendDirection === 'up' ? 'success.main' : 'error.main',
                transform: trendDirection === 'down' ? 'rotate(180deg)' : 'none',
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: trendDirection === 'up' ? 'success.main' : 'error.main',
                fontWeight: 600,
              }}
            >
              {trend}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', ml: 0.5 }}
            >
              rispetto al mese scorso
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;