import { Box, Typography, Paper } from '@mui/material';

export default function AuditLogsPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Audit Logs
      </Typography>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Audit log viewer will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
}