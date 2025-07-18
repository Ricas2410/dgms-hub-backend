import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';

const ProfilePage = () => {
  return (
    <>
      <Helmet>
        <title>Profile - DGMS Hub Admin</title>
      </Helmet>

      <Box>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Profile
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage your account settings and preferences
          </Typography>
        </Box>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              User Profile
            </Typography>
            <Typography variant="body2" color="textSecondary">
              This page will contain profile management including:
            </Typography>
            <ul>
              <li>Edit personal information</li>
              <li>Change password</li>
              <li>Update profile picture</li>
              <li>Notification preferences</li>
              <li>Activity history</li>
              <li>Account security settings</li>
            </ul>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default ProfilePage;
