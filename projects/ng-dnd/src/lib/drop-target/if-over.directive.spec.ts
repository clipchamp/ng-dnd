import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { DropTarget } from './drop-target.directive';
import { IfOver } from './if-over.directive';
import { DragBackendEventType } from '../backends/drag-backend-event-type';
import { DISPATCHER_STUB_PROVIDERS, DispatcherStubController } from '../testing/dispatcher-stub';

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
  let controller: DispatcherStubController;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, DropTarget, IfOver],
      providers: DISPATCHER_STUB_PROVIDERS
    });
    controller = TestBed.get(DispatcherStubController);
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  it('should create when dragging an item over the parent drop target', () => {
    expect(fixture.debugElement.query(By.css('.test'))).toBeFalsy();
    controller.publish({
      type: DragBackendEventType.DRAG_OVER,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test'
    });
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.test'))).toBeTruthy();
  });

  it('should remove when dragging an item out of the parent drop target', () => {
    expect(fixture.debugElement.query(By.css('.test'))).toBeFalsy();
    controller.publish({
      type: DragBackendEventType.DRAG_OVER,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test'
    });
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.test'))).toBeTruthy();
    controller.publish({
      type: DragBackendEventType.DRAG_OUT,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test'
    });
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.test'))).toBeFalsy();
  });

  it('should remove when the item is dropped', () => {
    expect(fixture.debugElement.query(By.css('.test'))).toBeFalsy();
    controller.publish({
      type: DragBackendEventType.DRAG_OVER,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test'
    });
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.test'))).toBeTruthy();
    controller.publish({
      type: DragBackendEventType.DROP,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test'
    });
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.test'))).toBeFalsy();
  });

  it('should not create when not used in a drop target', () => {
    expect(fixture.debugElement.query(By.css('.test2'))).toBeFalsy();
    controller.publish({
      type: DragBackendEventType.DRAG_OVER,
      clientOffset: { x: 0, y: 0 },
      itemType: 'test2'
    });
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.test2'))).toBeFalsy();
  });
});
