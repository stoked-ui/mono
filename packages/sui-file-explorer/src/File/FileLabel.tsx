import * as React from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import { SxProps, Theme } from '@mui/system';
import Box from '@mui/material/Box';
import { resolveComponentProps, useSlotProps } from '@mui/base/utils';
import { shouldForwardProp } from '@mui/system/createStyled';
import { styled } from '@mui/material/styles';
import { FileIconContainer } from './FileIconContainer';
import { useFileExplorerContext } from '../internals/FileExplorerProvider/useFileExplorerContext';
import { UseFileExplorerIconsSignature } from '../internals/plugins/useFileExplorerIcons/useFileExplorerIcons.types';
import { FileExplorerCollapseIcon, FileExplorerExpandIcon } from '../icons';
import { UseFileExplorerGridColumnHeaderStatus } from '../internals/plugins/useFileExplorerGrid/useFileExplorerGrid.types';
import { FileIcon, FileIconSlotProps, FileIconSlots } from '../internals/FileIcon';
import { useFileExplorerGridColumnHeader } from '../internals/plugins/useFileExplorerGrid/useFileExplorerGridColumnHeader';
import { UseFileMinimalPlugins } from '../internals/models';

const FileLabelRoot = styled('div', {
  name: 'MuiFile',
  slot: 'Label',
  overridesResolver: (props, styles) => styles.label,
  shouldForwardProp: (prop) =>
    shouldForwardProp(prop) &&
    prop !== 'grow' &&
    prop !== 'cell' &&
    prop !== 'last' &&
    prop !== 'header' &&
    prop !== 'first' &&
    prop !== 'grid' &&
    prop !== 'selected',
})<{
  grow?: boolean;
  header?: boolean;
  cell?: boolean;
  last?: boolean;
  grid?: boolean;
  selected?: boolean;
}>(({ theme, grow, cell }) => ({
  boxSizing: 'border-box', // prevent width + padding to overflow
  // fixes overflow - see https://github.com/stoked-ui/stoked-ui/issues/27372
  minWidth: 0,
  position: 'relative',
  ...theme.typography.body1,
  flexGrow: grow ? 1 : undefined,
  padding: cell ? theme.spacing(0.5) : undefined,
  variants: [
    {
      props: { cell: true, header: undefined },
      style: {
        /*
      '&::before': {
      content: '""',
      position: 'absolute',
      background: selected ? theme.palette.primary.dark : theme.palette.divider,
      width: '1px',
      height: '80%',
      left: -1,
      },
      */
      },
    },
    {
      props: { grid: true },
      style: { display: 'flex', alignItems: 'center', justifyContent: 'end' },
    },
    { props: { grid: false }, style: { width: '100%', display: 'flex', alignItems: 'center' } },
  ],
}));
interface CustomLabelProps {
  children: React.ReactNode;
  icon?: React.ElementType;
  expandable?: boolean;
}

const StyledFileLabelText = styled(Typography)({
  fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
  fontWeight: 500,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  textWrap: 'nowrap',
}) as unknown as typeof Typography;

interface IconContainerProps {
  status: UseFileExplorerGridColumnHeaderStatus;
  slots?: FileIconSlots;
  slotProps?: FileIconSlotProps;
  sx: SxProps<Theme>;
}

function HeaderIcon(props: IconContainerProps) {
  const { slots, slotProps, status, sx } = props;

  const context = useFileExplorerContext<[UseFileExplorerIconsSignature]>();

  const contextIcons = {
    ...context.icons.slots,
    expandIcon: context.icons.slots.expandIcon ?? FileExplorerExpandIcon,
    collapseIcon: context.icons.slots.collapseIcon ?? FileExplorerCollapseIcon,
  };

  const contextIconProps = context.icons.slotProps;

  let iconName: 'collapseIcon' | 'expandIcon' | 'endIcon' | 'icon';
  if (status.ascending) {
    iconName = 'collapseIcon';
  } else {
    iconName = 'expandIcon';
  }

  const Icon = slots?.[iconName] ?? contextIcons[iconName as keyof typeof contextIcons];
  const iconProps = useSlotProps({
    elementType: Icon,
    externalSlotProps: (tempOwnerState: any) => ({
      ...resolveComponentProps(
        contextIconProps[iconName as keyof typeof contextIconProps],
        tempOwnerState,
      ),
      ...resolveComponentProps(slotProps?.[iconName], tempOwnerState),
    }),
    // TODO: Add proper ownerState
    ownerState: {},
  });

  if (!Icon) {
    return null;
  }

  return <Icon {...iconProps} sx={sx} />;
}

