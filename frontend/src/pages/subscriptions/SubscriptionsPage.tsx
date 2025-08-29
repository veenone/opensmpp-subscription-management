import {
  Box,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function SubscriptionsPage() {
  const navigate = useNavigate();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Subscriptions
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/subscriptions/create')}
        >
          Create Subscription
        </Button>
      </Box>

      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Subscriptions Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          The subscriptions list and management interface will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
}