import React, { useState, useMemo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Checkbox,
  IconButton,
  Tooltip,
  Typography,
  TextField,
  InputAdornment,
  Toolbar,
  alpha,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search,
  FilterList,
  MoreVert,
  GetApp,
} from '@mui/icons-material';
import { LoadingSpinner } from './LoadingSpinner';

export interface Column<T = any> {
  id: keyof T;
  label: string;
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  searchable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  format?: (value: any) => string;
  type?: 'string' | 'number' | 'date' | 'boolean' | 'chip' | 'actions';
}

export interface RowAction<T = any> {
  label: string;
  icon: React.ReactNode;
  onClick: (row: T) => void;
  color?: 'inherit' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  disabled?: (row: T) => boolean;
  hidden?: (row: T) => boolean;
}

interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string;
  title?: string;
  selectable?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  actions?: RowAction<T>[];
  bulkActions?: RowAction<T[]>[];
  onSelectionChange?: (selected: T[]) => void;
  onSearch?: (query: string) => void;
  onSort?: (column: keyof T, direction: 'asc' | 'desc') => void;
  onExport?: () => void;
  pagination?: {
    page: number;
    rowsPerPage: number;
    total: number;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rowsPerPage: number) => void;
  };
  rowsPerPageOptions?: number[];
  dense?: boolean;
  stickyHeader?: boolean;
  maxHeight?: number;
  emptyMessage?: string;
  getRowId?: (row: T) => string | number;
}

