import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Typography,
  Chip, IconButton, TextField, InputAdornment,
  CircularProgress, Alert, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle,
  Select, MenuItem, FormControl, InputLabel,
  Pagination, Grid, FormControlLabel, Switch
} from '@mui/material';
import { 
  Add as AddIcon, Search as SearchIcon,
  Edit as EditIcon, Delete as DeleteIcon,
  Visibility as ViewIcon, FilterList as FilterIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../utils/axiosConfig';
import { format } from 'date-fns';

const Employees = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState({ 
    open: false, employeeId: null, employeeName: '' 
  });
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const departments = ['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales'];
  const statusOptions = ['Active', 'Inactive', 'On Leave', 'Terminated'];

  useEffect(() => {
    fetchEmployees();
  }, [page, departmentFilter, statusFilter]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (departmentFilter) params.append('department', departmentFilter);
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await axiosInstance.get(`/api/employees?${params}`);
      setEmployees(response.data.employees || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalEmployees(response.data.total || 0);
      setError('');
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Access denied: You do not have permission to view employees.');
        navigate('/unauthorized');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        navigate('/login');
      } else {
        setError('Failed to fetch employees. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEmployees();
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/api/employees/${deleteDialog.employeeId}`);
      setEmployees(employees.filter(emp => emp._id !== deleteDialog.employeeId));
      setDeleteDialog({ open: false, employeeId: null, employeeName: '' });
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You do not have permission to delete employees.');
      } else {
        setError('Failed to delete employee. Please try again.');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'error';
      case 'On Leave': return 'warning';
      case 'Terminated': return 'default';
      default: return 'default';
    }
  };

  const canAddEmployee = user?.role === 'admin' || user?.role === 'manager';
  const canEditDelete = user?.role === 'admin' || user?.role === 'manager';

  if (loading && page === 1) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Employees
        </Typography>
        <Box>
          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchEmployees}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          {canAddEmployee && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              component={Link}
              to="/employees/add"
            >
              Add Employee
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <form onSubmit={handleSearch}>
              <TextField
                fullWidth
                placeholder="Search by name, email, or ID..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchTerm('')}>
                        <Typography variant="caption">Clear</Typography>
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </form>
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                label="Department"
              >
                <MenuItem value="">All Departments</MenuItem>
                {departments.map(dept => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All Status</MenuItem>
                {statusOptions.map(status => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Hire Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="textSecondary" py={2}>
                    No employees found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee._id} hover>
                  <TableCell>{employee.employeeId || 'N/A'}</TableCell>
                  <TableCell>
                    <Typography fontWeight="medium">
                      {employee.personalDetails?.firstName} {employee.personalDetails?.lastName}
                    </Typography>
                  </TableCell>
                  <TableCell>{employee.jobDetails?.position || 'N/A'}</TableCell>
                  <TableCell>{employee.jobDetails?.department || 'N/A'}</TableCell>
                  <TableCell>{employee.user?.email || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={employee.status || 'Active'}
                      color={getStatusColor(employee.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {employee.jobDetails?.hireDate 
                      ? format(new Date(employee.jobDetails.hireDate), 'MMM dd, yyyy') 
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      component={Link}
                      to={`/employees/${employee._id}`}
                      size="small"
                    >
                      <ViewIcon />
                    </IconButton>
                    {canEditDelete && (
                      <>
                        <IconButton
                          color="secondary"
                          component={Link}
                          to={`/employees/edit/${employee._id}`}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => setDeleteDialog({
                            open: true,
                            employeeId: employee._id,
                            employeeName: `${employee.personalDetails?.firstName} ${employee.personalDetails?.lastName}`
                          })}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, employeeId: null, employeeName: '' })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete employee "{deleteDialog.employeeName}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, employeeId: null, employeeName: '' })}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Employees;