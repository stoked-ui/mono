import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { FileExplorerBasic } from '@stoked-ui/file-explorer/FileExplorerBasic';
import { FileElement } from '@stoked-ui/file-explorer/FileElement';
import { useFileExplorerApiRef } from '@stoked-ui/file-explorer/hooks/useFileExplorerApiRef';

export default function ApiMethodSelectItemKeepExistingSelection() {
  const apiRef = useFileExplorerApiRef();
  const handleSelectGridPro = (event: React.SyntheticEvent) => {
    apiRef.current?.selectItem({
      event,
      itemId: 'grid-pro',
      keepExistingSelection: true,
    });
  };

  return (
    <Stack spacing={2}>
      <div>
        <Button onClick={handleSelectGridPro}>Select grid pro item</Button>
      </div>
      <Box sx={{ minHeight: 352, minWidth: 250 }}>
        <FileExplorerBasic
          apiRef={apiRef}
          defaultExpandedItems={['grid']}
          multiSelect
          defaultSelectedItems={['grid-premium']}
        >
          <FileElement itemId="grid" label="Data Grid">
            <FileElement itemId="grid-community" label="@mui/x-data-grid" />
            <FileElement itemId="grid-pro" label="@mui/x-data-grid-pro" />
            <FileElement itemId="grid-premium" label="@mui/x-data-grid-premium" />
          </FileElement>
          <FileElement itemId="pickers" label="Date and Time Pickers">
            <FileElement itemId="pickers-community" label="@mui/x-date-pickers" />
            <FileElement itemId="pickers-pro" label="@mui/x-date-pickers-pro" />
          </FileElement>
          <FileElement itemId="charts" label="Charts">
            <FileElement itemId="charts-community" label="@mui/x-charts" />
          </FileElement>
          <FileElement itemId="file-explorer" label="File Explorer">
            <FileElement itemId="file-explorer-community" label="@stoked-ui/file-explorer" />
          </FileElement>
        </FileExplorerBasic>
      </Box>
    </Stack>
  );
}