export const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  error,
  title,
  selectable = false,
  searchable = false,
  filterable = false,
  exportable = false,
  actions = [],
  bulkActions = [],
  onSelectionChange,
  onSearch,
  onSort,
  onExport,
  pagination,
  rowsPerPageOptions = [5, 10, 25, 50],
  dense = false,
  stickyHeader = false,
  maxHeight = 600,
  emptyMessage = 'No data available',
  getRowId = (row) => row.id || row.key,
}: DataTableProps<T>) => {
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [actionMenuAnchor, setActionMenuAnchor] = useState<{
    element: HTMLElement;
    row: T;
  } | null>(null);

  const selectedRows = useMemo(() => {
    return data.filter(row => selected.has(getRowId(row)));
  }, [data, selected, getRowId]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = new Set(data.map(row => getRowId(row)));
      setSelected(newSelected);
    } else {
      setSelected(new Set());
    }
  };

  const handleSelectRow = (rowId: string | number) => {
    const newSelected = new Set(selected);
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }
    setSelected(newSelected);
  };

  const handleSort = (column: keyof T) => {
    const isAsc = sortColumn === column && sortDirection === 'asc';
    const newDirection = isAsc ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
    onSort?.(column, newDirection);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, row: T) => {
    setActionMenuAnchor({ element: event.currentTarget, row });
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
  };

  const handleActionClick = (action: RowAction<T>, row: T) => {
    action.onClick(row);
    handleActionMenuClose();
  };

  const renderCellContent = (column: Column<T>, value: any, row: T) => {
    if (column.render) {
      return column.render(value, row);
    }

    if (column.format) {
      return column.format(value);
    }

    switch (column.type) {
      case 'boolean':
        return (
          <Chip
            label={value ? 'Yes' : 'No'}
            color={value ? 'success' : 'default'}
            size="small"
          />
        );
      case 'date':
        return value ? new Date(value).toLocaleDateString() : '-';
      case 'chip':
        return (
          <Chip
            label={value}
            size="small"
            variant="outlined"
          />
        );
      case 'actions':
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {actions.filter(action => !action.hidden?.(row)).map((action, index) => (
              action.label === 'More' ? (
                <IconButton
                  key={index}
                  size="small"
                  onClick={(e) => handleActionMenuOpen(e, row)}
                  disabled={action.disabled?.(row)}
                >
                  <MoreVert />
                </IconButton>
              ) : (
                <Tooltip key={index} title={action.label}>
                  <IconButton
                    size="small"
                    onClick={() => action.onClick(row)}
                    disabled={action.disabled?.(row)}
                    color={action.color}
                  >
                    {action.icon}
                  </IconButton>
                </Tooltip>
              )
            ))}
          </Box>
        );
      default:
        return value ?? '-';
    }
  };

  React.useEffect(() => {
    onSelectionChange?.(selectedRows);
  }, [selectedRows, onSelectionChange]);

  if (error) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Toolbar */}
      {(title || searchable || filterable || exportable || selectedRows.length > 0) && (
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            ...(selectedRows.length > 0 && {
              bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
            }),
          }}
        >
          {selectedRows.length > 0 ? (
            <Typography
              sx={{ flex: '1 1 100%' }}
              color="inherit"
              variant="subtitle1"
              component="div"
            >
              {selectedRows.length} selected
            </Typography>
          ) : (
            <Typography
              sx={{ flex: '1 1 100%' }}
              variant="h6"
              id="tableTitle"
              component="div"
            >
              {title}
            </Typography>
          )}

          {selectedRows.length > 0 ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {bulkActions.map((action, index) => (
                <Tooltip key={index} title={action.label}>
                  <IconButton
                    onClick={() => action.onClick(selectedRows)}
                    disabled={action.disabled?.(selectedRows)}
                    color={action.color}
                  >
                    {action.icon}
                  </IconButton>
                </Tooltip>
              ))}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {searchable && (
                <TextField
                  size="small"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: 200 }}
                />
              )}
              {filterable && (
                <Tooltip title="Filter">
                  <IconButton>
                    <FilterList />
                  </IconButton>
                </Tooltip>
              )}
              {exportable && (
                <Tooltip title="Export">
                  <IconButton onClick={onExport}>
                    <GetApp />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}
        </Toolbar>
      )}

      {/* Table */}
      <TableContainer sx={{ maxHeight: stickyHeader ? maxHeight : undefined }}>
        <Table
          stickyHeader={stickyHeader}
          aria-labelledby="tableTitle"
          size={dense ? 'small' : 'medium'}
        >
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selected.size > 0 && selected.size < data.length}
                    checked={data.length > 0 && selected.size === data.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={String(column.id)}
                  align={column.align || 'left'}
                  style={{
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                  }}
                  sortDirection={sortColumn === column.id ? sortDirection : false}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={sortColumn === column.id}
                      direction={sortColumn === column.id ? sortDirection : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  sx={{ textAlign: 'center', py: 4 }}
                >
                  <LoadingSpinner message="Loading data..." />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  sx={{ textAlign: 'center', py: 4 }}
                >
                  <Typography variant="body1" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => {
                const rowId = getRowId(row);
                const isSelected = selected.has(rowId);

                return (
                  <TableRow
                    hover
                    role="checkbox"
                    aria-checked={isSelected}
                    tabIndex={-1}
                    key={rowId}
                    selected={isSelected}
                    sx={{ cursor: selectable ? 'pointer' : 'default' }}
                    onClick={() => selectable && handleSelectRow(rowId)}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isSelected}
                          onChange={() => handleSelectRow(rowId)}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell
                        key={String(column.id)}
                        align={column.align || 'left'}
                        style={{
                          minWidth: column.minWidth,
                          maxWidth: column.maxWidth,
                        }}
                      >
                        {renderCellContent(column, row[column.id], row)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pagination && (
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={pagination.total}
          rowsPerPage={pagination.rowsPerPage}
          page={pagination.page}
          onPageChange={(_, newPage) => pagination.onPageChange(newPage)}
          onRowsPerPageChange={(event) => {
            pagination.onRowsPerPageChange(parseInt(event.target.value, 10));
          }}
        />
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor?.element}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {actionMenuAnchor &&
          actions
            .filter(action => !action.hidden?.(actionMenuAnchor.row))
            .map((action, index) => (
              <MenuItem
                key={index}
                onClick={() => handleActionClick(action, actionMenuAnchor.row)}
                disabled={action.disabled?.(actionMenuAnchor.row)}
              >
                <ListItemIcon>{action.icon}</ListItemIcon>
                <ListItemText>{action.label}</ListItemText>
              </MenuItem>
            ))
        }
      </Menu>
    </Paper>
  );
};
