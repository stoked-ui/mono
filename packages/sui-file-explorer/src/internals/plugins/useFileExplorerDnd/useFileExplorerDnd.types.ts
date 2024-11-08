import type {BaseEventPayload, DragLocation} from "@atlaskit/pragmatic-drag-and-drop/types";
import type {Instruction} from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";
import { IMediaFile } from "@stoked-ui/media-selector";
import {DndState} from '../../models/fileExplorerView';
import {FileExplorerPluginSignature} from "../../models/plugin.types";
import {FileExplorerDndContextValue} from "./FileExplorerDndContext";
import type {
  UseFileExplorerFilesSignature
} from "../useFileExplorerFiles/useFileExplorerFiles.types";


export type DndItemState = {
  dndState: DndState,
  dndContainer: HTMLElement | null,
  dndInstruction: any | null
}

export type ElementDragPayload = {
  element: HTMLElement ,
  dragHandle: Element | null,
  data: Record<string, unknown>
}

export type ElementDragType = {
  type: 'element';
  startedFrom: 'internal';
  payload: ElementDragPayload;
}

export type DropInternalData = {
  dropped: {
    item: IMediaFile;
    dnd: ElementDragPayload;
  },
  target: {
    item: IMediaFile;
    dnd: DragLocation;
  },
  instruction: Instruction;
}

export type DndTrashMode = 'remove' | 'collect-remove-restore' | 'collect-restore' | 'collect';

export interface UseFileListItemsInstance {
  dndConfig: () => {
    dndInternal?: true;
    dndExternal?: true;
    dndFileTypes?: string[];
    dndTrash?: true;
  } | undefined;
  dndEnabled: () => boolean;
  dndInternalEnabled: () => boolean;
  dndExternalEnabled: () => boolean;
  dndExternalFileTypes: () =>  string[];
  dndTrash: () => true | undefined;
  getDndContext: FileExplorerDndContextValue<IMediaFile>
  dropInternal: (event: BaseEventPayload<ElementDragType>) => void;
  createChildren: (files: IMediaFile[], targetId: string | null) => void;
  createChild: (item: IMediaFile, targetId: string | null) => void;
  removeItem: (itemId: string) => void;
}

export interface UseFileExplorerDndParameters {
  dndInternal?: true;
  dndExternal?: true;
  dndFileTypes?: string[];
  dndTrash?: true;
  onAddFiles?: (files: IMediaFile[]) => void;
}

export type UseFileExplorerDndDefaultizedParameters = UseFileExplorerDndParameters;

interface UseFileExplorerDndContextValue {
  dnd: {
    dndInternal?: true;
    dndExternal?: true;
    dndFileTypes?: string[];
    dndTrash?: true;
  } | undefined;
}

export type UseFileExplorerDndSignature = FileExplorerPluginSignature<{
  params: UseFileExplorerDndParameters;
  defaultizedParams: UseFileExplorerDndDefaultizedParameters;
  instance: UseFileListItemsInstance;
  dependencies: [UseFileExplorerFilesSignature];
  contextValue: UseFileExplorerDndContextValue;
}>;
