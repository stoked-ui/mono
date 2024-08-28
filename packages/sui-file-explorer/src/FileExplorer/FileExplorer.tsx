import * as React from 'react';
import PropTypes from 'prop-types';
import composeClasses from '@mui/utils/composeClasses';
import { useSlotProps } from '@mui/base/utils';
import { shouldForwardProp } from '@mui/system/createStyled';
import { getFileExplorerUtilityClass } from './fileExplorerClasses';
import { FileExplorerProps } from './FileExplorer.types';
import { createUseThemeProps, styled } from '../internals/zero-styled';
import { useFileExplorer } from '../internals/useFileExplorer/useFileExplorer';
import { FileExplorerProvider } from '../internals/FileExplorerProvider';
import { FILE_EXPLORER_PLUGINS, FileExplorerPluginSignatures } from './FileExplorer.plugins';
import { buildWarning } from '../internals/utils/warning';
import { FileExplorerGridHeaders } from '../internals/plugins/useFileExplorerGrid/FileExplorerGridHeaders';
import { FileWrapped } from './FileWrapped';
import { FileExplorerDndContext } from '../internals/plugins/useFileExplorerDnd/FileExplorerDndContext';
import { FileBase } from '../models';
import { FileDropzone } from '../FileDropzone';

const useThemeProps = createUseThemeProps('MuiFileExplorer');

const useUtilityClasses = <R extends FileBase, Multiple extends boolean | undefined>(
  ownerState: FileExplorerProps<R, Multiple>,
) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
  };

  return composeClasses(slots, getFileExplorerUtilityClass, classes);
};

export const FileExplorerRoot = styled('ul', {
  name: 'MuiFileExplorer',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
  shouldForwardProp: (prop) =>
    shouldForwardProp(prop) &&
    prop !== 'grow' &&
    prop !== 'cell' &&
    prop !== 'last' &&
    prop !== 'header' &&
    prop !== 'first',
})<{ grow?: boolean; header?: boolean; cell?: boolean; last?: boolean }>(({ theme }) => ({
  padding: 0,
  margin: 0,
  listStyle: 'none',
  outline: 0,
  position: 'relative',
  '& .header, .cell': {
    minWidth: '100px',
  },
  '& .header:after': {
    content: '""',
    position: 'absolute',
    width: '1px',
    height: '80%',
    backgroundColor: theme.palette.divider,
    alignSelf: 'center',
    right: 0,
  },
  '& .header:last-child:after': {
    /* ADDED */ display: 'none',
  },
}));

type FileExplorerComponent = (<
  R extends FileBase,
  Multiple extends boolean | undefined = undefined,
>(
  props: FileExplorerProps<R, Multiple> & React.RefAttributes<HTMLUListElement>,
) => React.JSX.Element) & { propTypes?: any };

const childrenWarning = buildWarning([
  'SUI X: The `FileExplorer` component does not support JSX children.',
  'If you want to add items, you need to use the `items` prop',
  'Check the documentation for more details: https://stoked-ui.github.io/x/react-fileExplorer-view/rich-fileExplorer-view/items/',
]);

/**
 *
 * Demos:
 *
 * - [FileExplorer View](https://stoked-ui.github.io/file-explorer/docs/)
 *
 * API:
 *
 * - [FileExplorer API](https://stoked-ui.github.io/file-explorer/api/)
 */
