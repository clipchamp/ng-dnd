import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TestBed, ComponentFixture, tick, fakeAsync } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { DropTarget } from './drop-target.directive';
import { DropTargetIsOver } from './drop-target-over.directive';
import { DragDispatcher2 } from '../drag-dispatcher.service';
import { DragBackendEvent } from '../backends/drag-backend-event';
import { DragBackendEventType } from '../backends/drag-backend-event-type';

class MockDispatcher {
  connectDropTarget(target: DropTarget, node: any): any {}
  disconnectDropTarget(): any {}
  dragging$(itemTypes: string[]): any {
    return of(false);
  }
}

@Component({
  template: `<div ccDropTarget [itemType]="'test'" [ccDropTargetOver]="activeClass"></div>`
})
class TestComponent {
  activeClass = 'is-over';
}

describe('DropTargetOver', () => {
  let dispatcher: DragDispatcher2;
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let eventStream: Subject<DragBackendEvent>;
  let isOverDebugElement: DebugElement;
  let isOver: DropTargetIsOver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, DropTarget, DropTargetIsOver],
      providers: [{ provide: DragDispatcher2, useClass: MockDispatcher }]
    });
    eventStream = new Subject();
    dispatcher = TestBed.get(DragDispatcher2);
    spyOn(dispatcher, 'connectDropTarget').and.returnValue(eventStream.asObservable());
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    isOverDebugElement = fixture.debugElement.query(By.directive(DropTargetIsOver));
    isOver = isOverDebugElement.injector.get(DropTargetIsOver);
  });

  it('should create', () => {
    expect(isOver).toBeTruthy();
  });

  it('should not append the specified class initially', () => {
    expect(isOverDebugElement.classes['is-over']).toBeFalsy();
  });

  it(
    'should append the specified class when an item is dragged over the drop target',
    fakeAsync(() => {
      eventStream.next({
        type: DragBackendEventType.DRAG_OVER,
        clientOffset: { x: 0, y: 0 },
        sourceOffset: { x: 0, y: 0, width: 0, height: 0 },
        item: 'Test'
      });
      fixture.detectChanges();
      tick();
      expect(isOverDebugElement.classes['is-over']).toBeTruthy();
    })
  );

  it(
    'should remove the specified class when an item is dragged out of the drop target',
    fakeAsync(() => {
      eventStream.next({
        type: DragBackendEventType.DRAG_OVER,
        clientOffset: { x: 0, y: 0 },
        sourceOffset: { x: 0, y: 0, width: 0, height: 0 },
        item: 'Test'
      });
      fixture.detectChanges();
      tick();
      expect(isOverDebugElement.classes['is-over']).toBeTruthy();
      eventStream.next({
        type: DragBackendEventType.DRAG_OUT,
        clientOffset: { x: 0, y: 0 },
        sourceOffset: { x: 0, y: 0, width: 0, height: 0 },
        item: 'Test'
      });
      fixture.detectChanges();
      tick();
      expect(isOverDebugElement.classes['is-over']).toBeFalsy();
    })
  );

  it(
    'should remove the specified class when the drag finishes',
    fakeAsync(() => {
      eventStream.next({
        type: DragBackendEventType.DRAG_OVER,
        clientOffset: { x: 0, y: 0 },
        sourceOffset: { x: 0, y: 0, width: 0, height: 0 },
        item: 'Test'
      });
      fixture.detectChanges();
      tick();
      expect(isOverDebugElement.classes['is-over']).toBeTruthy();
      eventStream.next({
        type: DragBackendEventType.DROP,
        clientOffset: { x: 0, y: 0 },
        sourceOffset: { x: 0, y: 0, width: 0, height: 0 },
        item: 'Test'
      });
      fixture.detectChanges();
      tick();
      expect(isOverDebugElement.classes['is-over']).toBeFalsy();
    })
  );

  it(
    'should immediately change the specified class when active',
    fakeAsync(() => {
      eventStream.next({
        type: DragBackendEventType.DRAG_OVER,
        clientOffset: { x: 0, y: 0 },
        sourceOffset: { x: 0, y: 0, width: 0, height: 0 },
        item: 'Test'
      });
      fixture.detectChanges();
      tick();
      expect(isOverDebugElement.classes['is-over']).toBeTruthy();
      component.activeClass = 'foo';
      fixture.detectChanges();
      tick();
      expect(isOverDebugElement.classes['is-over']).toBeFalsy();
      expect(isOverDebugElement.classes['foo']).toBeTruthy();
    })
  );
});
