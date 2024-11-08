import * as React from 'react';
import Box from '@mui/material/Box';

import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';

const MUI_X_PRODUCTS = [
  {
    internalId: 'grid',
    label: 'Data Grid',
    children: [
      { internalId: 'grid-community', label: '@mui/x-data-grid' },
      { internalId: 'grid-pro', label: '@mui/x-data-grid-pro' },
      { internalId: 'grid-premium', label: '@mui/x-data-grid-premium' },
    ],
  },
  {
    internalId: 'pickers',
    label: 'Date and Time Pickers',
    children: [
      { internalId: 'pickers-community', label: '@mui/x-date-pickers' },
      { internalId: 'pickers-pro', label: '@mui/x-date-pickers-pro' },
    ],
  },
  {
    internalId: 'charts',
    label: 'Charts',
    children: [{ internalId: 'charts-community', label: '@mui/x-charts' }],
  },
  {
    internalId: 'file-explorer',
    label: 'File Explorer',
    children: [
      { internalId: 'file-explorer-community', label: '@stoked-ui/file-explorer' },
    ],
  },
];

const getItemId = (item) => item.internalId;

export default function GetItemId() {
  return (
    <Box sx={{ minHeight: 352, minWidth: 250 }}>
      <FileExplorer items={MUI_X_PRODUCTS} getItemId={getItemId} />
    </Box>
  );
}
