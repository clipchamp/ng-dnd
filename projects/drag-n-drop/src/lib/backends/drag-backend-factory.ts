import { InjectionToken } from '@angular/core';
import { DragBackend } from './drag-backend';
import { DragDispatcher2 } from '../drag-dispatcher.service';

export const DRAG_BACKEND = new InjectionToken('dragBackend');

export type DragBackendFactory = (dispatcher: DragDispatcher2) => DragBackend;
