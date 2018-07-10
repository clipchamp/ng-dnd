import { DragBackendEventType } from './drag-backend-event-type';
import { Position } from './offset';

export interface DragBackendEvent {
  type: DragBackendEventType;
  sourceId?: string;
  targetId?: string;
  item?: any;
  clientOffset: Position;
}
