import { NgZone, Injectable } from '@angular/core';
import { DragBackend } from './drag-backend';
import { DragBackendEvent } from './drag-backend-event';
import { DragBackendEventType } from './drag-backend-event-type';
import { getEventClientOffset, getDragPreviewOffset, getSourceOffset } from './offset';
import { Unsubscribe } from './unsubscribe';
import { DragMonitor } from '../drag-monitor';
import {
  NATIVE_FILE,
  getNativeFiles,
  getNativeItemType,
  NATIVE_STRING,
  getNativeStrings
} from '../utils/native-file';

@Injectable({ providedIn: 'root' })
export class Html5DragBackend extends DragBackend {
  private sourceNodes = new Map<string, Element>();
  private dragStartSourceId: string[] | null = null;
  private activeSourceId: string | null = null;
  private dragOverTargetId: string[] | null = null;
  private dropTargetId: string[] | null = null;
  private activeTargetId: string | null = null;
  private currentSourceOffset: any = null;
  private nativeFileDragTimeout?: any;

  constructor(monitor: DragMonitor, ngZone: NgZone) {
    super(monitor, ngZone);
    this.setup(window);
  }

  // Currently unused
  teardown: Unsubscribe = () => {};

  connectDragSource(sourceId: string, node: any): Unsubscribe {
    if (!node) {
      return () => {};
    }
    const handleDragStart = () => this.handleDragStart(sourceId);
    this.ngZone.runOutsideAngular(() => {
      this.sourceNodes.set(sourceId, node);
      node.setAttribute('draggable', true);
      node.addEventListener('dragstart', handleDragStart);
    });
    return () => {
      this.sourceNodes.delete(sourceId);
      node.setAttribute('draggable', false);
      node.removeEventListener('dragstart', handleDragStart);
      if (this.activeSourceId === sourceId) {
        this.handleGlobalDragEnd({ x: 0, y: 0 } as any);
      }
    };
  }

  connectDropTarget(targetId: string, node: any): Unsubscribe {
    if (!node) {
      return () => {};
    }
    const handleDragOver = () => this.handleDragOver(targetId);
    const handleDrop = () => this.handleDrop(targetId);
    this.ngZone.runOutsideAngular(() => {
      node.addEventListener('dragover', handleDragOver);
      node.addEventListener('drop', handleDrop);
    });
    return () => {
      node.removeEventListener('dragover', handleDragOver);
      node.removeEventListener('drop', handleDrop);
    };
  }

  setup(eventTarget: any): void {
    if (!eventTarget) {
      return;
    }
    const handleDragStart = (e: DragEvent) => this.handleGlobalDragStart(e);
    const handleDragEnd = (e: DragEvent) => this.handleGlobalDragEnd(e);
    const handleDragOver = (e: DragEvent) => this.handleGlobalDragOver(e);
    const handleLeave = (e: DragEvent) => this.handleGlobalDragLeave(e);
    const handleDrop = (e: DragEvent) => this.handleGlobalDrop(e);
    this.ngZone.runOutsideAngular(() => {
      eventTarget.addEventListener('dragstart', handleDragStart);
      eventTarget.addEventListener('dragend', handleDragEnd);
      eventTarget.addEventListener('dragover', handleDragOver);
      eventTarget.addEventListener('dragleave', handleLeave);
      eventTarget.addEventListener('drop', handleDrop);
    });
    this.teardown = () => {
      this.sourceNodes.clear();
      if (!eventTarget) {
        return;
      }
      eventTarget.removeEventListener('dragstart', handleDragStart);
      eventTarget.removeEventListener('dragend', handleDragEnd);
      eventTarget.removeEventListener('dragover', handleDragOver);
      eventTarget.removeEventListener('dragleave', handleLeave);
      eventTarget.removeEventListener('drop', handleDrop);
    };
  }

  private handleGlobalDragStart(event: DragEvent): void {
    const { dragStartSourceId: sourceIds, activeSourceId } = this;
    this.dragStartSourceId = null;
    const clientOffset = getEventClientOffset(event);
    if (!sourceIds) {
      this.activeSourceId = getNativeItemType(event.dataTransfer);
      this.emitEvent({
        type: DragBackendEventType.DRAG_START,
        sourceId: this.activeSourceId,
        clientOffset
      });
      event.dataTransfer.dropEffect = 'none';
      return;
    }
    const { dataTransfer, target } = event;
    for (let i = sourceIds.length - 1; i >= 0; i--) {
      const sourceId = sourceIds[i];
      const canDrag = this.monitor.canDrag(sourceId);
      if (canDrag) {
        if (activeSourceId) {
          this.handleGlobalDragEnd(event);
        }
        this.currentSourceOffset = getSourceOffset(
          this.sourceNodes.get(sourceId) || target,
          clientOffset
        );
        this.emitEvent({
          type: DragBackendEventType.DRAG_START,
          sourceId,
          clientOffset,
          sourceOffset: this.currentSourceOffset
        });
        try {
          const previewImage = this.monitor.getPreviewImageForSourceId(sourceId);
          if (previewImage) {
            const { x: dragOffsetX, y: dragOffsetY } = getDragPreviewOffset(
              previewImage,
              clientOffset
            );
            dataTransfer.setDragImage(previewImage, dragOffsetX, dragOffsetY);
          }
          dataTransfer.setData('application/json', {} as any);
          this.activeSourceId = sourceId;
        } catch (err) {}
        return;
      }
    }
    event.preventDefault();
  }

