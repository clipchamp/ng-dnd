import { DragBackendEventType } from './drag-backend-event-type';
import { Coordinates } from './offset';
import { DragSource } from '../drag-source.directive';

export interface DragBackendEvent {
  type: DragBackendEventType;
  sourceId?: string;
  source?: DragSource;
  targetId?: string;
  item?: any;
  clientOffset: Coordinates;
}
