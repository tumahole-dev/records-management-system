import React, { useState } from 'react';
import {
  Box, Button, Paper, Typography, TextField,
  Grid, FormControl, InputLabel, Select, MenuItem,
  FormHelperText, Alert, CircularProgress, Stepper,
  Step, StepLabel, Card, CardContent, Divider
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../utils/axiosConfig';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const AddEmployee = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  const [formData, setFormData] = useState({
    // User Account Info
    email: '',
    password: 'DefaultPassword123!',
    role: 'employee',
    
    // Personal Information
    personalDetails: {
      firstName: '',
      lastName: '',
      dateOfBirth: null,
      gender: '',
      personalEmail: '',
      contactNumber: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: ''
      }
    },
    
    // Job Information
    employeeId: '',
    jobDetails: {
      department: '',
      position: '',
      hireDate: null,
      salary: '',
      employmentType: 'Full-time',
      workLocation: 'Office'
    },
    
    // Additional Information
    qualifications: '',
    experience: '',
    notes: '',
    
    // Status
    status: 'Active'
  });

  const departments = ['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales'];
  const positions = ['Manager', 'Developer', 'Analyst', 'Designer', 'Accountant', 'HR Specialist'];
  const roleOptions = user?.role === 'admin' 
    ? ['admin', 'manager', 'employee'] 
    : ['employee'];

  const steps = ['Account Setup', 'Personal Information', 'Job Details'];

  const handleChange = (path, value) => {
    const keys = path.split('.');
    setFormData(prev => {
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

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const validateStep = () => {
    if (activeStep === 0) {
      if (!formData.email || !formData.role) {
        setError('Please fill in all required account fields');
        return false;
      }
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setError('Please enter a valid email address');
        return false;
      }
    }
    if (activeStep === 1) {
      if (!formData.personalDetails.firstName || !formData.personalDetails.lastName) {
        setError('Please fill in all required personal information fields');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep()) {
      return;
    }

    if (activeStep < steps.length - 1) {
      handleNext();
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Check if user has permission to create employees
      if (user?.role !== 'admin' && user?.role !== 'manager') {
        setError('You do not have permission to add employees');
        return;
      }

      const response = await axiosInstance.post('/api/employees', formData);
      
      setSuccess('Employee added successfully!');
      setTimeout(() => {
        navigate('/employees');
      }, 2000);
      
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You do not have permission to add employees.');
      } else if (err.response?.status === 409) {
        setError('Employee with this email already exists.');
      } else {
        setError(err.response?.data?.message || 'Failed to add employee. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Work Email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                helperText="This will be used for login"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                helperText="Default password will be sent to employee"
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  label="Role"
                >
                  {roleOptions.map(role => (
                    <MenuItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="First Name"
                value={formData.personalDetails.firstName}
                onChange={(e) => handleChange('personalDetails.firstName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Last Name"
                value={formData.personalDetails.lastName}
                onChange={(e) => handleChange('personalDetails.lastName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date of Birth"
                  value={formData.personalDetails.dateOfBirth}
                  onChange={(date) => handleChange('personalDetails.dateOfBirth', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.personalDetails.gender}
                  onChange={(e) => handleChange('personalDetails.gender', e.target.value)}
                  label="Gender"
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Personal Email"
                value={formData.personalDetails.personalEmail}
                onChange={(e) => handleChange('personalDetails.personalEmail', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Contact Number"
                value={formData.personalDetails.contactNumber}
                onChange={(e) => handleChange('personalDetails.contactNumber', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={formData.personalDetails.address.street}
                onChange={(e) => handleChange('personalDetails.address.street', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.personalDetails.address.city}
                onChange={(e) => handleChange('personalDetails.address.city', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="State"
                value={formData.personalDetails.address.state}
                onChange={(e) => handleChange('personalDetails.address.state', e.target.value)}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Employee ID"
                value={formData.employeeId}
                onChange={(e) => handleChange('employeeId', e.target.value)}
                helperText="Leave blank for auto-generation"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.jobDetails.department}
                  onChange={(e) => handleChange('jobDetails.department', e.target.value)}
                  label="Department"
                >
                  {departments.map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Position</InputLabel>
                <Select
                  value={formData.jobDetails.position}
                  onChange={(e) => handleChange('jobDetails.position', e.target.value)}
                  label="Position"
                >
                  {positions.map(pos => (
                    <MenuItem key={pos} value={pos}>{pos}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Hire Date"
                  value={formData.jobDetails.hireDate}
                  onChange={(date) => handleChange('jobDetails.hireDate', date)}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Salary"
                type="number"
                value={formData.jobDetails.salary}
                onChange={(e) => handleChange('jobDetails.salary', e.target.value)}
                InputProps={{
                  startAdornment: <span>$</span>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Employment Type</InputLabel>
                <Select
                  value={formData.jobDetails.employmentType}
                  onChange={(e) => handleChange('jobDetails.employmentType', e.target.value)}
                  label="Employment Type"
                >
                  <MenuItem value="Full-time">Full-time</MenuItem>
                  <MenuItem value="Part-time">Part-time</MenuItem>
                  <MenuItem value="Contract">Contract</MenuItem>
                  <MenuItem value="Intern">Intern</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="On Leave">On Leave</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  // Check if user has permission to access this page
  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return (
      <Box p={3}>
        <Alert severity="error">
          You do not have permission to access this page. Only admins and managers can add employees.
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

  return (
    <Box>
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate('/employees')}
        sx={{ mb: 3 }}
      >
        Back to Employees
      </Button>

      <Typography variant="h4" component="h1" gutterBottom>
        Add New Employee
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleSubmit}>
          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {activeStep === steps.length - 1 ? 'Save Employee' : 'Next'}
            </Button>
          </Box>
        </form>
      </Paper>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Preview
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">Name:</Typography>
              <Typography variant="body1">
                {formData.personalDetails.firstName} {formData.personalDetails.lastName}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">Email:</Typography>
              <Typography variant="body1">{formData.email}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">Role:</Typography>
              <Typography variant="body1">{formData.role}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">Department:</Typography>
              <Typography variant="body1">{formData.jobDetails.department}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AddEmployee;