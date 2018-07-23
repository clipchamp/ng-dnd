import { InjectionToken } from '@angular/core';
import { DragBackend } from './drag-backend';
import { DragMonitor } from '../drag-monitor';

export const DRAG_BACKEND = new InjectionToken('dragBackend');

export type DragBackendFactory = (monitor: DragMonitor) => DragBackend;