const FileExplorer = React.forwardRef(function FileExplorer<
  R extends FileBase = FileBase,
  Multiple extends boolean | undefined = undefined,
>(inProps: FileExplorerProps<R, Multiple>, ref: React.Ref<HTMLUListElement>) {
  const props = useThemeProps({ props: inProps, name: 'MuiFileExplorer' });
  if (process.env.NODE_ENV !== 'production') {
    if ((props as any).children != null) {
      childrenWarning();
    }
  }

  const richProps: FileExplorerProps<R, Multiple> & { id?: string } = { ...props, id: props.id };
  const { getRootProps, contextValue, instance } = useFileExplorer<
    FileExplorerPluginSignatures,
    typeof richProps
  >({
    plugins: FILE_EXPLORER_PLUGINS,
    rootRef: ref,
    props: richProps,
  });

  const { slots, slotProps } = props;
  const classes = useUtilityClasses(props);

  const Root = slots?.root ?? FileExplorerRoot;
  const rootProps = useSlotProps({
    elementType: Root,
    externalSlotProps: slotProps?.root,
    className: classes.root,
    getSlotProps: getRootProps,
    ownerState: props as FileExplorerProps<any, any>,
  });

  const itemsToRender = instance.getItemsToRender();

  const renderItem = (item: ReturnType<typeof instance.getItemsToRender>[number]) => {
    const currItem = instance.getItem(item.itemId);

    return (
      <FileWrapped {...currItem} {...item} slots={slots} key={item.itemId} sx={props.sx}>
        {item.children?.map(renderItem)}
      </FileWrapped>
    );
  };
  const getContent = () => {
    if (!props.items?.length) {
      return <FileDropzone />;
    }
    if (!props.grid) {
      return (
        <Root {...rootProps} sx={props.sx}>
          {itemsToRender.map(renderItem)}
        </Root>
      );
    }
    return (
      <Root {...rootProps} sx={props.sx}>
        <FileExplorerGridHeaders id={'file-explorer-headers'} />
        <div>{itemsToRender.map(renderItem)}</div>
      </Root>
    );
  };
  return (
    <FileExplorerProvider value={contextValue}>
      <FileExplorerDndContext.Provider value={instance.getDndContext}>
        {getContent()}
      </FileExplorerDndContext.Provider>
    </FileExplorerProvider>
  );
}) as FileExplorerComponent;

