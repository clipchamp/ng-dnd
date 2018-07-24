import { TemplateRef } from '@angular/core';
import { DragRegistry } from './drag-registry';
import { getEmptyImage } from './utils/get-empty-image';

export class DragMonitor {
  constructor(private readonly registry: DragRegistry) {}

  canDrag(sourceId: string): boolean {
    const source = this.registry.getSource(sourceId);
    return !!source && source.canDrag;
  }

  canDrop(targetId: string, sourceId): boolean {
    const target = this.registry.getTarget(targetId);
    const source = this.registry.getSource(sourceId);
    return (
      !!target &&
      !!source &&
      ((typeof target.itemType === 'object' && target.itemType.indexOf(source.itemType) > -1) ||
        (typeof target.itemType === 'string' && target.itemType === source.itemType)) &&
      ((typeof target.canDrop === 'function' && target.canDrop(source.item)) ||
        (typeof target.canDrop !== 'function' && target.canDrop))
    );
  }

  getPreviewImageForSourceId(sourceId: string): any | undefined {
    const source = this.registry.getSource(sourceId);
    if (source && source.dragPreview instanceof TemplateRef) {
      return getEmptyImage();
    }
    if (source && source.dragPreview instanceof HTMLElement) {
      return source.dragPreview;
    }
    if (source) {
      return source.hostElement;
    }
    return undefined;
  }
}
