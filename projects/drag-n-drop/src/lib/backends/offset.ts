export interface Position {
  x: number;
  y: number;
}

const ELEMENT_NODE = 1;

export function getNodeClientOffset(node: any): Position {
  const el = node.nodeType === ELEMENT_NODE ? node : node.parentElement;

  if (!el) {
    return null;
  }

  const { top, left } = el.getBoundingClientRect();
  return { x: left, y: top };
}

export function getEventClientOffset(event: DragEvent): Position {
  return {
    x: event.x,
    y: event.y
  };
}

export function getDragPreviewOffset(
  dragPreview: any,
  clientOffset: Position
): Position {
  const dragPreviewNodeOffsetFromClient = getNodeClientOffset(dragPreview);
  return {
    x: clientOffset.x - dragPreviewNodeOffsetFromClient.x,
    y: clientOffset.y - dragPreviewNodeOffsetFromClient.y
  };
}
