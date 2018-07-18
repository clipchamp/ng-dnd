export interface Coordinates {
  x: number;
  y: number;
}

const ELEMENT_NODE = 1;

export function getNodeClientOffset(node: any): Coordinates {
  const el = node.nodeType === ELEMENT_NODE ? node : node.parentElement;

  if (!el) {
    return null;
  }

  const { top, left } = el.getBoundingClientRect();
  return { x: left, y: top };
}

export function getEventClientOffset(event: DragEvent): Coordinates {
  return {
    x: event.x,
    y: event.y
  };
}

export function getSourceClientOffset(
  sourceNode: any,
  clientOffset: Coordinates
): Coordinates {
  const sourceNodeOffsetFromClient = getNodeClientOffset(sourceNode);
  return {
    x: clientOffset.x - sourceNodeOffsetFromClient.x,
    y: clientOffset.y - sourceNodeOffsetFromClient.y
  };
}

export function getDragPreviewOffset(
  dragPreview: any,
  clientOffset: Coordinates
): Coordinates {
  const dragPreviewNodeOffsetFromClient = getNodeClientOffset(dragPreview);
  return {
    x: clientOffset.x - dragPreviewNodeOffsetFromClient.x,
    y: clientOffset.y - dragPreviewNodeOffsetFromClient.y
  };
}