HeaderIcon.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  slotProps: PropTypes.object,
  slots: PropTypes.object,
  status: PropTypes.shape({
    ascending: PropTypes.bool.isRequired,
    focused: PropTypes.bool.isRequired,
    sort: PropTypes.bool.isRequired,
    visible: PropTypes.bool.isRequired,
  }).isRequired,
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
} as any;

type FileLabelProps = {
  expandable?: boolean;
  grow?: boolean;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  width?: number;
  meta?: boolean;
  last?: boolean;
  icon?: React.ElementType;
  selected?: boolean;
} & CustomLabelProps &
  any;

export const FileLabel = React.forwardRef(function FileExplorer(
  {
    icon: Icon,
    expandable,
    children,
    sx,
    width,
    meta,
    last,
    id,
    className,
    grow,
    header,
    cell,
    labelProps,
    iconProps,
    status,
    selected,
    columnName,
    showIcon,
    ...other
  }: FileLabelProps,
  ref: React.Ref<HTMLDivElement>,
) {
  const mx: string | undefined = meta && !last ? '4px' : undefined;
  const mr: string | undefined = meta && last ? '4px' : undefined;
  let actualLabel = (
    <StyledFileLabelText variant="body2" sx={sx}>
      {children}
    </StyledFileLabelText>
  );

  if (labelProps) {
    actualLabel = (
      <Box {...labelProps} sx={sx}>
        <StyledFileLabelText variant="body2" sx={sx}>
          {labelProps.children}
        </StyledFileLabelText>
      </Box>
    );
  }
  const headerIcon: SxProps<Theme> =
    status && !status.focused
      ? { visibility: 'visible', alignSelf: 'center', color: 'black' }
      : { alignSelf: 'center', color: 'black' };
  const sxProp: SxProps = {
    minWidth: ['label', undefined].indexOf(other.columnName) !== -1 ? undefined : '120px',
    display: header ? 'flex' : undefined,
  };
  showIcon = showIcon || header;
  if (!status && showIcon) {
    status = {};
  }
  if (!iconProps) {
    iconProps = { sx: { right: 0, position: 'absolute' } };
  }
  if (header) {
    iconProps.color = 'black';
  }
  return (
    <FileLabelRoot
      {...other}
      sx={sxProp}
      mx={mx}
      mr={mr}
      className={className}
      key={id}
      grow={grow}
      header
      last={last}
      cell={cell}
      selected={selected}
      ref={ref}
    >
      {Icon && (
        <Box
          component={Icon}
          className="labelIcon"
          color="inherit"
          sx={{ mr: 1, fontSize: '1.2rem' }}
        />
      )}

      {actualLabel}
      {showIcon && (
        <FileIconContainer {...iconProps}>
          <FileIcon status={status} sx={headerIcon} iconName={iconProps?.iconName} />
        </FileIconContainer>
      )}
    </FileLabelRoot>
  );
});

const HeaderCell = React.forwardRef(function HeaderCell(
  inProps: { columnName: string; id: string } & React.HTMLAttributes<HTMLDivElement> &
    React.HTMLProps<HTMLDivElement>,
  ref: React.Ref<HTMLDivElement>,
) {
  // const HeaderCell = (inProps: { columnName: string } & React.HTMLAttributes<HTMLDivElement> & React.HTMLProps<HTMLDivElement>) => {
  const { getColumnProps, getIconContainerProps, getLabelProps, status } =
    useFileExplorerGridColumnHeader<UseFileMinimalPlugins>({
      columnName: inProps.columnName,
      id: inProps.id,
      ref,
    });
  const columnProps = getColumnProps();
  return (
    <FileLabel
      {...columnProps}
      labelProps={getLabelProps()}
      status={status}
      iconProps={getIconContainerProps()}
      columnName={inProps.columnName}
      header
    />
  );
});

HeaderCell.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  columnName: PropTypes.string.isRequired,
};

export { HeaderCell };
