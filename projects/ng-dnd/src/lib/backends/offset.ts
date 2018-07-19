export interface Coordinates {
  x: number;
  y: number;
}

const ELEMENT_NODE = 1;

export function getNodeDOMRect(node: any): DOMRect {
  const el = node.nodeType === ELEMENT_NODE ? node : node.parentElement;

  if (!el) {
    return null;
  }

  return el.getBoundingClientRect();
}

export function getEventClientOffset(event: DragEvent): Coordinates {
  return {
    x: event.x,
    y: event.y
  };
}

export function getDragPreviewOffset(
  dragPreview: any,
  clientOffset: Coordinates
): Coordinates {
  const { left, top } = getNodeDOMRect(dragPreview);
  return {
    x: clientOffset.x - left,
    y: clientOffset.y - top
  };
}

export function getSourceOffset(
  node: any,
  clientOffset: Coordinates
): Coordinates & { width: number; height: number } {
  const { top, left, width, height } = getNodeDOMRect(node);
  return {
    x: clientOffset.x - left,
    y: clientOffset.y - top,
    width,
    height
  };
}
