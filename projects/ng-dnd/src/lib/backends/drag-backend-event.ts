import { DragBackendEventType } from './drag-backend-event-type';
import { DragSource } from '../drag-source';
import { DropTarget } from '../drop-target';
import { Coordinates } from '../utils/offset';

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
