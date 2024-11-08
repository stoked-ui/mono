import * as React from 'react';
import useEventCallback from '@mui/utils/useEventCallback';
import {FileExplorerPlugin} from '../../models/plugin';
import {UseFileExplorerExpansionSignature} from './useFileExplorerExpansion.types';
import {FileId} from '../../../models';

export const useFileExplorerExpansion: FileExplorerPlugin<UseFileExplorerExpansionSignature> = ({
  instance,
  params,
  models,
}) => {
  const expandedItemsMap = React.useMemo(() => {
    const temp = new Map<FileId, boolean>();
    models.expandedItems.value.forEach((id) => {
      temp.set(id, true);
    });

    return temp;
  }, [models.expandedItems.value]);

  const setExpandedItems = (event: React.SyntheticEvent, value: FileId[]) => {
    params.onExpandedItemsChange?.(event, value);
    models.expandedItems.setControlledValue(value);
  };

  const isItemExpanded = React.useCallback(
    (itemId: string) => expandedItemsMap.has(itemId),
    [expandedItemsMap],
  );

  const isItemExpandable = React.useCallback(
    (itemId: string) => !!instance.getItemMeta(itemId)?.expandable,
    [instance],
  );

  const toggleItemExpansion = useEventCallback(
    (event: React.SyntheticEvent, itemId: FileId) => {
      const isExpandedBefore = instance.isItemExpanded(itemId);
      instance.setItemExpansion(event, itemId, !isExpandedBefore);
    },
  );

  const setItemExpansion = useEventCallback(
    (event: React.SyntheticEvent, itemId: FileId, isExpanded: boolean) => {
      const isExpandedBefore = instance.isItemExpanded(itemId);
      if (isExpandedBefore === isExpanded) {
        return;
      }

      let newExpanded: string[];
      if (isExpanded) {
        newExpanded = [itemId].concat(models.expandedItems.value);
      } else {
        newExpanded = models.expandedItems.value.filter((id) => id !== itemId);
      }

      if (params.onItemExpansionToggle) {
        params.onItemExpansionToggle(event, itemId, isExpanded);
      }

      setExpandedItems(event, newExpanded);
    },
  );

  const expandAllSiblings = (event: React.KeyboardEvent, itemId: FileId) => {
    const itemMeta = instance.getItemMeta(itemId);
    const siblings = instance.getItemOrderedChildrenIds(itemMeta.parentId);

    const diff = siblings.filter(
      (child) => instance.isItemExpandable(child) && !instance.isItemExpanded(child),
    );

    const newExpanded = models.expandedItems.value.concat(diff);

    if (diff.length > 0) {
      if (params.onItemExpansionToggle) {
        diff.forEach((newlyExpandedItemId) => {
          params.onItemExpansionToggle!(event, newlyExpandedItemId, true);
        });
      }

      setExpandedItems(event, newExpanded);
    }
  };

  const expansionTrigger = React.useMemo(() => {
    if (params.expansionTrigger) {
      return params.expansionTrigger;
    }

    return 'content';
  }, [params.expansionTrigger]);

  return {
    publicAPI: {
      setItemExpansion,
    },
    instance: {
      isItemExpanded,
      isItemExpandable,
      setItemExpansion,
      toggleItemExpansion,
      expandAllSiblings,
    },
    contextValue: {
      expansion: {
        expansionTrigger,
      },
    },
  };
};
useFileExplorerExpansion.models = {
  expandedItems: {
    getDefaultValue: (params) => params.defaultExpandedItems,
  },
};

const DEFAULT_EXPANDED_ITEMS: string[] = [];

useFileExplorerExpansion.getDefaultizedParams = (params) => ({
  ...params,
  defaultExpandedItems: params.defaultExpandedItems ?? DEFAULT_EXPANDED_ITEMS,
});

useFileExplorerExpansion.params = {
  expandedItems: true,
  defaultExpandedItems: true,
  onExpandedItemsChange: true,
  onItemExpansionToggle: true,
  expansionTrigger: true,
};
