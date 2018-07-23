import { DragBackend } from './drag-backend';
import { DragBackendEventType } from './drag-backend-event-type';
import { getEventClientOffset, getDragPreviewOffset, getSourceOffset } from './offset';
import { Unsubscribe } from './unsubscribe';
import { DragBackendFactory } from './drag-backend-factory';
import { DragDispatcher2 } from '../drag-dispatcher.service';

export function html5DragBackendFactory(): DragBackendFactory {
  return (dispatcher: DragDispatcher2) => new Html5DragBackend(dispatcher);
}

export class Html5DragBackend extends DragBackend {
  private dragStartSourceId: string[] | null = null;
  private activeSourceId: string | null = null;
  private dragOverTargetId: string[] | null = null;
  private dropTargetId: string[] | null = null;
  private activeTargetId: string | null = null;

  constructor(private readonly dispatcher: DragDispatcher2) {
    super();
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
    const handleDrop = (e: DragEvent) => this.handleGlobalDrop(e);
    eventTarget.addEventListener('drop', handleDrop);
    this.teardown = () => {
      if (!eventTarget) {
        return;
      }
      eventTarget.removeEventListener('dragstart', handleDragStart);
      eventTarget.removeEventListener('dragend', handleDragEnd);
      eventTarget.removeEventListener('dragover', handleDragOver);
      eventTarget.removeEventListener('drop', handleDrop);
    };
  }

  private handleGlobalDragStart(event: DragEvent): void {
    const { dragStartSourceId: sourceIds, activeSourceId } = this;
    this.dragStartSourceId = null;
    if (!sourceIds) {
      return;
    }
    const clientOffset = getEventClientOffset(event);
    const { dataTransfer, target } = event;
    for (let i = sourceIds.length - 1; i >= 0; i--) {
      const sourceId = sourceIds[i];
      const canDrag = this.dispatcher.canDrag(sourceId);
      if (canDrag) {
        if (activeSourceId) {
          this.handleGlobalDragEnd(event);
        }
        this.eventStream.next({
          type: DragBackendEventType.DRAG_START,
          sourceId,
          clientOffset,
          sourceOffset: getSourceOffset(target, clientOffset)
        });
        try {
          const previewImage = this.dispatcher.getPreviewImageForSourceId(sourceId);
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
    const { activeSourceId: sourceId, activeTargetId: targetId } = this;
    this.activeSourceId = null;
    this.activeTargetId = null;
    this.dragStartSourceId = null;
    this.dragOverTargetId = null;
    this.dropTargetId = null;
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
        sourceId,
        targetId
      });
    }
  }

  private handleGlobalDragOver(event: DragEvent): void {
    const clientOffset = getEventClientOffset(event);
    const { dragOverTargetId: targetIds, activeSourceId: sourceId } = this;
    this.dragOverTargetId = null;
    if (targetIds) {
      for (let i = targetIds.length - 1; i >= 0; i--) {
        const targetId = targetIds[i];
        const canDrop = this.dispatcher.canDrop(targetId, sourceId);
        if (canDrop) {
          if (this.activeTargetId && this.activeTargetId !== targetId) {
            this.eventStream.next({
              type: DragBackendEventType.DRAG_OUT,
              clientOffset,
              targetId: this.activeTargetId,
              sourceId
            });
          }
          this.activeTargetId = targetId;
          this.eventStream.next({
            type: DragBackendEventType.DRAG_OVER,
            clientOffset,
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
        targetId: this.activeTargetId,
        sourceId
      });
      this.activeTargetId = null;
    }
    this.eventStream.next({
      type: DragBackendEventType.DRAG_OVER,
      clientOffset,
      sourceId
    });
  }

  private handleGlobalDrop(event: DragEvent): void {
    const { dropTargetId: targetIds, activeSourceId: sourceId, activeTargetId } = this;
    this.activeTargetId = null;
    this.dropTargetId = null;
    if (!targetIds) {
      return;
    }
    const clientOffset = getEventClientOffset(event);
    for (let i = targetIds.length - 1; i >= 0; i--) {
      const targetId = targetIds[i];
      const canDrop = this.dispatcher.canDrop(targetId, sourceId);
      if (canDrop) {
        this.activeSourceId = null;
        this.eventStream.next({
          type: DragBackendEventType.DROP,
          clientOffset,
          targetId,
          sourceId
        });
        event.preventDefault();
        return;
      }
    }
    if (activeTargetId) {
      this.eventStream.next({
        type: DragBackendEventType.DRAG_OUT,
        clientOffset,
        targetId: activeTargetId,
        sourceId
      });
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