FileExplorer.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  alternatingRows: PropTypes.oneOfType([
    PropTypes.oneOf([true]),
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  /**
   * The ref object that allows FileExplorer View manipulation. Can be instantiated with `useFileExplorerApiRef()`.
   */
  apiRef: PropTypes.shape({
    current: PropTypes.shape({
      focusItem: PropTypes.func.isRequired,
      getItem: PropTypes.func.isRequired,
      getItemDOMElement: PropTypes.func.isRequired,
      gridEnabled: PropTypes.func.isRequired,
      selectItem: PropTypes.func.isRequired,
      setColumns: PropTypes.func.isRequired,
      setItemExpansion: PropTypes.func.isRequired,
      setVisibleOrder: PropTypes.func.isRequired,
    }),
  }),
  /**
   * If `true`, the fileExplorer view renders a checkbox at the left of its label that allows selecting it.
   * @default false
   */
  checkboxSelection: PropTypes.bool,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  className: PropTypes.string,
  columns: PropTypes.object,
  /**
   * Expanded item ids.
   * Used when the item's expansion is not controlled.
   * @default []
   */
  defaultExpandedItems: PropTypes.arrayOf(PropTypes.string),
  defaultGridColumns: PropTypes.object,
  defaultGridHeaders: PropTypes.object,
  /**
   * Selected item ids. (Uncontrolled)
   * When `multiSelect` is true this takes an array of strings; when false (default) a string.
   * @default []
   */
  defaultSelectedItems: PropTypes.any,
  /**
   * If `true`, will allow focus on disabled items.
   * @default false
   */
  disabledItemsFocusable: PropTypes.bool,
  /**
   * If `true` selection is disabled.
   * @default false
   */
  disableSelection: PropTypes.bool,
  dndExternal: PropTypes.oneOf([true]),
  dndFileTypes: PropTypes.arrayOf(PropTypes.string),
  dndInternal: PropTypes.oneOf([true]),
  dndTrash: PropTypes.oneOf([true]),
  /**
   * Expanded item ids.
   * Used when the item's expansion is controlled.
   */
  expandedItems: PropTypes.arrayOf(PropTypes.string),
  /**
   * The slot that triggers the item's expansion when clicked.
   * @default 'content'
   */
  expansionTrigger: PropTypes.oneOf(['content', 'iconContainer']),
  /**
   * Unstable features, breaking changes might be introduced.
   * For each feature, if the flag is not explicitly set to `true`,
   * the feature will be fully disabled and any property / method call will not have any effect.
   */
  experimentalFeatures: PropTypes.shape({
    indentationAtItemLevel: PropTypes.bool,
  }),
  /**
   * Used to determine the id of a given item.
   *
   * @template R
   * @param {R} item The item to check.
   * @returns {string} The id of the item.
   * @default (item) => item.id
   */
  getItemId: PropTypes.func,
  /**
   * Used to determine the string label for a given item.
   *
   * @template R
   * @param {R} item The item to check.
   * @returns {string} The label of the item.
   * @default (item) => item.label
   */
  getItemLabel: PropTypes.func,
  grid: PropTypes.bool,
  gridHeader: PropTypes.bool,
  headers: PropTypes.object,
  /**
   * This prop is used to help implement the accessibility logic.
   * If you don't provide this prop. It falls back to a randomly generated id.
   */
  id: PropTypes.string,
  initializedIndexes: PropTypes.bool,
  /**
   * Used to determine if a given item should be disabled.
   * @template R
   * @param {R} item The item to check.
   * @returns {boolean} `true` if the item should be disabled.
   */
  isItemDisabled: PropTypes.func,
  /**
   * Horizontal indentation between an item and its children.
   * Examples: 24, "24px", "2rem", "2em".
   * @default 12px
   */
  itemChildrenIndentation: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  items: PropTypes.arrayOf(
    PropTypes.shape({
      children: PropTypes.arrayOf(
        PropTypes.shape({
          children: PropTypes.arrayOf(PropTypes.object),
          expanded: PropTypes.bool,
          file: PropTypes.shape({
            arrayBuffer: PropTypes.func.isRequired,
            lastModified: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            path: PropTypes.string,
            size: PropTypes.number.isRequired,
            slice: PropTypes.func.isRequired,
            stream: PropTypes.func.isRequired,
            text: PropTypes.func.isRequired,
            type: PropTypes.string.isRequired,
            webkitRelativePath: PropTypes.string.isRequired,
          }),
          id: PropTypes.string,
          itemId: PropTypes.string,
          label: PropTypes.string,
          modified: PropTypes.number,
          name: PropTypes.string,
          selected: PropTypes.bool,
          size: PropTypes.number,
          type: PropTypes.oneOf(['doc', 'file', 'folder', 'image', 'pdf', 'trash', 'video']),
          visibleIndex: PropTypes.number,
        }),
      ),
      expanded: PropTypes.bool,
      file: PropTypes.shape({
        arrayBuffer: PropTypes.func.isRequired,
        lastModified: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        path: PropTypes.string,
        size: PropTypes.number.isRequired,
        slice: PropTypes.func.isRequired,
        stream: PropTypes.func.isRequired,
        text: PropTypes.func.isRequired,
        type: PropTypes.string.isRequired,
        webkitRelativePath: PropTypes.string.isRequired,
      }),
      id: PropTypes.string,
      itemId: PropTypes.string,
      label: PropTypes.string,
      modified: PropTypes.number,
      name: PropTypes.string,
      selected: PropTypes.bool,
      size: PropTypes.number,
      type: PropTypes.oneOf(['doc', 'file', 'folder', 'image', 'pdf', 'trash', 'video']),
      visibleIndex: PropTypes.number,
    }),
  ).isRequired,
  /**
   * If `true`, `ctrl` and `shift` will trigger multiselect.
   * @default false
   */
  multiSelect: PropTypes.bool,
  /**
   * Callback fired when fileExplorer items are expanded/collapsed.
   * @param {React.SyntheticEvent} event The event source of the callback.
   * @param {array} itemIds The ids of the expanded items.
   */
  onExpandedItemsChange: PropTypes.func,
  /**
   * Callback fired when a fileExplorer item is expanded or collapsed.
   * @param {React.SyntheticEvent} event The event source of the callback.
   * @param {array} itemId The itemId of the modified item.
   * @param {array} isExpanded `true` if the item has just been expanded, `false` if it has just been collapsed.
   */
  onItemExpansionToggle: PropTypes.func,
  /**
   * Callback fired when fileExplorer items are focused.
   * @param {React.SyntheticEvent} event The event source of the callback **Warning**: This is a generic event not a focus event.
   * @param {string} itemId The id of the focused item.
   * @param {string} value of the focused item.
   */
  onItemFocus: PropTypes.func,
  /**
   * Callback fired when a fileExplorer item is selected or deselected.
   * @param {React.SyntheticEvent} event The event source of the callback.
   * @param {array} itemId The itemId of the modified item.
   * @param {array} isSelected `true` if the item has just been selected, `false` if it has just been deselected.
   */
  onItemSelectionToggle: PropTypes.func,
  /**
   * Callback fired when fileExplorer items are selected/deselected.
   * @param {React.SyntheticEvent} event The event source of the callback
   * @param {string[] | string} itemIds The ids of the selected items.
   * When `multiSelect` is `true`, this is an array of strings; when false (default) a string.
   */
  onSelectedItemsChange: PropTypes.func,
  /**
   * Selected item ids. (Controlled)
   * When `multiSelect` is true this takes an array of strings; when false (default) a string.
   */
  selectedItems: PropTypes.any,
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps: PropTypes.object,
  /**
   * Overridable component slots.
   * @default {}
   */
  slots: PropTypes.object,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

export { FileExplorer };
