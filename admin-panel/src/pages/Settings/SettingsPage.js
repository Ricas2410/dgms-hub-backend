import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';

const SettingsPage = () => {
  return (
    <>
      <Helmet>
        <title>Settings - DGMS Hub Admin</title>
      </Helmet>

      <Box>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Settings
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Configure system settings and preferences
          </Typography>
        </Box>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Configuration
            </Typography>
            <Typography variant="body2" color="textSecondary">
              This page will contain system settings including:
            </Typography>
            <ul>
              <li>General system configuration</li>
              <li>Email and notification settings</li>
              <li>Security and authentication settings</li>
              <li>Backup and maintenance settings</li>
              <li>API configuration</li>
              <li>Theme and appearance settings</li>
            </ul>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default SettingsPage;
