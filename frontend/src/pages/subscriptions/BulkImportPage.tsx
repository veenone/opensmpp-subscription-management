import { Box, Typography, Paper } from '@mui/material';

export default function BulkImportPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Bulk Import
      </Typography>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Bulk import interface will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
}