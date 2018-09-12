import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TestBed, ComponentFixture, tick, fakeAsync } from '@angular/core/testing';
import { DropTarget } from './drop-target.directive';
import { DropTargetDragging } from './drop-target-dragging.directive';
import { DragBackendEventType } from '../backends/drag-backend-event-type';
import { DISPATCHER_STUB_PROVIDERS, DispatcherStubController } from '../testing/dispatcher-stub';

@Component({
  template: `<div ccDropTarget [itemType]="'test'" [ccDropTargetDragging]="activeClass"></div>`
})
class TestComponent {
  activeClass = 'is-dragging';
}

describe('DropTargetDragging', () => {
  let controller: DispatcherStubController;
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let draggingDebugElement: DebugElement;
  let dragging: DropTargetDragging;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, DropTarget, DropTargetDragging],
      providers: DISPATCHER_STUB_PROVIDERS
    });
    controller = TestBed.get(DispatcherStubController);
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
      controller.publish({
        type: DragBackendEventType.DRAG_START,
        clientOffset: { x: 0, y: 0 },
        sourceOffset: { x: 0, y: 0, width: 0, height: 0 },
        itemType: 'test'
      });
      fixture.detectChanges();
      tick();
      expect(draggingDebugElement.classes['is-dragging']).toBeTruthy();
    })
  );

  it(
    'should remove the specified class when the drag finished',
    fakeAsync(() => {
      controller.publish({
        type: DragBackendEventType.DRAG_START,
        clientOffset: { x: 0, y: 0 },
        sourceOffset: { x: 0, y: 0, width: 0, height: 0 },
        itemType: 'test'
      });
      fixture.detectChanges();
      tick();
      expect(draggingDebugElement.classes['is-dragging']).toBeTruthy();
      controller.publish({
        type: DragBackendEventType.DRAG_END,
        clientOffset: { x: 0, y: 0 },
        sourceOffset: { x: 0, y: 0, width: 0, height: 0 },
        itemType: 'test'
      });
      fixture.detectChanges();
      tick();
      expect(draggingDebugElement.classes['is-dragging']).toBeFalsy();
    })
  );

  it(
    'should remove the specified class when an item was dropped',
    fakeAsync(() => {
      controller.publish({
        type: DragBackendEventType.DRAG_START,
        clientOffset: { x: 0, y: 0 },
        sourceOffset: { x: 0, y: 0, width: 0, height: 0 },
        itemType: 'test'
      });
      fixture.detectChanges();
      tick();
      expect(draggingDebugElement.classes['is-dragging']).toBeTruthy();
      controller.publish({
        type: DragBackendEventType.DROP,
        clientOffset: { x: 0, y: 0 },
        sourceOffset: { x: 0, y: 0, width: 0, height: 0 },
        itemType: 'test'
      });
      fixture.detectChanges();
      tick();
      expect(draggingDebugElement.classes['is-dragging']).toBeFalsy();
    })
  );

  it(
    'should immediately change the specified class when active',
    fakeAsync(() => {
      controller.publish({
        type: DragBackendEventType.DRAG_START,
        clientOffset: { x: 0, y: 0 },
        sourceOffset: { x: 0, y: 0, width: 0, height: 0 },
        itemType: 'test'
      });
      fixture.detectChanges();
      tick();
      expect(draggingDebugElement.classes['is-dragging']).toBeTruthy();
      component.activeClass = 'foo';
      fixture.detectChanges();
      tick();
      expect(draggingDebugElement.classes['is-dragging']).toBeFalsy();
      expect(draggingDebugElement.classes['foo']).toBeTruthy();
    })
  );
});
