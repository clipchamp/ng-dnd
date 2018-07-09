import { DragDispatcher2 } from './drag-dispatcher.service';
import { TestBed } from '@angular/core/testing';
import {
  DRAG_BACKEND,
  DragBackendFactory
} from './backends/drag-backend-factory';
import {
  testDragBackendFactory,
  TestDragBackend
} from './backends/test-drag-backend';
import { DragSource } from './drag-source.directive';
import { Observable } from 'rxjs';
import { DragBackendEvent } from './backends/drag-backend-event';
import { take, timeout } from 'rxjs/operators';
import { DragBackendEventType } from './backends/drag-backend-event-type';
import { DropTarget } from './drop-target.directive';
import { getEmptyImage } from './get-empty-image';
import { TemplateRef, Component, ViewChild } from '@angular/core';
import { DragLayer } from './drag-layer.component';

@Component({
  template: `<ng-template #test></ng-template>`
})
export class MockDragPreviewTemplateComponent {
  @ViewChild('test') templateRef: TemplateRef<any>;
}

describe('DragDispatcher', () => {
  let dispatcher: DragDispatcher2;
  let backend: TestDragBackend;
  let backendFactory: DragBackendFactory;

  beforeEach(() => {
    backendFactory = jasmine
      .createSpy('backendFactory')
      .and.callFake((drag: DragDispatcher2) => {
        backend = testDragBackendFactory()(drag) as any;
        return backend;
      });

    TestBed.configureTestingModule({
      declarations: [MockDragPreviewTemplateComponent],
      providers: [
        DragDispatcher2,
        {
          provide: DRAG_BACKEND,
          useValue: backendFactory
        }
      ]
    });

    dispatcher = TestBed.get(DragDispatcher2);
  });

  it('should create', () => {
    expect(dispatcher).toBeTruthy();
  });

  it('should create a drag backend', () => {
    expect(backendFactory).toHaveBeenCalledWith(dispatcher);
    expect(backend).toBeTruthy();
  });

  describe('with drag sources', () => {
    const mockNode = document.createElement('div');
    let mockDragSource: DragSource;
    let backendSpy: jasmine.Spy;
    let disconnectSpy: jasmine.Spy;
    let eventStream: Observable<DragBackendEvent>;

    beforeEach(() => {
      mockDragSource = { canDrag: false, hostElement: mockNode } as DragSource;
      disconnectSpy = jasmine.createSpy('unsubscribe').and.stub();
      backendSpy = spyOn(backend, 'connectDragSource').and.callFake(
        () => disconnectSpy
      );
      eventStream = dispatcher.connectDragSource(mockDragSource, mockNode);
    });

    it('should connect and register a drag source', () => {
      expect(eventStream).toBeTruthy();
      expect((dispatcher as any).sourceRegistry.size).toBe(1);
      expect((dispatcher as any).sourceRegistry.get('drag_0')).toBeTruthy();
      expect((dispatcher as any).unsubscribes.get(mockDragSource)).toBeTruthy();
      expect(backendSpy).toHaveBeenCalledWith('drag_0', mockNode);
    });

    it('should disconnect and deregister a drag source', () => {
      dispatcher.disconnectDragSource(mockDragSource);
      expect((dispatcher as any).sourceRegistry.size).toBe(0);
      expect((dispatcher as any).sourceRegistry.get('drag_0')).toBeFalsy();
      expect((dispatcher as any).unsubscribes.get(mockDragSource)).toBeFalsy();
      expect(disconnectSpy).toHaveBeenCalledTimes(1);
    });

    it('should propagate the event to the source', (done: any) => {
      eventStream.pipe(take(1)).subscribe(event => {
        expect(event.type).toBe(DragBackendEventType.DRAG_START);
        expect(event.sourceId).toEqual('drag_0');
        expect(event.clientOffset.x).toBe(100);
        expect(event.clientOffset.y).toBe(100);
        done();
      });
      backend.publish({
        type: DragBackendEventType.DRAG_START,
        sourceId: 'drag_0',
        clientOffset: {
          x: 100,
          y: 100
        }
      });
    });

    it('should not propagate the event to the source', (done: any) => {
      let anyEvent: any;
      eventStream.pipe(timeout(500)).subscribe(
        event => (anyEvent = event),
        err => {
          expect(anyEvent).toBeFalsy();
          done();
        }
      );
      backend.publish({
        type: DragBackendEventType.DRAG_START,
        sourceId: 'drag_1',
        clientOffset: {
          x: 100,
          y: 100
        }
      });
    });

    it('should return the canDrag value of a registered drag source', () => {
      expect(dispatcher.canDrag('drag_0')).toBeFalsy();
      mockDragSource.canDrag = true;
      expect(dispatcher.canDrag('drag_0')).toBeTruthy();
    });

    it('should return false for the canDrag value of an unregistered drag source', () => {
      expect(dispatcher.canDrag('drag_3')).toBeFalsy();
    });

    it('should return the node of the drag source by default', () => {
      expect(dispatcher.getPreviewImageForSourceId('drag_0')).toBe(mockNode);
    });

    it('should return the node of the drag source for unsupported values', () => {
      mockDragSource.dragPreview = 'oink' as any;
      expect(dispatcher.getPreviewImageForSourceId('drag_0')).toBe(mockNode);
    });

    it('should return an empty image if a template ref is given as a drag preview', () => {
      const fixture = TestBed.createComponent(MockDragPreviewTemplateComponent);
      const component = fixture.componentInstance;
      mockDragSource.dragPreview = component.templateRef;
      expect(dispatcher.getPreviewImageForSourceId('drag_0')).toBe(
        getEmptyImage()
      );
    });

    it('should return an html element if a node is given as a drag preview', () => {
      const dragPreviewNode = document.createElement('div');
      mockDragSource.dragPreview = dragPreviewNode;
      expect(dispatcher.getPreviewImageForSourceId('drag_0')).toBe(
        dragPreviewNode
      );
    });
  });

  describe('with drop targets', () => {
    const mockNode = document.createElement('div');
    const mockDropTarget = { canDrop: false } as DropTarget;
    let backendSpy: jasmine.Spy;
    let disconnectSpy: jasmine.Spy;
    let eventStream: Observable<DragBackendEvent>;

    beforeEach(() => {
      disconnectSpy = jasmine.createSpy('unsubscribe').and.stub();
      backendSpy = spyOn(backend, 'connectDropTarget').and.callFake(
        () => disconnectSpy
      );
      eventStream = dispatcher.connectDropTarget(mockDropTarget, mockNode);
    });

    it('should connect and register a drop target', () => {
      expect(eventStream).toBeTruthy();
      expect((dispatcher as any).targetRegistry.size).toBe(1);
      expect((dispatcher as any).targetRegistry.get('drop_0')).toBeTruthy();
      expect((dispatcher as any).unsubscribes.get(mockDropTarget)).toBeTruthy();
      expect(backendSpy).toHaveBeenCalledWith('drop_0', mockNode);
    });

    it('should disconnect and deregister a drop target', () => {
      dispatcher.disconnectDropTarget(mockDropTarget);
      expect((dispatcher as any).targetRegistry.size).toBe(0);
      expect((dispatcher as any).targetRegistry.get('drop_0')).toBeFalsy();
      expect((dispatcher as any).unsubscribes.get(mockDropTarget)).toBeFalsy();
      expect(disconnectSpy).toHaveBeenCalledTimes(1);
    });

    it('should propagate the event to the target', (done: any) => {
      eventStream.pipe(take(1)).subscribe(event => {
        expect(event.type).toBe(DragBackendEventType.DRAG_ENTER);
        expect(event.targetId).toEqual('drop_0');
        expect(event.clientOffset.x).toBe(100);
        expect(event.clientOffset.y).toBe(100);
        done();
      });
      backend.publish({
        type: DragBackendEventType.DRAG_ENTER,
        sourceId: 'drag_1',
        targetId: 'drop_0',
        clientOffset: {
          x: 100,
          y: 100
        }
      });
    });

    it('should not propagate the event to the target', (done: any) => {
      let anyEvent: any;
      eventStream.pipe(timeout(500)).subscribe(
        event => (anyEvent = event),
        err => {
          expect(anyEvent).toBeFalsy();
          done();
        }
      );
      backend.publish({
        type: DragBackendEventType.DRAG_ENTER,
        sourceId: 'drag_1',
        clientOffset: {
          x: 100,
          y: 100
        }
      });
    });
  });

  describe('with drag layer', () => {
    let dragLayer: DragLayer;
    let dragSource: DragSource;

    beforeEach(() => {
      dragLayer = {
        showPreview: jasmine.createSpy('showPreview').and.stub(),
        updatePreview: jasmine.createSpy('updatePreview').and.stub(),
        hidePreview: jasmine.createSpy('hidePreview').and.stub()
      } as any;
      dispatcher.connectDragLayer(dragLayer);
    });

    it('should register the drag layer', () => {
      expect((dispatcher as any).dragLayer).toBe(dragLayer);
    });

    beforeEach(() => {
      const fixture = TestBed.createComponent(MockDragPreviewTemplateComponent);
      const component = fixture.componentInstance;
      const dragSourceNode = document.createElement('div');
      dragSource = {
        dragPreview: component.templateRef,
        canDrag: true,
        item: 'test'
      } as any;
      dispatcher.connectDragSource(dragSource, dragSourceNode);
    });

    it('should show the drag preview when starting to drag', (done: any) => {
      backend.eventStream$.pipe(take(1)).subscribe(() => {
        expect(dragLayer.showPreview).toHaveBeenCalledTimes(1);
        expect(dragLayer.showPreview).toHaveBeenCalledWith(
          'drag_0',
          dragSource.dragPreview,
          {
            position: {
              x: 100,
              y: 100
            },
            canDrop: false,
            $implicit: 'test'
          }
        );
        expect(dragLayer.hidePreview).toHaveBeenCalledTimes(0);
        expect(dragLayer.updatePreview).toHaveBeenCalledTimes(0);
        done();
      });
      backend.publish({
        type: DragBackendEventType.DRAG_START,
        sourceId: 'drag_0',
        clientOffset: {
          x: 100,
          y: 100
        }
      });
    });

    it('should not interact with the drag layer before starting to drag', (done: any) => {
      backend.eventStream$.pipe(take(2)).subscribe(
        () => {},
        () => {},
        () => {
          expect(dragLayer.showPreview).toHaveBeenCalledTimes(0);
          expect(dragLayer.hidePreview).toHaveBeenCalledTimes(0);
          expect(dragLayer.updatePreview).toHaveBeenCalledTimes(0);
          done();
        }
      );
      backend.publish({
        type: DragBackendEventType.DRAG_OVER,
        sourceId: 'drag_0',
        clientOffset: {
          x: 100,
          y: 100
        }
      });
      backend.publish({
        type: DragBackendEventType.DROP,
        sourceId: 'drag_0',
        clientOffset: {
          x: 100,
          y: 100
        }
      });
    });

    it('should update the drag preview', (done: any) => {
      backend.eventStream$.pipe(take(2)).subscribe(
        () => {},
        () => {},
        () => {
          expect(dragLayer.showPreview).toHaveBeenCalledTimes(1);
          expect(dragLayer.hidePreview).toHaveBeenCalledTimes(0);
          expect(dragLayer.updatePreview).toHaveBeenCalledTimes(1);
          expect(dragLayer.updatePreview).toHaveBeenCalledWith('drag_0', {
            position: {
              x: 150,
              y: 150
            },
            canDrop: false,
            $implicit: 'test'
          });
          done();
        }
      );
      backend.publish({
        type: DragBackendEventType.DRAG_START,
        sourceId: 'drag_0',
        clientOffset: {
          x: 100,
          y: 100
        }
      });
      backend.publish({
        type: DragBackendEventType.DRAG_OVER,
        sourceId: 'drag_0',
        clientOffset: {
          x: 150,
          y: 150
        }
      });
    });

    it('should hide the drag preview when dropping', (done: any) => {
      backend.eventStream$.pipe(take(2)).subscribe(
        () => {},
        () => {},
        () => {
          expect(dragLayer.showPreview).toHaveBeenCalledTimes(1);
          expect(dragLayer.hidePreview).toHaveBeenCalledTimes(1);
          expect(dragLayer.hidePreview).toHaveBeenCalledWith('drag_0');
          expect(dragLayer.updatePreview).toHaveBeenCalledTimes(0);
          done();
        }
      );
      backend.publish({
        type: DragBackendEventType.DRAG_START,
        sourceId: 'drag_0',
        clientOffset: {
          x: 100,
          y: 100
        }
      });
      backend.publish({
        type: DragBackendEventType.DROP,
        sourceId: 'drag_0',
        clientOffset: {
          x: 100,
          y: 100
        }
      });
    });

    it('should hide the drag preview when finishing drag', (done: any) => {
      backend.eventStream$.pipe(take(2)).subscribe(
        () => {},
        () => {},
        () => {
          expect(dragLayer.showPreview).toHaveBeenCalledTimes(1);
          expect(dragLayer.hidePreview).toHaveBeenCalledTimes(1);
          expect(dragLayer.hidePreview).toHaveBeenCalledWith('drag_0');
          expect(dragLayer.updatePreview).toHaveBeenCalledTimes(0);
          done();
        }
      );
      backend.publish({
        type: DragBackendEventType.DRAG_START,
        sourceId: 'drag_0',
        clientOffset: {
          x: 100,
          y: 100
        }
      });
      backend.publish({
        type: DragBackendEventType.DRAG_END,
        sourceId: 'drag_0',
        clientOffset: {
          x: 100,
          y: 100
        }
      });
    });
  });

  describe('with drag sources and drop targets', () => {});
});
