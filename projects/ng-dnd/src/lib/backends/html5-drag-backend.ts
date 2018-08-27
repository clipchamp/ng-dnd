import { DragBackend } from './drag-backend';
import { DragBackendEventType } from './drag-backend-event-type';
import { getEventClientOffset, getDragPreviewOffset, getSourceOffset } from './offset';
import { Unsubscribe } from './unsubscribe';
import { DragBackendFactory } from './drag-backend-factory';
import { DragMonitor } from '../drag-monitor';
import { NATIVE_FILE, getDroppedFiles } from '../utils/native-file';

export class Html5DragBackend extends DragBackend {
  private dragStartSourceId: string[] | null = null;
  private activeSourceId: string | null = null;
  private dragOverTargetId: string[] | null = null;
  private dropTargetId: string[] | null = null;
  private activeTargetId: string | null = null;
  private currentSourceOffset: any = null;
  private nativeFileDragTimeout?: any;

  constructor(monitor: DragMonitor) {
    super(monitor);
    this.setup(window);
  }

  // Currently unused
  teardown: Unsubscribe = () => {};

  connectDragSource(sourceId: string, node: any): Unsubscribe {
    if (!node) {
      return () => {};
    }
    node.setAttribute('draggable', true);
    const handleDragStart = () => this.handleDragStart(sourceId);
    node.addEventListener('dragstart', handleDragStart);
    const doNothing = () => {};
    node.addEventListener('dragover', doNothing);
    node.addEventListener('drop', doNothing);
    return () => {
      node.setAttribute('draggable', false);
      node.removeEventListener('dragstart', handleDragStart);
      node.removeEventListener('dragover', doNothing);
      node.removeEventListener('drop', doNothing);
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
    node.addEventListener('dragover', handleDragOver);
    node.addEventListener('drop', handleDrop);
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
    eventTarget.addEventListener('dragstart', handleDragStart);
    const handleDragEnd = (e: DragEvent) => this.handleGlobalDragEnd(e);
    eventTarget.addEventListener('dragend', handleDragEnd);
    const handleDragOver = (e: DragEvent) => this.handleGlobalDragOver(e);
    eventTarget.addEventListener('dragover', handleDragOver);
    const handleLeave = (e: DragEvent) => this.handleGlobalDragLeave(e);
    eventTarget.addEventListener('dragleave', handleLeave);
    const handleDrop = (e: DragEvent) => this.handleGlobalDrop(e);
    eventTarget.addEventListener('drop', handleDrop);
    this.teardown = () => {
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
      this.activeSourceId = NATIVE_FILE;
      this.eventStream.next({
        type: DragBackendEventType.DRAG_START,
        sourceId: NATIVE_FILE,
        clientOffset
      });
      event.preventDefault();
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
        this.currentSourceOffset = getSourceOffset(target, clientOffset);
        this.eventStream.next({
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
    this.eventStream.next({
      type: DragBackendEventType.DRAG_END,
      clientOffset,
      sourceId
    });
    if (targetId) {
      this.eventStream.next({
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
            this.eventStream.next({
              type: DragBackendEventType.DRAG_OUT,
              clientOffset,
              sourceOffset,
              targetId: this.activeTargetId,
              sourceId
            });
          }
          this.activeTargetId = targetId;
          event.dataTransfer.dropEffect = this.monitor.getDropEffectForTargetId(targetId);
          this.eventStream.next({
            type: DragBackendEventType.DRAG_OVER,
            clientOffset,
            sourceOffset,
            targetId,
            sourceId
          });
          event.preventDefault();
          return;
        }
      }
    }
    if (this.activeTargetId) {
      this.eventStream.next({
        type: DragBackendEventType.DRAG_OUT,
        clientOffset,
        sourceOffset,
        targetId: this.activeTargetId,
        sourceId
      });
      this.activeTargetId = null;
    }
    this.eventStream.next({
      type: DragBackendEventType.DRAG_OVER,
      sourceOffset,
      clientOffset,
      sourceId
    });
  }

  private handleGlobalDrop(event: DragEvent): void {
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
        this.eventStream.next({
          type: DragBackendEventType.DROP,
          clientOffset,
          sourceOffset,
          targetId,
          sourceId,
          files: sourceId === NATIVE_FILE ? getDroppedFiles(event.dataTransfer) : undefined
        });
        event.preventDefault();
        return;
      }
    }
    if (activeTargetId) {
      this.eventStream.next({
        type: DragBackendEventType.DRAG_OUT,
        clientOffset,
        sourceOffset,
        targetId: activeTargetId,
        sourceId
      });
    }
  }

  private handleGlobalDragLeave(e: DragEvent): void {
    if (this.activeSourceId === NATIVE_FILE) {
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
}

export function html5DragBackendFactory(): DragBackendFactory {
  return (monitor: DragMonitor) => new Html5DragBackend(monitor);
}
