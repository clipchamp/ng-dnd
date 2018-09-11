import { DragRegistry } from './drag-registry';
import { DragSource } from './drag-source/drag-source.directive';
import { DropTarget } from './drop-target/drop-target.directive';

describe('DragRegistry', () => {
  let registry: DragRegistry;

  beforeEach(() => {
    registry = new DragRegistry();
  });

  it('should create', () => {
    expect(registry).toBeTruthy();
  });

  it('should set a source', () => {
    expect((registry as any).sources.size).toBe(0);
    registry.setSource('foo', {} as DragSource);
    expect((registry as any).sources.size).toBe(1);
  });

  it('should retrieve a source', () => {
    const source = {} as DragSource;
    registry.setSource('foo', source);
    expect(registry.getSource('foo')).toBe(source);
  });

  it('should delete a source', () => {
    registry.setSource('foo', {} as DragSource);
    expect((registry as any).sources.size).toBe(1);
    registry.deleteSource('foo');
    expect((registry as any).sources.size).toBe(0);
    expect(registry.getSource('foo')).toBeFalsy();
  });

  it('should set a target', () => {
    expect((registry as any).targets.size).toBe(0);
    registry.setTarget('foo', {} as DropTarget);
    expect((registry as any).targets.size).toBe(1);
  });

  it('should retrieve a target', () => {
    const source = {} as DropTarget;
    registry.setTarget('foo', source);
    expect(registry.getTarget('foo')).toBe(source);
  });

  it('should delete a target', () => {
    registry.setTarget('foo', {} as DropTarget);
    expect((registry as any).targets.size).toBe(1);
    registry.deleteTarget('foo');
    expect((registry as any).targets.size).toBe(0);
    expect(registry.getTarget('foo')).toBeFalsy();
  });
});
