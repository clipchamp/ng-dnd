import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TestBed, ComponentFixture, tick, fakeAsync } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { DropTarget } from './drop-target.directive';
import { DropTargetDragging } from './drop-target-dragging.directive';
import { DragDispatcher2 } from '../drag-dispatcher.service';
import { DragBackendEvent } from '../backends/drag-backend-event';
import { DragBackendEventType } from '../backends/drag-backend-event-type';
import { filter, map } from 'rxjs/operators';

class MockDispatcher {
  connectDropTarget(target: DropTarget, node: any): any {}
  disconnectDropTarget(): any {}
  dragging$(itemTypes: string[]): any {}
}

@Component({
  template: `<div ccDropTarget [itemType]="'test'" [ccDropTargetDragging]="activeClass"></div>`
})
class TestComponent {
  activeClass = 'is-dragging';
}

describe('DropTargetDragging', () => {
  let dispatcher: DragDispatcher2;
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let eventStream: Subject<DragBackendEvent>;
  let draggingDebugElement: DebugElement;
  let dragging: DropTargetDragging;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, DropTarget, DropTargetDragging],
      providers: [{ provide: DragDispatcher2, useClass: MockDispatcher }]
    });
    eventStream = new Subject();
    dispatcher = TestBed.get(DragDispatcher2);
    spyOn(dispatcher, 'connectDropTarget').and.returnValue(eventStream.asObservable());
    spyOn(dispatcher, 'dragging$').and.returnValue(
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
    draggingDebugElement = fixture.debugElement.query(By.directive(DropTargetDragging));
    dragging = draggingDebugElement.injector.get(DropTargetDragging);
  });

  it('should create', () => {
    expect(dragging).toBeTruthy();
  });

  it('should not append the specified class initially', () => {
    expect(draggingDebugElement.classes['is-dragging']).toBeFalsy();
  });

  it(
    'should append the specified class when an item is dragged',
    fakeAsync(() => {
      eventStream.next({
        type: DragBackendEventType.DRAG_START,
        clientOffset: { x: 0, y: 0 },
        sourceOffset: { x: 0, y: 0, width: 0, height: 0 },
        item: 'Test'
      });
      fixture.detectChanges();
      tick();
      expect(draggingDebugElement.classes['is-dragging']).toBeTruthy();
    })
  );

  it(
    'should remove the specified class when the drag finished',
    fakeAsync(() => {
      eventStream.next({
        type: DragBackendEventType.DRAG_START,
        clientOffset: { x: 0, y: 0 },
        sourceOffset: { x: 0, y: 0, width: 0, height: 0 },
        item: 'Test'
      });
      fixture.detectChanges();
      tick();
      expect(draggingDebugElement.classes['is-dragging']).toBeTruthy();
      eventStream.next({
        type: DragBackendEventType.DRAG_END,
        clientOffset: { x: 0, y: 0 },
        sourceOffset: { x: 0, y: 0, width: 0, height: 0 },
        item: 'Test'
      });
      fixture.detectChanges();
      tick();
      expect(draggingDebugElement.classes['is-dragging']).toBeFalsy();
    })
  );

  it(
    'should remove the specified class when an item was dropped',
    fakeAsync(() => {
      eventStream.next({
        type: DragBackendEventType.DRAG_START,
        clientOffset: { x: 0, y: 0 },
        sourceOffset: { x: 0, y: 0, width: 0, height: 0 },
        item: 'Test'
      });
      fixture.detectChanges();
      tick();
      expect(draggingDebugElement.classes['is-dragging']).toBeTruthy();
      eventStream.next({
        type: DragBackendEventType.DROP,
        clientOffset: { x: 0, y: 0 },
        sourceOffset: { x: 0, y: 0, width: 0, height: 0 },
        item: 'Test'
      });
      fixture.detectChanges();
      tick();
      expect(draggingDebugElement.classes['is-dragging']).toBeFalsy();
    })
  );

  it(
    'should immediately change the specified class when active',
    fakeAsync(() => {
      eventStream.next({
        type: DragBackendEventType.DRAG_START,
        clientOffset: { x: 0, y: 0 },
        sourceOffset: { x: 0, y: 0, width: 0, height: 0 },
        item: 'Test'
      });
      fixture.detectChanges();
      tick();
      expect(draggingDebugElement.classes['is-dragging']).toBeTruthy();
      component.activeClass = 'foo';
      fixture.detectChanges();
      tick();
      expect(draggingDebugElement.classes['is-over']).toBeFalsy();
      expect(draggingDebugElement.classes['foo']).toBeTruthy();
    })
  );
});
