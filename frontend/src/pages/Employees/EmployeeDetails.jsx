import React, { useState } from 'react';
import {
  Box, Button, Paper, Typography, Grid,
  Chip, Divider, Card, CardContent, List,
  ListItem, ListItemText, ListItemIcon, Avatar,
  Alert, CircularProgress, Tabs, Tab, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  DialogContentText, TextField, MenuItem, Select,
  FormControl, InputLabel
} from '@mui/material';
import {
  ArrowBack as BackIcon, Edit as EditIcon,
  Email as EmailIcon, Phone as PhoneIcon,
  LocationOn as LocationIcon, CalendarToday as CalendarIcon,
  Work as WorkIcon, Person as PersonIcon,
  Delete as DeleteIcon, Save as SaveIcon
} from '@mui/icons-material';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../utils/axiosConfig';
import { format } from 'date-fns';

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [deleteDialog, setDeleteDialog] = useState(false);

  // Fetch employee details
  const { data: employee, isLoading, error } = useQuery(
    ['employee', id],
    async () => {
      const response = await axiosInstance.get(`/api/employees/${id}`);
      return response.data;
    },
    {
      onError: (err) => {
        if (err.response?.status === 403) {
          navigate('/unauthorized');
        } else if (err.response?.status === 404) {
          navigate('/employees');
        }
      }
    }
  );

  // Update employee mutation
  const updateMutation = useMutation(
    async (updatedData) => {
      const response = await axiosInstance.put(`/api/employees/${id}`, updatedData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['employee', id]);
        setEditMode(false);
      }
    }
  );

  // Delete employee mutation
  const deleteMutation = useMutation(
    async () => {
      await axiosInstance.delete(`/api/employees/${id}`);
    },
    {
      onSuccess: () => {
        navigate('/employees');
      }
    }
  );

  const handleEdit = () => {
    setEditData({
      personalDetails: { ...employee.personalDetails },
      jobDetails: { ...employee.jobDetails },
      status: employee.status
    });
    setEditMode(true);
  };

  const handleSave = () => {
    updateMutation.mutate(editData);
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditData({});
  };

  const handleChange = (path, value) => {
    const keys = path.split('.');
    setEditData(prev => {
      const newData = { ...prev };
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const canEditDelete = user?.role === 'admin' || user?.role === 'manager';
  const canEdit = user?.role === 'admin' || user?.role === 'manager' || user?._id === id;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load employee details. Please try again.
        </Alert>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/employees')}
          sx={{ mt: 2 }}
        >
          Back to Employees
        </Button>
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box p={3}>
        <Alert severity="warning">
          Employee not found
        </Alert>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/employees')}
          sx={{ mt: 2 }}
        >
          Back to Employees
        </Button>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'error';
      case 'On Leave': return 'warning';
      case 'Terminated': return 'default';
      default: return 'default';
    }
  };

  const renderPersonalInfo = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="First Name"
          value={editMode ? editData.personalDetails?.firstName : employee.personalDetails?.firstName}
          onChange={(e) => handleChange('personalDetails.firstName', e.target.value)}
          disabled={!editMode}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Last Name"
          value={editMode ? editData.personalDetails?.lastName : employee.personalDetails?.lastName}
          onChange={(e) => handleChange('personalDetails.lastName', e.target.value)}
          disabled={!editMode}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Date of Birth"
          value={editMode 
            ? editData.personalDetails?.dateOfBirth 
            : employee.personalDetails?.dateOfBirth
              ? format(new Date(employee.personalDetails.dateOfBirth), 'yyyy-MM-dd')
              : ''
          }
          onChange={(e) => handleChange('personalDetails.dateOfBirth', e.target.value)}
          disabled={!editMode}
          type="date"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Gender</InputLabel>
          <Select
            value={editMode ? editData.personalDetails?.gender : employee.personalDetails?.gender}
            onChange={(e) => handleChange('personalDetails.gender', e.target.value)}
            disabled={!editMode}
            label="Gender"
          >
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Address"
          value={editMode 
            ? editData.personalDetails?.address?.street 
            : employee.personalDetails?.address?.street
          }
          onChange={(e) => handleChange('personalDetails.address.street', e.target.value)}
          disabled={!editMode}
          multiline
          rows={2}
        />
      </Grid>
    </Grid>
  );

  const renderJobInfo = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Department"
          value={editMode ? editData.jobDetails?.department : employee.jobDetails?.department}
          onChange={(e) => handleChange('jobDetails.department', e.target.value)}
          disabled={!editMode}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Position"
          value={editMode ? editData.jobDetails?.position : employee.jobDetails?.position}
          onChange={(e) => handleChange('jobDetails.position', e.target.value)}
          disabled={!editMode}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Hire Date"
          value={editMode 
            ? editData.jobDetails?.hireDate 
            : employee.jobDetails?.hireDate
              ? format(new Date(employee.jobDetails.hireDate), 'yyyy-MM-dd')
              : ''
          }
          onChange={(e) => handleChange('jobDetails.hireDate', e.target.value)}
          disabled={!editMode}
          type="date"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Salary"
          value={editMode ? editData.jobDetails?.salary : employee.jobDetails?.salary}
          onChange={(e) => handleChange('jobDetails.salary', e.target.value)}
          disabled={!editMode}
          type="number"
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={editMode ? editData.status : employee.status}
            onChange={(e) => handleChange('status', e.target.value)}
            disabled={!editMode || !canEditDelete}
            label="Status"
          >
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
            <MenuItem value="On Leave">On Leave</MenuItem>
            <MenuItem value="Terminated">Terminated</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton component={Link} to="/employees">
            <BackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Employee Details
          </Typography>
          <Chip
            label={employee.status}
            color={getStatusColor(employee.status)}
            size="small"
          />
        </Box>
        
        <Box display="flex" gap={1}>
          {editMode ? (
            <>
              <Button
                startIcon={<SaveIcon />}
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={updateMutation.isLoading}
              >
                {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button onClick={handleCancel} disabled={updateMutation.isLoading}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              {canEdit && (
                <Button
                  startIcon={<EditIcon />}
                  variant="outlined"
                  color="primary"
                  onClick={handleEdit}
                >
                  Edit
                </Button>
              )}
              {canEditDelete && (
                <Button
                  startIcon={<DeleteIcon />}
                  variant="outlined"
                  color="error"
                  onClick={() => setDeleteDialog(true)}
                >
                  Delete
                </Button>
              )}
            </>
          )}
        </Box>
      </Box>

      {updateMutation.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {updateMutation.error.response?.data?.message || 'Failed to update employee'}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Column - Personal & Job Info */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {renderPersonalInfo()}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Job Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {renderJobInfo()}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Contact & Quick Info */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Email" 
                    secondary={employee.user?.email} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Phone" 
                    secondary={employee.personalDetails?.contactNumber} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocationIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Address" 
                    secondary={
                      employee.personalDetails?.address?.street
                        ? `${employee.personalDetails.address.street}, ${employee.personalDetails.address.city}`
                        : 'Not specified'
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                <ListItem>
                  <ListItemIcon>
                    <WorkIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Employee ID" 
                    secondary={employee.employeeId || 'N/A'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Hire Date" 
                    secondary={
                      employee.jobDetails?.hireDate
                        ? format(new Date(employee.jobDetails.hireDate), 'MMM dd, yyyy')
                        : 'N/A'
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Role" 
                    secondary={employee.user?.role || 'N/A'} 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
      >
        <DialogTitle>Delete Employee</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {employee.personalDetails?.firstName} {employee.personalDetails?.lastName}?
            This action cannot be undone and will permanently remove all employee data.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={() => deleteMutation.mutate()}
            color="error"
            variant="contained"
            disabled={deleteMutation.isLoading}
          >
            {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeDetails;