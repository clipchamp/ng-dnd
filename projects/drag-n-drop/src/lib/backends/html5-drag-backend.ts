import { DragBackend } from './drag-backend';
import { DragBackendEventType } from './drag-backend-event-type';
import { getEventClientOffset, getDragPreviewOffset } from './offset';
import { Unsubscribe } from './unsubscribe';
import { DragBackendFactory } from './drag-backend-factory';
import { DragDispatcher2 } from '../drag-dispatcher.service';

export function html5DragBackendFactory(): DragBackendFactory {
  return (dispatcher: DragDispatcher2) => new Html5DragBackend(dispatcher);
}

export class Html5DragBackend extends DragBackend {
  private dragStartSourceId: string[] | null = null;
  private activeSourceId: string | null = null;
  private dragEnterTargetId: string[] | null = null;
  private dragOverTargetId: string[] | null = null;
  private dragLeaveTargetId: string[] | null = null;
  private dropTargetId: string[] | null = null;

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
    const handleDrag = (e: DragEvent) => this.handleDrag(e, sourceId);
    node.addEventListener('drag', handleDrag);
    return () => {
      node.setAttribute('draggable', false);
      node.removeEventListener('dragstart', handleDragStart);
      node.removeEventListener('drag', handleDrag);
      // TODO: handle active drag source case
    };
  }

  connectDropTarget(targetId: string, node: any): Unsubscribe {
    if (!node) {
      return () => {};
    }
    const handleDragEnter = () => this.handleDragEnter(targetId);
    const handleDragOver = () => this.handleDragOver(targetId);
    const handleDragLeave = () => this.handleDragLeave(targetId);
    const handleDrop = () => this.handleDrop(targetId);
    node.addEventListener('dragenter', handleDragEnter);
    node.addEventListener('dragover', handleDragOver);
    node.addEventListener('dragleave', handleDragLeave);
    node.addEventListener('drop', handleDrop);
    return () => {
      node.removeEventListener('dragenter', handleDragEnter);
      node.removeEventListener('dragover', handleDragOver);
      node.removeEventListener('dragleave', handleDragLeave);
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
    const handleDragEnter = (e: DragEvent) => this.handleGlobalDragEnter(e);
    eventTarget.addEventListener('dragenter', handleDragEnter);
    const handleDragOver = (e: DragEvent) => this.handleGlobalDragOver(e);
    eventTarget.addEventListener('dragover', handleDragOver);
    const handleDragLeave = (e: DragEvent) => this.handleGlobalDragLeave(e);
    eventTarget.addEventListener('dragleave', handleDragLeave);
    const handleDrop = (e: DragEvent) => this.handleGlobalDrop(e);
    eventTarget.addEventListener('drop', handleDrop);
    this.teardown = () => {
      if (!eventTarget) {
        return;
      }
      eventTarget.removeEventListener('dragstart', handleDragStart);
      eventTarget.removeEventListener('dragend', handleDragEnd);
      eventTarget.removeEventListener('dragenter', handleDragEnter);
      eventTarget.removeEventListener('dragover', handleDragOver);
      eventTarget.removeEventListener('dragleave', handleDragLeave);
      eventTarget.removeEventListener('drop', handleDrop);
    };
  }

  private handleGlobalDragStart(event: DragEvent): void {
    const { dragStartSourceId: sourceIds } = this;
    this.dragStartSourceId = null;
    if (!sourceIds) {
      return;
    }
    const clientOffset = getEventClientOffset(event);
    const { dataTransfer } = event;
    for (let i = sourceIds.length - 1; i >= 0; i--) {
      const sourceId = sourceIds[i];
      const canDrag = this.dispatcher.canDrag(sourceId);
      if (canDrag) {
        this.eventStream.next({
          type: DragBackendEventType.DRAG_START,
          sourceId,
          clientOffset
        });
        try {
          const previewImage = this.dispatcher.getPreviewImageForSourceId(
            sourceId
          );
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

  private handleGlobalDragEnter(event: DragEvent): void {
    const { dragEnterTargetId: targetIds, activeSourceId: sourceId } = this;
    this.dragEnterTargetId = null;
    if (!targetIds) {
      return;
    }
    const clientOffset = getEventClientOffset(event);
    for (let i = targetIds.length - 1; i >= 0; i--) {
      const targetId = targetIds[i];
      const canDrop = this.dispatcher.canDrop(targetId, sourceId);
      if (canDrop) {
        this.eventStream.next({
          type: DragBackendEventType.DRAG_ENTER,
          clientOffset,
          targetId,
          sourceId
        });
        event.preventDefault();
        return;
      }
    }
  }

  private handleGlobalDragEnd(event: DragEvent): void {
    const { activeSourceId: sourceId } = this;
    this.activeSourceId = null;
    const clientOffset = getEventClientOffset(event);
    this.eventStream.next({
      type: DragBackendEventType.DRAG_END,
      clientOffset,
      sourceId
    });
  }

  private handleGlobalDragOver(event: DragEvent): void {
    const { dragOverTargetId: targetIds, activeSourceId: sourceId } = this;
    this.dragOverTargetId = null;
    if (!targetIds) {
      return;
    }
    const clientOffset = getEventClientOffset(event);
    for (let i = targetIds.length - 1; i >= 0; i--) {
      const targetId = targetIds[i];
      const canDrop = this.dispatcher.canDrop(targetId, sourceId);
      if (canDrop) {
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

  private handleGlobalDragLeave(event: DragEvent): void {
    const { dragLeaveTargetId: targetIds, activeSourceId: sourceId } = this;
    this.dragLeaveTargetId = null;
    if (!targetIds) {
      return;
    }
    const clientOffset = getEventClientOffset(event);
    for (let i = targetIds.length - 1; i >= 0; i--) {
      const targetId = targetIds[i];
      const canDrop = this.dispatcher.canDrop(targetId, sourceId);
      if (canDrop) {
        this.eventStream.next({
          type: DragBackendEventType.DRAG_OUT,
          clientOffset,
          targetId,
          sourceId
        });
        event.preventDefault();
        return;
      }
    }
  }

  private handleGlobalDrop(event: DragEvent): void {
    const { dropTargetId: targetIds, activeSourceId: sourceId } = this;
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
  }

  private handleDragStart(sourceId: string): void {
    if (!this.dragStartSourceId) {
      this.dragStartSourceId = [];
    }
    this.dragStartSourceId.unshift(sourceId);
  }

  private handleDrag(event: DragEvent, sourceId: string): void {
    // const clientOffset = getEventClientOffset(event);
    // this.eventStream.next({
    //   type: DragBackendEventType.DRAG_OVER,
    //   clientOffset,
    //   sourceId
    // });
  }

  private handleDragEnter(targetId: string): void {
    if (!this.dragEnterTargetId) {
      this.dragEnterTargetId = [];
    }
    this.dragEnterTargetId.unshift(targetId);
  }

  private handleDragOver(targetId: string): void {
    if (!this.dragOverTargetId) {
      this.dragOverTargetId = [];
    }
    this.dragOverTargetId.unshift(targetId);
  }

  private handleDragLeave(targetId: string): void {
    if (!this.dragLeaveTargetId) {
      this.dragLeaveTargetId = [];
    }
    this.dragLeaveTargetId.unshift(targetId);
  }

  private handleDrop(targetId: string): void {
    if (!this.dropTargetId) {
      this.dropTargetId = [];
    }
    this.dropTargetId.unshift(targetId);
  }
}
