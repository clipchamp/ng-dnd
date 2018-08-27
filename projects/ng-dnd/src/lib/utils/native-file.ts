export const NATIVE_FILE = '__FILE__';

export function getDroppedFiles(dataTransfer: DataTransfer): File[] {
  const files = [];
  if (dataTransfer.items) {
    for (let j = 0; j < dataTransfer.items.length; j++) {
      files.push(dataTransfer.items[j].getAsFile());
    }
    dataTransfer.items.clear();
  } else {
    for (let j = 0; j < dataTransfer.files.length; j++) {
      files.push(dataTransfer.files[j]);
    }
    dataTransfer.clearData();
  }
  return files;
}
