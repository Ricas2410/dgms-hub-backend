import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(3),
}));

const LoadingPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  minWidth: 200,
}));

const LoadingScreen = ({ 
  message = 'Loading...', 
  size = 40,
  showPaper = true 
}) => {
  const content = (
    <>
      <CircularProgress size={size} />
      <Typography variant="body1" color="textSecondary">
        {message}
      </Typography>
    </>
  );

  return (
    <LoadingContainer>
      {showPaper ? (
        <LoadingPaper elevation={3}>
          {content}
        </LoadingPaper>
      ) : (
        content
      )}
    </LoadingContainer>
  );
};

export default LoadingScreen;
