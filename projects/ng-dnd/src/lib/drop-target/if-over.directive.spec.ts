import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { DropTarget } from './drop-target.directive';
import { IfOver } from './if-over.directive';
import { DragDispatcher2 } from '../drag-dispatcher.service';
import { DragBackendEvent } from '../backends/drag-backend-event';
import { DragBackendEventType } from '../backends/drag-backend-event-type';

class MockDispatcher {
  connectDropTarget(target: DropTarget, node: any): any {}
  disconnectDropTarget(): any {}
  dragging$(itemTypes: string[]): any {}
}

@Component({
  template: `<div ccDropTarget [itemType]="'test'"><div class="test" *ccIfOver></div></div>
  <div class="test2" *ccIfOver></div>`
})
class TestComponent {}

describe('IfOver', () => {
  let dispatcher: DragDispatcher2;
  let eventStream: Subject<DragBackendEvent>;
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, DropTarget, IfOver],
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

  it('should create when dragging an item over the parent drop target', () => {
    expect(fixture.debugElement.query(By.css('.test'))).toBeFalsy();
    eventStream.next({
      type: DragBackendEventType.DRAG_OVER,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test'
    });
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.test'))).toBeTruthy();
  });

  it('should remove when dragging an item out of the parent drop target', () => {
    expect(fixture.debugElement.query(By.css('.test'))).toBeFalsy();
    eventStream.next({
      type: DragBackendEventType.DRAG_OVER,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test'
    });
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.test'))).toBeTruthy();
    eventStream.next({
      type: DragBackendEventType.DRAG_OUT,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test'
    });
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.test'))).toBeFalsy();
  });

  it('should remove when the item is dropped', () => {
    expect(fixture.debugElement.query(By.css('.test'))).toBeFalsy();
    eventStream.next({
      type: DragBackendEventType.DRAG_OVER,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test'
    });
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.test'))).toBeTruthy();
    eventStream.next({
      type: DragBackendEventType.DROP,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test'
    });
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.test'))).toBeFalsy();
  });

  it('should not create when not used in a drop target', () => {
    expect(fixture.debugElement.query(By.css('.test2'))).toBeFalsy();
    eventStream.next({
      type: DragBackendEventType.DRAG_OVER,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test2'
    });
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.test2'))).toBeFalsy();
  });
});
