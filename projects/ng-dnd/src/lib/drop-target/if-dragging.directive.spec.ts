import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { filter, map, first } from 'rxjs/operators';
import { IfDragging } from './if-dragging.directive';
import { DropTarget } from './drop-target.directive';
import { DragDispatcher2 } from '../drag-dispatcher.service';
import { DragBackendEvent } from '../backends/drag-backend-event';
import { DragBackendEventType } from 'projects/ng-dnd/src/lib/backends/drag-backend-event-type';

class MockDispatcher {
  connectDropTarget(target: DropTarget, node: any): any {}
  disconnectDropTarget(): any {}
  dragging$(itemTypes: string[]): any {}
}

@Component({
  template: `<div ccDropTarget [itemType]="'test'"><ng-template ccIfDragging [hideWhenOver]="true"><div class="test"></div></ng-template></div>
    <div ccDropTarget [itemType]="'test2'"><div class="test2" *ccIfDragging></div></div>
    <div class="test3" *ccIfDragging></div>`
})
class TestComponent {}

describe('IfDragging', () => {
  let dispatcher: DragDispatcher2;
  let eventStream: Subject<DragBackendEvent>;
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, DropTarget, IfDragging],
      providers: [{ provide: DragDispatcher2, useClass: MockDispatcher }]
    });
    dispatcher = TestBed.get(DragDispatcher2);
    eventStream = new Subject();
    spyOn(dispatcher, 'connectDropTarget').and.returnValue(eventStream.asObservable());
    spyOn(dispatcher, 'dragging$').and.callFake(requestedItemType => {
      return eventStream.pipe(
        filter(
          ({ type, itemType }) =>
            (type === DragBackendEventType.DRAG_START ||
              type === DragBackendEventType.DRAG_END ||
              type === DragBackendEventType.DROP) &&
            itemType === requestedItemType
        ),
        map(({ type }) => type === DragBackendEventType.DRAG_START)
      );
    });
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should only create .test div when an item with type "test" is dragged', () => {
    eventStream.next({
      type: DragBackendEventType.DRAG_START,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test'
    });
    fixture.detectChanges();
    const debugElement = fixture.debugElement.query(By.css('.test'));
    expect(debugElement).toBeTruthy();
    const debugElement2 = fixture.debugElement.query(By.css('.test2'));
    expect(debugElement2).toBeFalsy();
  });

  it('should only create .test2 div when an item with type "test2" is dragged', () => {
    eventStream.next({
      type: DragBackendEventType.DRAG_START,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test2'
    });
    fixture.detectChanges();
    const debugElement = fixture.debugElement.query(By.css('.test'));
    expect(debugElement).toBeFalsy();
    const debugElement2 = fixture.debugElement.query(By.css('.test2'));
    expect(debugElement2).toBeTruthy();
  });

  it('should remove the div once the drag has finished', () => {
    eventStream.next({
      type: DragBackendEventType.DRAG_START,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test'
    });
    fixture.detectChanges();
    const debugElement = fixture.debugElement.query(By.css('.test'));
    expect(debugElement).toBeTruthy();
    eventStream.next({
      type: DragBackendEventType.DRAG_END,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test'
    });
    fixture.detectChanges();
    const debugElement2 = fixture.debugElement.query(By.css('.test'));
    expect(debugElement2).toBeFalsy();
  });

  it('should remove the div once the item was dropped', () => {
    eventStream.next({
      type: DragBackendEventType.DRAG_START,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test'
    });
    fixture.detectChanges();
    const debugElement = fixture.debugElement.query(By.css('.test'));
    expect(debugElement).toBeTruthy();
    eventStream.next({
      type: DragBackendEventType.DROP,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test'
    });
    fixture.detectChanges();
    const debugElement2 = fixture.debugElement.query(By.css('.test'));
    expect(debugElement2).toBeFalsy();
  });

  it('should remove the div once the drag has finished', () => {
    eventStream.next({
      type: DragBackendEventType.DRAG_START,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test'
    });
    fixture.detectChanges();
    const debugElement = fixture.debugElement.query(By.css('.test'));
    expect(debugElement).toBeTruthy();
    eventStream.next({
      type: DragBackendEventType.DRAG_END,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test'
    });
    fixture.detectChanges();
    const debugElement2 = fixture.debugElement.query(By.css('.test'));
    expect(debugElement2).toBeFalsy();
  });

  it('should remove the div when an item is dragged over the parent drop target', () => {
    eventStream.next({
      type: DragBackendEventType.DRAG_START,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test'
    });
    fixture.detectChanges();
    const debugElement = fixture.debugElement.query(By.css('.test'));
    expect(debugElement).toBeTruthy();
    eventStream.next({
      type: DragBackendEventType.DRAG_OVER,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test'
    });
    fixture.detectChanges();
    const debugElement2 = fixture.debugElement.query(By.css('.test'));
    expect(debugElement2).toBeFalsy();
  });

  it('should not remove the div when an item is dragged over the parent drop target', () => {
    eventStream.next({
      type: DragBackendEventType.DRAG_START,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test2'
    });
    fixture.detectChanges();
    const debugElement = fixture.debugElement.query(By.css('.test2'));
    expect(debugElement).toBeTruthy();
    eventStream.next({
      type: DragBackendEventType.DRAG_OVER,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test2'
    });
    fixture.detectChanges();
    const debugElement2 = fixture.debugElement.query(By.css('.test2'));
    expect(debugElement2).toBeTruthy();
  });

  it('should not create when not used in a drop target', () => {
    expect(fixture.debugElement.query(By.css('.test3'))).toBeFalsy();
    eventStream.next({
      type: DragBackendEventType.DRAG_START,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test3'
    });
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.test3'))).toBeFalsy();
  });
});
