export function coerceBoolean(value: any): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value !== 'false';
  }
  return true;
}

export function coerceArray<T>(value: T | T[]): T[] {
  if (typeof value === 'object' && Array.isArray(value)) {
    return value;
  }
  return [value];
}
