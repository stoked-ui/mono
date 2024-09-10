import * as React from 'react';
import {useFileExplorerContext} from '../../internals/FileExplorerProvider/useFileExplorerContext';
import type {
  UseFileExplorerSelectionSignature
} from '../../internals/plugins/useFileExplorerSelection';
import type {
  UseFileExplorerExpansionSignature
} from '../../internals/plugins/useFileExplorerExpansion';
import type {
  UseFileExplorerFilesSignature
} from '../../internals/plugins/useFileExplorerFiles/useFileExplorerFiles.types';
import type {
  UseFileExplorerGridSignature
} from '../../internals/plugins/useFileExplorerGrid/useFileExplorerGrid.types';
import type {
  UseFileExplorerFocusSignature
} from '../../internals/plugins/useFileExplorerFocus/useFileExplorerFocus.types';
import type {UseFileStatus} from '../../internals/models/UseFileStatus';
import type {
  UseFileExplorerDndSignature
} from '../../internals/plugins/useFileExplorerDnd/useFileExplorerDnd.types';

interface UseFileInteractions {
  handleExpansion: (event: React.MouseEvent) => void;
  handleSelection: (event: React.MouseEvent) => void;
  handleCheckboxSelection: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface UseFileUtilsReturnValue {
  interactions: UseFileInteractions;
  status: UseFileStatus;
}

/**
 * Plugins that need to be present in the FileExplorer View in order for `useFileUtils` to work
 * correctly.
 */
type UseFileUtilsMinimalPlugins = readonly [
  UseFileExplorerSelectionSignature,
  UseFileExplorerExpansionSignature,
  UseFileExplorerFilesSignature,
  UseFileExplorerDndSignature,
  UseFileExplorerFocusSignature,
  UseFileExplorerGridSignature
];

/**
 * Plugins that `useFileUtils` can use if they are present, but are not required.
 */
export type UseFileUtilsOptionalPlugins = readonly [];

export const useFileUtils = ({
  itemId,
  children,
  status,
}: {
  itemId: string;
  children: React.ReactNode;
  status: UseFileStatus | null
}): UseFileUtilsReturnValue => {
  const {
    instance,
    selection: { multiSelect }
  } = useFileExplorerContext<UseFileUtilsMinimalPlugins, UseFileUtilsOptionalPlugins>();

  status = status === null ? instance.getItemStatus(itemId, children) : status;

  const handleExpansion = (event: React.MouseEvent) => {
    if (status.disabled) {
      return;
    }

    if (!status.focused) {
      instance.focusItem(event, itemId);
    }

    const multiple = multiSelect && (event.shiftKey || event.ctrlKey || event.metaKey);

    // If already expanded and trying to toggle selection don't close
    if (status.expandable && !(multiple && instance.isItemExpanded(itemId))) {
      instance.toggleItemExpansion(event, itemId);
    }
  };

  const handleSelection = (event: React.MouseEvent) => {
    if (status.disabled) {
      return;
    }

    if (!status.focused) {
      instance.focusItem(event, itemId);
    }

    const multiple = multiSelect && (event.shiftKey || event.ctrlKey || event.metaKey);

    if (multiple) {
      if (event.shiftKey) {
        instance.expandSelectionRange(event, itemId);
      } else {
        instance.selectItem(event, itemId, true);
      }
    } else {
      instance.selectItem(event, itemId, false);
    }
  };

  const handleCheckboxSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const hasShift = (event.nativeEvent as PointerEvent).shiftKey;
    if (multiSelect && hasShift) {
      instance.expandSelectionRange(event, itemId);
    } else {
      instance.selectItem(event, itemId, multiSelect, event.target.checked);
    }
  };

  const interactions: UseFileInteractions = {
    handleExpansion,
    handleSelection,
    handleCheckboxSelection,
  };

  return { interactions, status };
};
