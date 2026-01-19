import React from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Box, Typography } from '@mui/material';
import { ArrowBack, Security } from '@mui/icons-material';

const Unauthorized = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="80vh"
      p={3}
    >
      <Security sx={{ fontSize: 80, color: 'error.main', mb: 3 }} />
      <Typography variant="h4" gutterBottom>
        Access Denied
      </Typography>
      <Typography variant="body1" color="textSecondary" align="center" sx={{ mb: 3 }}>
        You don't have permission to access this page. Please contact your administrator
        if you believe this is an error.
      </Typography>
      <Button
        component={Link}
        to="/dashboard"
        variant="contained"
        startIcon={<ArrowBack />}
      >
        Back to Dashboard
      </Button>
    </Box>
  );
};

export default Unauthorized;