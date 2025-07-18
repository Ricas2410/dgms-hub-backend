import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';

const UsersPage = () => {
  return (
    <>
      <Helmet>
        <title>Users - DGMS Hub Admin</title>
      </Helmet>

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <div>
            <Typography variant="h4" component="h1" gutterBottom>
              Users
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Manage admin panel users and their permissions
            </Typography>
          </div>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            size="large"
          >
            Add User
          </Button>
        </Box>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              User Management
            </Typography>
            <Typography variant="body2" color="textSecondary">
              This page will contain the user management interface including:
            </Typography>
            <ul>
              <li>List of all admin users</li>
              <li>Add/Edit/Delete users</li>
              <li>Manage user roles and permissions</li>
              <li>User activity tracking</li>
              <li>Password reset functionality</li>
              <li>Account activation/deactivation</li>
            </ul>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default UsersPage;
