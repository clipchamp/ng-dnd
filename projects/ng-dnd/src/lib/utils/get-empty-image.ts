const emptyImage = new Image();
emptyImage.src =
  'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

export function getEmptyImage(): HTMLImageElement {
  return emptyImage;
}
