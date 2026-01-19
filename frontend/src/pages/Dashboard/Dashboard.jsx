import React from 'react';
import {
  Box, Grid, Paper, Typography, Card, CardContent,
  LinearProgress, CircularProgress, Alert, Button
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Folder as FolderIcon,
  Description as DescriptionIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from 'react-query';
import axiosInstance from '../../utils/axiosConfig';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, color, change, loading }) => {
  const colors = {
    blue: { bg: '#e3f2fd', text: '#1976d2' },
    green: { bg: '#e8f5e9', text: '#2e7d32' },
    purple: { bg: '#f3e5f5', text: '#7b1fa2' },
    orange: { bg: '#fff3e0', text: '#f57c00' }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="textSecondary" variant="body2">
              {title}
            </Typography>
            {loading ? (
              <CircularProgress size={24} sx={{ mt: 1 }} />
            ) : (
              <Typography variant="h4" component="div" sx={{ mt: 1 }}>
                {value}
              </Typography>
            )}
            {change && (
              <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                {change} from last month
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: colors[color]?.bg,
              borderRadius: '50%',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon sx={{ color: colors[color]?.text, fontSize: 32 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const QuickAction = ({ title, description, icon: Icon, link, color }) => {
  return (
    <Card 
      component={Link} 
      to={link}
      sx={{ 
        textDecoration: 'none',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-4px)' }
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          <Icon sx={{ fontSize: 32, color }} />
          <Box>
            <Typography variant="h6">{title}</Typography>
            <Typography variant="body2" color="textSecondary">
              {description}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const { user, logout } = useAuth();

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery(
    'dashboard-stats',
    async () => {
      const response = await axiosInstance.get('/api/dashboard/stats');
      return response.data;
    }
  );

  // Fetch recent activities
  const { data: activities, isLoading: activitiesLoading } = useQuery(
    'dashboard-activities',
    async () => {
      const response = await axiosInstance.get('/api/dashboard/activities');
      return response.data;
    }
  );

  if (statsError) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load dashboard data. Please check your connection.
        </Alert>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Welcome back, {user?.firstName} {user?.lastName}!
            <Typography component="span" variant="caption" sx={{ ml: 1, textTransform: 'capitalize' }}>
              ({user?.role})
            </Typography>
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          {user?.role === 'admin' || user?.role === 'manager' ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              component={Link}
              to="/employees/add"
            >
              Add Employee
            </Button>
          ) : null}
        </Box>
      </Box>

      {/* Statistics Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Employees"
            value={stats?.totalEmployees || 0}
            icon={PeopleIcon}
            color="blue"
            change="+12%"
            loading={statsLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Projects"
            value={stats?.activeProjects || 0}
            icon={FolderIcon}
            color="green"
            change="+8%"
            loading={statsLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Departments"
            value={stats?.totalDepartments || 0}
            icon={BusinessIcon}
            color="purple"
            loading={statsLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Tasks"
            value={stats?.pendingTasks || 0}
            icon={DescriptionIcon}
            color="orange"
            change="-3%"
            loading={statsLoading}
          />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <QuickAction
                  title="View Employees"
                  description="Browse and manage employee records"
                  icon={PeopleIcon}
                  link="/employees"
                  color="#1976d2"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <QuickAction
                  title="Manage Documents"
                  description="Handle company documents and files"
                  icon={DescriptionIcon}
                  link="/documents"
                  color="#2e7d32"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Recent Activities */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            {activitiesLoading ? (
              <CircularProgress />
            ) : activities && activities.length > 0 ? (
              <Box>
                {activities.slice(0, 5).map((activity, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      py: 2,
                      borderBottom: index < 4 ? '1px solid #eee' : 'none'
                    }}
                  >
                    <Box sx={{ mr: 2 }}>
                      {activity.type === 'success' ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <WarningIcon color="warning" />
                      )}
                    </Box>
                    <Box flex={1}>
                      <Typography variant="body2">{activity.description}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {format(new Date(activity.timestamp), 'MMM dd, hh:mm a')}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography color="textSecondary">No recent activities</Typography>
            )}
          </Paper>
        </Grid>

        {/* System Status & User Info */}
        <Grid item xs={12} md={4}>
          {/* System Status */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Status
            </Typography>
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2">Database</Typography>
                <CheckCircleIcon fontSize="small" color="success" />
              </Box>
              <LinearProgress variant="determinate" value={100} sx={{ mb: 2 }} />

              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2">API Server</Typography>
                <CheckCircleIcon fontSize="small" color="success" />
              </Box>
              <LinearProgress variant="determinate" value={100} sx={{ mb: 2 }} />

              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2">Storage</Typography>
                <CheckCircleIcon fontSize="small" color="success" />
              </Box>
              <LinearProgress variant="determinate" value={85} />
            </Box>
          </Paper>

          {/* User Info */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Your Profile
            </Typography>
            <Box display="flex" alignItems="center" mb={2}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2
                }}
              >
                <Typography variant="h6" color="white">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle1">
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {user?.position || 'Employee'}
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Department:</strong> {user?.department || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Email:</strong> {user?.email}
              </Typography>
              <Typography variant="body2">
                <strong>Role:</strong> {user?.role}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;