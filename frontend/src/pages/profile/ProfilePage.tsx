import { Box, Typography, Paper } from '@mui/material';

export default function ProfilePage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        User Profile
      </Typography>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          User profile management will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
}