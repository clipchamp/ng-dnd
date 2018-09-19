import { TemplateRef, ElementRef, EmbeddedViewRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { DragMonitor } from './drag-monitor';
import { DragRegistry } from './drag-registry';
import { NATIVE_FILE, NATIVE_STRING } from './utils/native-file';

class RegistryStub {
  getSource(): any {}
  getTarget(): any {}
}

class TemplateRefInstance<T = any> extends TemplateRef<T> {
  elementRef: ElementRef<any>;
  createEmbeddedView(context: T): EmbeddedViewRef<T> {
    throw new Error('Method not implemented.');
  }
}

describe('DragMonitor', () => {
  let nativeDocument: Document;
  let monitor: DragMonitor;
  let registry: DragRegistry;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DragRegistry,
          useClass: RegistryStub
        }
      ]
    });
    nativeDocument = TestBed.get(DOCUMENT);
    monitor = TestBed.get(DragMonitor);
    registry = TestBed.get(DragRegistry);
  });

  it('should create', () => {
    expect(monitor).toBeTruthy();
  });

  describe('canDrag', () => {
    it('should return true when the source is found and has a canDrag attribute set to true', () => {
      const getSourceSpy = spyOn(registry, 'getSource').and.returnValue({ canDrag: true });
      expect(monitor.canDrag('foo')).toBeTruthy();
      expect(getSourceSpy).toHaveBeenCalledTimes(1);
      expect(getSourceSpy).toHaveBeenCalledWith('foo');
    });

    it('should return false when the source is not found', () => {
      const getSourceSpy = spyOn(registry, 'getSource').and.returnValue(undefined);
      expect(monitor.canDrag('foo')).toBeFalsy();
      expect(getSourceSpy).toHaveBeenCalledTimes(1);
      expect(getSourceSpy).toHaveBeenCalledWith('foo');
    });

    it('should return false when the source is found and has a canDrag attribute set to false', () => {
      const getSourceSpy = spyOn(registry, 'getSource').and.returnValue({ canDrag: false });
      expect(monitor.canDrag('foo')).toBeFalsy();
      expect(getSourceSpy).toHaveBeenCalledTimes(1);
      expect(getSourceSpy).toHaveBeenCalledWith('foo');
    });
  });

  describe('canDrop', () => {
    it('should return true when source and target are found and their item types match', () => {
      const getSourceSpy = spyOn(registry, 'getSource').and.returnValue({ itemType: 'test' });
      const getTargetSpy = spyOn(registry, 'getTarget').and.returnValue({
        itemType: 'test',
        canDrop: true
      });
      expect(monitor.canDrop('foo', 'bar')).toBeTruthy();
      expect(getSourceSpy).toHaveBeenCalledTimes(1);
      expect(getSourceSpy).toHaveBeenCalledWith('bar');
      expect(getTargetSpy).toHaveBeenCalledTimes(1);
      expect(getTargetSpy).toHaveBeenCalledWith('foo');
    });

    it('should return false when source and target are found and their item types match but target has canDrop set to false', () => {
      const getSourceSpy = spyOn(registry, 'getSource').and.returnValue({ itemType: 'test' });
      const getTargetSpy = spyOn(registry, 'getTarget').and.returnValue({
        itemType: 'test',
        canDrop: false
      });
      expect(monitor.canDrop('foo', 'bar')).toBeFalsy();
      expect(getSourceSpy).toHaveBeenCalledTimes(1);
      expect(getSourceSpy).toHaveBeenCalledWith('bar');
      expect(getTargetSpy).toHaveBeenCalledTimes(1);
      expect(getTargetSpy).toHaveBeenCalledWith('foo');
    });

    it('should return false when source and target are found and their item types do not match', () => {
      const getSourceSpy = spyOn(registry, 'getSource').and.returnValue({ itemType: 'test' });
      const getTargetSpy = spyOn(registry, 'getTarget').and.returnValue({
        itemType: 'test2',
        canDrop: true
      });
      expect(monitor.canDrop('foo', 'bar')).toBeFalsy();
      expect(getSourceSpy).toHaveBeenCalledTimes(1);
      expect(getSourceSpy).toHaveBeenCalledWith('bar');
      expect(getTargetSpy).toHaveBeenCalledTimes(1);
      expect(getTargetSpy).toHaveBeenCalledWith('foo');
    });

    it('should return true when source and target are found and their item types match (target has an array of item types)', () => {
      const getSourceSpy = spyOn(registry, 'getSource').and.returnValue({ itemType: 'test' });
      const getTargetSpy = spyOn(registry, 'getTarget').and.returnValue({
        itemType: ['test2', 'test'],
        canDrop: true
      });
      expect(monitor.canDrop('foo', 'bar')).toBeTruthy();
      expect(getSourceSpy).toHaveBeenCalledTimes(1);
      expect(getSourceSpy).toHaveBeenCalledWith('bar');
      expect(getTargetSpy).toHaveBeenCalledTimes(1);
      expect(getTargetSpy).toHaveBeenCalledWith('foo');
    });

    it('should return false when source and target are found and their item types do not match (target has an array of item types)', () => {
      const getSourceSpy = spyOn(registry, 'getSource').and.returnValue({ itemType: 'test' });
      const getTargetSpy = spyOn(registry, 'getTarget').and.returnValue({
        itemType: ['test2', 'test3'],
        canDrop: true
      });
      expect(monitor.canDrop('foo', 'bar')).toBeFalsy();
      expect(getSourceSpy).toHaveBeenCalledTimes(1);
      expect(getSourceSpy).toHaveBeenCalledWith('bar');
      expect(getTargetSpy).toHaveBeenCalledTimes(1);
      expect(getTargetSpy).toHaveBeenCalledWith('foo');
    });

    it('should return true when source is native file or string and target supports it', () => {
      const getTargetSpy = spyOn(registry, 'getTarget').and.returnValue({
        itemType: [NATIVE_FILE, 'test3'],
        canDrop: true
      });
      expect(monitor.canDrop('foo', NATIVE_FILE)).toBeTruthy();
      expect(getTargetSpy).toHaveBeenCalledTimes(1);
      expect(getTargetSpy).toHaveBeenCalledWith('foo');
    });

    it('should return true when source is native file or string and target supports it but canDrop is false', () => {
      const getTargetSpy = spyOn(registry, 'getTarget').and.returnValue({
        itemType: NATIVE_STRING,
        canDrop: false
      });
      expect(monitor.canDrop('foo', NATIVE_STRING)).toBeFalsy();
      expect(getTargetSpy).toHaveBeenCalledTimes(1);
      expect(getTargetSpy).toHaveBeenCalledWith('foo');
    });

    it('should return false when source is native file or string and target does not support it', () => {
      const getTargetSpy = spyOn(registry, 'getTarget').and.returnValue({
        itemType: ['test', 'test3'],
        canDrop: false
      });
      expect(monitor.canDrop('foo', NATIVE_FILE)).toBeFalsy();
      expect(getTargetSpy).toHaveBeenCalledTimes(1);
      expect(getTargetSpy).toHaveBeenCalledWith('foo');
    });

    it('should return true when source and target are found and their item types match and target has canDrop function that returns true', () => {
      const getSourceSpy = spyOn(registry, 'getSource').and.returnValue({
        itemType: 'test',
        item: { id: 'bar' }
      });
      const canDropSpy = jasmine
        .createSpy('canDrop', (item: any) => item.id === 'bar')
        .and.callThrough();
      const getTargetSpy = spyOn(registry, 'getTarget').and.returnValue({
        itemType: 'test',
        canDrop: canDropSpy
      });
      expect(monitor.canDrop('foo', 'bar')).toBeTruthy();
      expect(getSourceSpy).toHaveBeenCalledTimes(1);
      expect(getSourceSpy).toHaveBeenCalledWith('bar');
      expect(getTargetSpy).toHaveBeenCalledTimes(1);
      expect(getTargetSpy).toHaveBeenCalledWith('foo');
      expect(canDropSpy).toHaveBeenCalledTimes(1);
      expect(canDropSpy).toHaveBeenCalledWith({ id: 'bar' });
    });

    it('should return false when source and target are found and their item types match and target has canDrop function that returns false', () => {
      const getSourceSpy = spyOn(registry, 'getSource').and.returnValue({
        itemType: 'test',
        item: { id: 'bar' }
      });
      const canDropSpy = jasmine
        .createSpy('canDrop', (item: any) => item.id === 'foo')
        .and.callThrough();
      const getTargetSpy = spyOn(registry, 'getTarget').and.returnValue({
        itemType: 'test',
        canDrop: canDropSpy
      });
      expect(monitor.canDrop('foo', 'bar')).toBeFalsy(29);
      expect(getSourceSpy).toHaveBeenCalledTimes(1);
      expect(getSourceSpy).toHaveBeenCalledWith('bar');
      expect(getTargetSpy).toHaveBeenCalledTimes(1);
      expect(getTargetSpy).toHaveBeenCalledWith('foo');
      expect(canDropSpy).toHaveBeenCalledTimes(1);
      expect(canDropSpy).toHaveBeenCalledWith({ id: 'bar' });
    });
  });

  it('should return an empty image when source has a TemplateRef as drag preview', () => {
    const getSourceSpy = spyOn(registry, 'getSource').and.returnValue({
      dragPreview: new TemplateRefInstance<any>()
    });
    const preview = monitor.getPreviewImageForSourceId('foo');
    expect(preview).toEqual(jasmine.any(HTMLImageElement));
    expect(preview.src).toEqual(
      'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
    );
    expect(getSourceSpy).toHaveBeenCalledTimes(1);
    expect(getSourceSpy).toHaveBeenCalledWith('foo');
  });

  it('should return the HTML element when source has a HTML element as drag preview', () => {
    const getSourceSpy = spyOn(registry, 'getSource').and.returnValue({
      dragPreview: nativeDocument.createElement('div')
    });
    const preview = monitor.getPreviewImageForSourceId('foo');
    expect(preview).toEqual(jasmine.any(HTMLElement));
    expect(getSourceSpy).toHaveBeenCalledTimes(1);
    expect(getSourceSpy).toHaveBeenCalledWith('foo');
  });

  it('should return the host element when source has no drag preview', () => {
    const getSourceSpy = spyOn(registry, 'getSource').and.returnValue({
      hostElement: nativeDocument.createElement('div')
    });
    const preview = monitor.getPreviewImageForSourceId('foo');
    expect(preview).toEqual(jasmine.any(HTMLElement));
    expect(getSourceSpy).toHaveBeenCalledTimes(1);
    expect(getSourceSpy).toHaveBeenCalledWith('foo');
  });

  it('should return undefined when source cannot be found', () => {
    const getSourceSpy = spyOn(registry, 'getSource').and.returnValue(undefined);
    const preview = monitor.getPreviewImageForSourceId('foo');
    expect(preview).toBeFalsy();
    expect(getSourceSpy).toHaveBeenCalledTimes(1);
    expect(getSourceSpy).toHaveBeenCalledWith('foo');
  });

  it('should return drop effect of target', () => {
    const getTargetSpy = spyOn(registry, 'getTarget').and.returnValue({
      dropEffect: 'move'
    });
    expect(monitor.getDropEffectForTargetId('foo')).toEqual('move');
    expect(getTargetSpy).toHaveBeenCalledTimes(1);
    expect(getTargetSpy).toHaveBeenCalledWith('foo');
  });

  it('should return "none" for drop effect when target is not found', () => {
    const getTargetSpy = spyOn(registry, 'getTarget').and.returnValue(undefined);
    expect(monitor.getDropEffectForTargetId('foo')).toEqual('none');
    expect(getTargetSpy).toHaveBeenCalledTimes(1);
    expect(getTargetSpy).toHaveBeenCalledWith('foo');
  });

  it('should return the position from the drag event', () => {
    const position = monitor.getMousePositionFromEvent({ x: 10, y: 20 } as DragEvent);
    expect(position.x).toBe(10);
    expect(position.y).toBe(20);
  });

  it('should return the position from the drag event after passing it through adjust function', () => {
    const spy = jasmine
      .createSpy('adjustMousePositionFn', pos => ({ x: pos.x + 5, y: pos.y + 10 }))
      .and.callThrough();
    monitor.adjustMousePositionFn = spy;
    const position = monitor.getMousePositionFromEvent({ x: 10, y: 20 } as DragEvent);
    expect(position.x).toBe(15);
    expect(position.y).toBe(30);
    expect(spy).toHaveBeenCalledWith({ x: 10, y: 20 }, undefined);
  });
});
