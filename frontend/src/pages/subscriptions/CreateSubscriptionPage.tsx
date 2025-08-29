import { Box, Typography, Paper } from '@mui/material';

export default function CreateSubscriptionPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Create Subscription
      </Typography>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Subscription creation form will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
}