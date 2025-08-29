import { Box, Typography, Paper } from '@mui/material';

export default function SettingsPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Settings
      </Typography>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Application settings will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
}