import * as React from 'react';
import PropTypes from 'prop-types';
import {useFileExplorerContext} from './useFileExplorerContext';
import {escapeOperandAttributeSelector} from '../utils/utils';
import type {
  UseFileExplorerJSXItemsSignature
} from '../plugins/useFileExplorerJSXItems/useFileExplorerJSXItems.types';
import type {
  UseFileExplorerFilesSignature
} from '../plugins/useFileExplorerFiles/useFileExplorerFiles.types';
import {UseFileExplorerDndSignature} from '../plugins/useFileExplorerDnd/useFileExplorerDnd.types';

export const FileExplorerChildrenItemContext =
  React.createContext<FileExplorerChildrenItemContextValue | null>(null);

if (process.env.NODE_ENV !== 'production') {
  FileExplorerChildrenItemContext.displayName = 'FileExplorerChildrenItemContext';
}

interface FileExplorerChildrenItemProviderProps {
  id?: string;
  children: React.ReactNode;
}

export function FileExplorerChildrenItemProvider(props: FileExplorerChildrenItemProviderProps) {
  const { children, id = null } = props;

  const { instance, rootRef } =
    useFileExplorerContext<[UseFileExplorerJSXItemsSignature, UseFileExplorerFilesSignature, UseFileExplorerDndSignature]>();
  const childrenIdAttrToIdRef = React.useRef<Map<string, string>>(new Map());

  React.useEffect(() => {
    if (!rootRef.current) {
      return;
    }

    let idAttr: string | null = null;
    if (id == null) {
      idAttr = rootRef.current.id;
    } else {
      // Undefined during 1st render
      const itemMeta = instance.getItemMeta(id);
      if (itemMeta !== undefined) {
        idAttr = instance.getFileIdAttribute(id);
      }
    }

    if (idAttr == null) {
      return;
    }

    const previousChildrenIds = instance.getItemOrderedChildrenIds(id ?? null) ?? [];
    const escapedIdAttr = escapeOperandAttributeSelector(idAttr);
    const childrenElements = rootRef.current.querySelectorAll(
      `${id == null ? '' : `*[id="${escapedIdAttr}"] `}[role="fileexploreritem"]:not(*[id="${escapedIdAttr}"] [role="fileexploreritem"] [role="fileexploreritem"])`,
    );
    const childrenIds = Array.from(childrenElements).map(
      (child) => childrenIdAttrToIdRef.current.get(child.id)!,
    );

    const hasChanged =
      childrenIds.length !== previousChildrenIds.length ||
      childrenIds.some((childId, index) => childId !== previousChildrenIds[index]);
    if (hasChanged) {
      instance.setJSXItemsOrderedChildrenIds(id ?? null, childrenIds);
    }
  });

  const value = React.useMemo<FileExplorerChildrenItemContextValue>(
    () => ({
      registerChild: (childIdAttribute, childItemId) =>
        childrenIdAttrToIdRef.current.set(childIdAttribute, childItemId),
      unregisterChild: (childIdAttribute) => childrenIdAttrToIdRef.current.delete(childIdAttribute),
      parentId: id,
    }),
    [id],
  );

  return (
    <FileExplorerChildrenItemContext.Provider value={value}>
      {children}
    </FileExplorerChildrenItemContext.Provider>
  );
}

FileExplorerChildrenItemProvider.propTypes = {
  children: PropTypes.node,
  id: PropTypes.string,
} as any;

interface FileExplorerChildrenItemContextValue {
  registerChild: (idAttribute: string, id: string) => void;
  unregisterChild: (idAttribute: string) => void;
  parentId: string | null;
}
