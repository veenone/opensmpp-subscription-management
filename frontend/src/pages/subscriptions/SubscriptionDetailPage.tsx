import { useParams } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material';

export default function SubscriptionDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Subscription Details
      </Typography>

      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Subscription ID: {id}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Detailed subscription view will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
}