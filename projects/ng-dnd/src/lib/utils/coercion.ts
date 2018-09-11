export function coerceBoolean(value: any): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value !== 'false';
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  return value !== null && value !== undefined;
}

export function coerceArray<T>(value: T | T[]): T[] {
  if (typeof value === 'object' && Array.isArray(value)) {
    return value;
  }
  return [value];
}
