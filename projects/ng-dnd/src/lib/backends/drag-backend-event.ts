import { DragBackendEventType } from './drag-backend-event-type';
import { Coordinates } from './offset';
import { DragSource } from '../drag-source.directive';
import { DropTarget } from '../drop-target.directive';

export interface DragBackendEvent {
  type: DragBackendEventType;
  sourceId?: string;
  source?: DragSource;
  targetId?: string;
  target?: DropTarget;
  item?: any;
  clientOffset: Coordinates;
  sourceOffset?: any;
}
