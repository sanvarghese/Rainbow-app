'use client';

import { Container, Paper, Typography, Box, Button } from '@mui/material';
import { signOut } from 'next-auth/react';

export default function NormalUserDashboard() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  return (
    <Container sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 6, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>
          Welcome to Your Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          This is the normal user dashboard.
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button variant="contained" color="error" onClick={handleLogout}>
            Sign Out
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}