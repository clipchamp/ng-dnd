export const NATIVE_FILE = '__FILE__';
export const NATIVE_URL = '__URL__';

export function getNativeItemType(dataTransfer: DataTransfer): string {
  if (dataTransfer.files.length > 0) {
    return NATIVE_FILE;
  }
  if (dataTransfer.items) {
    for (let j = 0; j < dataTransfer.items.length; j++) {
      if (dataTransfer.items[j].kind === 'file') {
        return NATIVE_FILE;
      }
    }
  }
  return NATIVE_URL;
}

export function getNativeFiles(dataTransfer: DataTransfer): File[] {
  const files = [];
  if (dataTransfer.items) {
    for (let j = 0; j < dataTransfer.items.length; j++) {
      if (dataTransfer.items[j].kind === 'file') {
        files.push(dataTransfer.items[j].getAsFile());
      }
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

export function getNativeStrings(dataTransfer: DataTransfer): string[] {}
