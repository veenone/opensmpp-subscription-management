import { Box, Typography, Paper } from '@mui/material';

export default function RolesPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Role Management
      </Typography>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Role and permission management will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
}