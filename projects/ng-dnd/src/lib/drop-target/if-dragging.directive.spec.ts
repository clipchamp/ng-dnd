import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { IfDragging } from './if-dragging.directive';
import { DropTarget } from './drop-target.directive';
import { DragBackendEventType } from '../backends/drag-backend-event-type';
import { DISPATCHER_STUB_PROVIDERS, DispatcherStubController } from '../testing/dispatcher-stub';

@Component({
  template: `<div ccDropTarget [itemType]="'test'"><ng-template ccIfDragging [hideWhenOver]="true"><div class="test"></div></ng-template></div>
    <div ccDropTarget [itemType]="'test2'"><div class="test2" *ccIfDragging></div></div>
    <div class="test3" *ccIfDragging></div>`
})
class TestComponent {}

describe('IfDragging', () => {
  let controller: DispatcherStubController;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, DropTarget, IfDragging],
      providers: DISPATCHER_STUB_PROVIDERS
    });
    controller = TestBed.get(DispatcherStubController);
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  it('should only create .test div when an item with type "test" is dragged', () => {
    controller.publish({
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
    controller.publish({
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
    controller.publish({
      type: DragBackendEventType.DRAG_START,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test'
    });
    fixture.detectChanges();
    const debugElement = fixture.debugElement.query(By.css('.test'));
    expect(debugElement).toBeTruthy();
    controller.publish({
      type: DragBackendEventType.DRAG_END,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test'
    });
    fixture.detectChanges();
    const debugElement2 = fixture.debugElement.query(By.css('.test'));
    expect(debugElement2).toBeFalsy();
  });

  it('should remove the div once the item was dropped', () => {
    controller.publish({
      type: DragBackendEventType.DRAG_START,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test'
    });
    fixture.detectChanges();
    const debugElement = fixture.debugElement.query(By.css('.test'));
    expect(debugElement).toBeTruthy();
    controller.publish({
      type: DragBackendEventType.DROP,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test'
    });
    fixture.detectChanges();
    const debugElement2 = fixture.debugElement.query(By.css('.test'));
    expect(debugElement2).toBeFalsy();
  });

  it('should remove the div once the drag has finished', () => {
    controller.publish({
      type: DragBackendEventType.DRAG_START,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test'
    });
    fixture.detectChanges();
    const debugElement = fixture.debugElement.query(By.css('.test'));
    expect(debugElement).toBeTruthy();
    controller.publish({
      type: DragBackendEventType.DRAG_END,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test'
    });
    fixture.detectChanges();
    const debugElement2 = fixture.debugElement.query(By.css('.test'));
    expect(debugElement2).toBeFalsy();
  });

  it('should remove the div when an item is dragged over the parent drop target', () => {
    controller.publish({
      type: DragBackendEventType.DRAG_START,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test'
    });
    fixture.detectChanges();
    const debugElement = fixture.debugElement.query(By.css('.test'));
    expect(debugElement).toBeTruthy();
    controller.publish({
      type: DragBackendEventType.DRAG_OVER,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test'
    });
    fixture.detectChanges();
    const debugElement2 = fixture.debugElement.query(By.css('.test'));
    expect(debugElement2).toBeFalsy();
  });

  it('should not remove the div when an item is dragged over the parent drop target', () => {
    controller.publish({
      type: DragBackendEventType.DRAG_START,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test2'
    });
    fixture.detectChanges();
    const debugElement = fixture.debugElement.query(By.css('.test2'));
    expect(debugElement).toBeTruthy();
    controller.publish({
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
    controller.publish({
      type: DragBackendEventType.DRAG_START,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test3'
    });
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.test3'))).toBeFalsy();
  });
});
