import { useParams } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material';

export default function EditSubscriptionPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Edit Subscription
      </Typography>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Subscription ID: {id}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Subscription editing form will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
}