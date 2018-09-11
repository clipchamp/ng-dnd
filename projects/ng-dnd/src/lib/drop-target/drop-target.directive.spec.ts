import { Component, DebugElement } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { DropTarget } from './drop-target.directive';
import { DragDispatcher2 } from '../drag-dispatcher.service';
import { By } from '@angular/platform-browser';
import { of, Observable, Subject } from 'rxjs';
import { DragBackendEvent } from '../backends/drag-backend-event';
import { DragBackendEventType } from 'projects/ng-dnd/src/lib/backends/drag-backend-event-type';
import { filter, map } from 'rxjs/operators';

class MockDispatcher {
  connectDropTarget(target: DropTarget, node: any): any {}
  disconnectDropTarget(): any {}
  dragging$(itemTypes: string[]): any {}
}

@Component({
  template: `<div ccDropTarget [itemType]="itemTypes" (dragging)="onDrag($event)" (hovered)="onHover($event)" (dropped)="onDrop($event)"></div>`
})
class TestComponent {
  itemTypes: string | string[] = ['test'];

  onDrag(event: any): void {}
  onHover(event: any): void {}
  onDrop(event: any): void {}
}

describe('DropTarget', () => {
  let dispatcher: DragDispatcher2;
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let eventStream: Subject<DragBackendEvent>;
  let connectSpy: jasmine.Spy;
  let draggingSpy: jasmine.Spy;
  let targetDebugElement: DebugElement;
  let dropTarget: DropTarget;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, DropTarget],
      providers: [{ provide: DragDispatcher2, useClass: MockDispatcher }]
    });

    eventStream = new Subject();
    dispatcher = TestBed.get(DragDispatcher2);
    connectSpy = spyOn(dispatcher, 'connectDropTarget').and.returnValue(eventStream.asObservable());
    draggingSpy = spyOn(dispatcher, 'dragging$').and.returnValue(
      eventStream.pipe(
        filter(
          ({ type }) =>
            type === DragBackendEventType.DRAG_START ||
            type === DragBackendEventType.DRAG_END ||
            type === DragBackendEventType.DROP
        ),
        map(({ type }) => type === DragBackendEventType.DRAG_START)
      )
    );

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    targetDebugElement = fixture.debugElement.query(By.directive(DropTarget));
    dropTarget = targetDebugElement.injector.get(DropTarget);
  });

  it('should create', () => {
    expect(dropTarget).toBeTruthy();
  });

  it('should register itself with the drag dispatcher after creation', () => {
    expect(connectSpy).toHaveBeenCalledTimes(1);
    expect(connectSpy).toHaveBeenCalledWith(dropTarget, (dropTarget as any).hostElement);
  });

  it('should deregister itself with the drag dispatcher after deletion', () => {
    const spy = spyOn(dispatcher, 'disconnectDropTarget').and.stub();
    fixture.destroy();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(dropTarget);
  });

  it('should call dispatcher.dragging$ with the current itemType array', () => {
    expect(draggingSpy).toHaveBeenCalledTimes(1);
    expect(draggingSpy).toHaveBeenCalledWith(['test']);
  });

  it('should call dispatcher.dragging$ when the itemType array changes', () => {
    component.itemTypes = ['abc', 'def'];
    fixture.detectChanges();
    expect(draggingSpy).toHaveBeenCalledTimes(2);
    expect(draggingSpy).toHaveBeenCalledWith(['abc', 'def']);
  });

  it('should accept a string as itemType', () => {
    component.itemTypes = 'foo';
    fixture.detectChanges();
    expect(draggingSpy).toHaveBeenCalledTimes(2);
    expect(draggingSpy).toHaveBeenCalledWith('foo');
  });

  describe('when dragging an item', () => {
    let onDragSpy: jasmine.Spy;
    const dragStartEvent = {
      type: DragBackendEventType.DRAG_START,
      clientOffset: { x: 0, y: 0 },
      sourceOffset: { x: 0, y: 0, width: 0, height: 0 },
      item: 'Test'
    };

    beforeEach(() => {
      onDragSpy = spyOn(component, 'onDrag').and.stub();
      eventStream.next(dragStartEvent);
    });

    it('should emit a drag event when a drag started', () => {
      expect(onDragSpy).toHaveBeenCalledTimes(1);
      expect(onDragSpy).toHaveBeenCalledWith(true);
    });

    it('should emit a drag event when a drag ended', () => {
      eventStream.next({ ...dragStartEvent, type: DragBackendEventType.DRAG_END });
      expect(onDragSpy).toHaveBeenCalledTimes(2);
      expect(onDragSpy).toHaveBeenCalledWith(true);
      expect(onDragSpy).toHaveBeenCalledWith(false);
    });

    it('should emit a drag event when an item was dropped', () => {
      eventStream.next({ ...dragStartEvent, type: DragBackendEventType.DROP });
      expect(onDragSpy).toHaveBeenCalledTimes(2);
      expect(onDragSpy).toHaveBeenCalledWith(true);
      expect(onDragSpy).toHaveBeenCalledWith(false);
    });
  });

  describe('when hovering an item over the target', () => {
    let onHoverSpy: jasmine.Spy;
    const dragOverEvent = {
      type: DragBackendEventType.DRAG_OVER,
      clientOffset: { x: 0, y: 0 },
      sourceOffset: { x: 0, y: 0, width: 0, height: 0 },
      item: 'Test'
    };

    beforeEach(() => {
      onHoverSpy = spyOn(component, 'onHover').and.stub();
      eventStream.next(dragOverEvent);
    });

    it('should emit a hover event and set the isOver flag to true', () => {
      expect(onHoverSpy).toHaveBeenCalledTimes(1);
      expect(onHoverSpy).toHaveBeenCalledWith(dragOverEvent);
      expect(dropTarget.isOver).toBeTruthy();
    });

    it('should reset after drag out', () => {
      eventStream.next({
        type: DragBackendEventType.DRAG_OUT,
        clientOffset: { x: 0, y: 0 },
        sourceOffset: { x: 0, y: 0, width: 0, height: 0 },
        item: 'Test'
      });
      expect(onHoverSpy).toHaveBeenCalledTimes(2);
      expect(onHoverSpy).toHaveBeenCalledWith(dragOverEvent);
      expect(onHoverSpy).toHaveBeenCalledWith(undefined);
      expect(dropTarget.isOver).toBeFalsy();
    });
  });

  describe('when dropping an item on the target', () => {
    let onDropSpy: jasmine.Spy;
    const dropEvent = {
      type: DragBackendEventType.DROP,
      clientOffset: { x: 0, y: 0 },
      sourceOffset: { x: 0, y: 0, width: 0, height: 0 },
      item: 'Test'
    };

    beforeEach(() => {
      onDropSpy = spyOn(component, 'onDrop').and.stub();
      eventStream.next(dropEvent);
    });

    it('should emit a drop event', () => {
      expect(onDropSpy).toHaveBeenCalledTimes(1);
      expect(onDropSpy).toHaveBeenCalledWith(dropEvent);
    });
  });
});
