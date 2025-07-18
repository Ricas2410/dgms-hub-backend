import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Apps,
  People,
  TrendingUp,
  Security,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';

import { applicationsAPI, usersAPI, auditAPI } from '../../services/api';

const StatCard = ({ title, value, icon, color = 'primary', loading = false }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="overline">
            {title}
          </Typography>
          {loading ? (
            <LinearProgress sx={{ width: 100, mb: 1 }} />
          ) : (
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          )}
        </Box>
        <Avatar
          sx={{
            bgcolor: `${color}.main`,
            width: 56,
            height: 56,
          }}
        >
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  // Fetch dashboard data
  const { data: applicationsData, isLoading: applicationsLoading } = useQuery(
    'dashboard-applications',
    () => applicationsAPI.getAll({ limit: 1000 }),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const { data: usersData, isLoading: usersLoading } = useQuery(
    'dashboard-users',
    () => usersAPI.getAll({ limit: 1000 }),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const { data: auditStats, isLoading: auditLoading } = useQuery(
    'dashboard-audit-stats',
    () => auditAPI.getStats({ days: 30 }),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Calculate statistics
  const totalApplications = applicationsData?.data?.pagination?.totalItems || 0;
  const activeApplications = applicationsData?.data?.applications?.filter(app => app.isActive).length || 0;
  const totalUsers = usersData?.data?.pagination?.totalItems || 0;
  const totalAuditLogs = auditStats?.data?.actionStats?.reduce((sum, stat) => sum + parseInt(stat.count), 0) || 0;

  return (
    <>
      <Helmet>
        <title>Dashboard - DGMS Hub Admin</title>
      </Helmet>

      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Welcome to the DGMS Hub Admin Panel. Here's an overview of your system.
        </Typography>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Applications"
              value={totalApplications}
              icon={<Apps />}
              color="primary"
              loading={applicationsLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Applications"
              value={activeApplications}
              icon={<TrendingUp />}
              color="success"
              loading={applicationsLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={totalUsers}
              icon={<People />}
              color="info"
              loading={usersLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Audit Logs (30d)"
              value={totalAuditLogs}
              icon={<Security />}
              color="warning"
              loading={auditLoading}
            />
          </Grid>
        </Grid>

        {/* Recent Activity */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Applications
                </Typography>
                {applicationsLoading ? (
                  <LinearProgress />
                ) : (
                  <Box>
                    {applicationsData?.data?.applications?.slice(0, 5).map((app) => (
                      <Box
                        key={app.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          py: 1,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          '&:last-child': { borderBottom: 'none' },
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: app.backgroundColor || 'primary.main',
                            mr: 2,
                            width: 32,
                            height: 32,
                          }}
                        >
                          <Apps fontSize="small" />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2">
                            {app.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {app.category || 'Uncategorized'}
                          </Typography>
                        </Box>
                        <Typography
                          variant="caption"
                          color={app.isActive ? 'success.main' : 'error.main'}
                        >
                          {app.isActive ? 'Active' : 'Inactive'}
                        </Typography>
                      </Box>
                    ))}
                    {(!applicationsData?.data?.applications || applicationsData.data.applications.length === 0) && (
                      <Typography variant="body2" color="textSecondary" textAlign="center" py={2}>
                        No applications found
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Status
                </Typography>
                <Box sx={{ py: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Database</Typography>
                    <Typography variant="body2" color="success.main">Online</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">API Server</Typography>
                    <Typography variant="body2" color="success.main">Running</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">File Storage</Typography>
                    <Typography variant="body2" color="success.main">Available</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Last Backup</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {new Date().toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default DashboardPage;