  private handleGlobalDragEnd(event: DragEvent): void {
    const {
      activeSourceId: sourceId,
      activeTargetId: targetId,
      currentSourceOffset: sourceOffset
    } = this;
    this.activeSourceId = null;
    this.activeTargetId = null;
    this.dragStartSourceId = null;
    this.dragOverTargetId = null;
    this.dropTargetId = null;
    this.currentSourceOffset = null;
    const clientOffset = getEventClientOffset(event);
    this.emitEvent({
      type: DragBackendEventType.DRAG_END,
      clientOffset,
      sourceId
    });
    if (targetId) {
      this.emitEvent({
        type: DragBackendEventType.DRAG_OUT,
        clientOffset,
        sourceOffset,
        sourceId,
        targetId
      });
    }
  }

  private handleGlobalDragOver(event: DragEvent): void {
    if (this.nativeFileDragTimeout) {
      clearTimeout(this.nativeFileDragTimeout);
      this.nativeFileDragTimeout = undefined;
    }
    const clientOffset = getEventClientOffset(event);
    if (!this.activeSourceId) {
      return this.handleGlobalDragStart(event);
    }
    const {
      dragOverTargetId: targetIds,
      activeSourceId: sourceId,
      currentSourceOffset: sourceOffset
    } = this;
    this.dragOverTargetId = null;
    if (targetIds) {
      for (let i = targetIds.length - 1; i >= 0; i--) {
        const targetId = targetIds[i];
        const canDrop = this.monitor.canDrop(targetId, sourceId);
        if (canDrop) {
          if (this.activeTargetId && this.activeTargetId !== targetId) {
            this.emitEvent({
              type: DragBackendEventType.DRAG_OUT,
              clientOffset,
              sourceOffset,
              targetId: this.activeTargetId,
              sourceId
            });
          }
          this.activeTargetId = targetId;
          this.emitEvent({
            type: DragBackendEventType.DRAG_OVER,
            clientOffset,
            sourceOffset,
            targetId,
            sourceId
          });
          event.preventDefault();
          event.dataTransfer.dropEffect = this.monitor.getDropEffectForTargetId(targetId);
          return;
        }
      }
    }
    if (this.activeTargetId) {
      this.emitEvent({
        type: DragBackendEventType.DRAG_OUT,
        clientOffset,
        sourceOffset,
        targetId: this.activeTargetId,
        sourceId
      });
      this.activeTargetId = null;
    }
    this.emitEvent({
      type: DragBackendEventType.DRAG_OVER,
      sourceOffset,
      clientOffset,
      sourceId
    });
    event.preventDefault();
    event.dataTransfer.dropEffect = 'none';
  }

  private handleGlobalDrop(event: DragEvent): void {
    event.preventDefault();
    const {
      dropTargetId: targetIds,
      activeSourceId: sourceId,
      activeTargetId,
      currentSourceOffset: sourceOffset
    } = this;
    this.activeTargetId = null;
    this.dropTargetId = null;
    this.currentSourceOffset = null;
    if (!targetIds) {
      return;
    }
    const clientOffset = getEventClientOffset(event);
    for (let i = targetIds.length - 1; i >= 0; i--) {
      const targetId = targetIds[i];
      const canDrop = this.monitor.canDrop(targetId, sourceId);
      if (canDrop) {
        this.activeSourceId = null;
        if (sourceId === NATIVE_STRING) {
          getNativeStrings(event.dataTransfer).then(strings => {
            this.emitEvent({
              type: DragBackendEventType.DROP,
              clientOffset,
              sourceOffset,
              targetId,
              sourceId,
              strings
            });
          });
          return;
        }
        this.emitEvent({
          type: DragBackendEventType.DROP,
          clientOffset,
          sourceOffset,
          targetId,
          sourceId,
          files: sourceId === NATIVE_FILE ? getNativeFiles(event.dataTransfer) : undefined
        });
        return;
      }
    }
    if (activeTargetId) {
      this.emitEvent({
        type: DragBackendEventType.DRAG_OUT,
        clientOffset,
        sourceOffset,
        targetId: activeTargetId,
        sourceId
      });
    }
  }

  private handleGlobalDragLeave(e: DragEvent): void {
    if (this.activeSourceId === NATIVE_FILE || this.activeSourceId === NATIVE_STRING) {
      if (this.nativeFileDragTimeout) {
        clearTimeout(this.nativeFileDragTimeout);
      }
      this.nativeFileDragTimeout = setTimeout(() => this.handleGlobalDragEnd(e), 100);
    }
  }

  private handleDragStart(sourceId: string): void {
    if (!this.dragStartSourceId) {
      this.dragStartSourceId = [];
    }
    this.dragStartSourceId.unshift(sourceId);
  }

  private handleDragOver(targetId: string): void {
    if (!this.dragOverTargetId) {
      this.dragOverTargetId = [];
    }
    this.dragOverTargetId.unshift(targetId);
  }

  private handleDrop(targetId: string): void {
    if (!this.dropTargetId) {
      this.dropTargetId = [];
    }
    this.dropTargetId.unshift(targetId);
  }

  private emitEvent(event: DragBackendEvent): void {
    this.ngZone.run(() => {
      this.eventStream.next(event);
    });
  }
}

export const HTML5_DRAG_BACKEND_PROVIDER = {
  provide: DragBackend,
  useClass: Html5DragBackend
};
