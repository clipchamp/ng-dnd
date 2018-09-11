import { DragBackendEventType } from './drag-backend-event-type';
import { Coordinates } from './offset';
import { DragSource } from '../drag-source';
import { DropTarget } from '../drop-target';

export interface DragBackendEvent<T = any> {
  type: DragBackendEventType;
  sourceId?: string;
  source?: DragSource;
  targetId?: string;
  target?: DropTarget;
  item?: T | File[] | string[];
  itemType?: string;
  clientOffset: Coordinates;
  sourceOffset?: Coordinates & { width: number; height: number };
  files?: File[];
  strings?: string[];
}
