import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Container maxWidth="xl">
            <Box sx={{ my: 4 }}>
              <Typography variant="h3" component="h1" gutterBottom>
                SMPP Subscription Management System
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Enterprise-grade subscription management for telecommunications
              </Typography>
              <Routes>
                <Route path="/" element={
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h5">Welcome</Typography>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                      The subscription management interface will be available here.
                    </Typography>
                  </Box>
                } />
              </Routes>
            </Box>
          </Container>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;