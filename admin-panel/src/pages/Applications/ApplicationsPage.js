import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';

const ApplicationsPage = () => {
  return (
    <>
      <Helmet>
        <title>Applications - DGMS Hub Admin</title>
      </Helmet>

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <div>
            <Typography variant="h4" component="h1" gutterBottom>
              Applications
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Manage school web applications and their settings
            </Typography>
          </div>
          <Button
            variant="contained"
            startIcon={<Add />}
            size="large"
          >
            Add Application
          </Button>
        </Box>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Applications Management
            </Typography>
            <Typography variant="body2" color="textSecondary">
              This page will contain the applications management interface including:
            </Typography>
            <ul>
              <li>List of all applications with search and filtering</li>
              <li>Add/Edit/Delete applications</li>
              <li>Upload and manage application icons</li>
              <li>Reorder applications</li>
              <li>Manage categories</li>
              <li>Bulk operations</li>
            </ul>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default ApplicationsPage;
