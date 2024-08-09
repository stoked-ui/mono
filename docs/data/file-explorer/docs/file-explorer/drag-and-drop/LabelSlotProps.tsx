import * as React from 'react';
import Box from '@mui/material/Box';
import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';
import { File, FileProps } from '@stoked-ui/file-explorer/File';
import { NestedFiles } from 'docs/src/components/fileExplorer/data';

const CustomTreeItem = React.forwardRef(
  (props: FileProps, ref: React.Ref<HTMLLIElement>) => (
    <File
      ref={ref}
      {...props}
      slotProps={{
        label: {
          id: `${props.itemId}-label`,
        },
      }}
    />
  ),
);

export default function LabelSlotProps() {
  return (
    <Box sx={{ minHeight: 352, minWidth: 250 }}>
      <FileExplorer
        items={NestedFiles}
        defaultExpandedItems={['grid']}
        slots={{ item: CustomTreeItem }}
      />
    </Box>
  );
}
