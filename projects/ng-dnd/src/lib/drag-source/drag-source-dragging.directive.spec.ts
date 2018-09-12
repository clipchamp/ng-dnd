import { Component, DebugElement } from '@angular/core';
import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { DragSource } from './drag-source.directive';
import { DragSourceDragging } from './drag-source-dragging.directive';
import { DISPATCHER_STUB_PROVIDERS, DispatcherStubController } from '../testing/dispatcher-stub';
import { By } from '@angular/platform-browser';
import { DragBackendEventType } from 'projects/ng-dnd/src/lib/backends/drag-backend-event-type';

@Component({
  template: `<div ccDragSource itemType="foo" [ccDragSourceDragging]="activeClass"></div>`
})
class TestComponent {
  activeClass = 'is-dragging';
}

describe('DragSourceDragging', () => {
  let controller: DispatcherStubController;
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let draggingDebugElement: DebugElement;
  let dragging: DragSourceDragging;
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DragSource, DragSourceDragging, TestComponent],
      providers: DISPATCHER_STUB_PROVIDERS
    });
    controller = TestBed.get(DispatcherStubController);
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    draggingDebugElement = fixture.debugElement.query(By.directive(DragSourceDragging));
    dragging = draggingDebugElement.injector.get(DragSourceDragging);
  });

  it('should create', () => {
    expect(dragging).toBeTruthy();
  });

  it('should not add the class initially', () => {
    expect(draggingDebugElement.classes['is-dragging']).toBeFalsy();
  });

  it(
    'should add the class when the source is dragged',
    fakeAsync(() => {
      controller.publish({
        type: DragBackendEventType.DRAG_START,
        clientOffset: { x: 0, y: 0 },
        itemType: 'foo'
      });
      fixture.detectChanges();
      tick();
      expect(draggingDebugElement.classes['is-dragging']).toBeTruthy();
    })
  );

  it(
    'should remove the class when the source is not dragged anymore',
    fakeAsync(() => {
      controller.publish({
        type: DragBackendEventType.DRAG_START,
        clientOffset: { x: 0, y: 0 },
        itemType: 'foo'
      });
      fixture.detectChanges();
      tick();
      expect(draggingDebugElement.classes['is-dragging']).toBeTruthy();
      controller.publish({
        type: DragBackendEventType.DRAG_END,
        clientOffset: { x: 0, y: 0 },
        itemType: 'foo'
      });
      fixture.detectChanges();
      tick();
      expect(draggingDebugElement.classes['is-dragging']).toBeFalsy();
    })
  );

  it(
    'should remove the class when the source is dropped',
    fakeAsync(() => {
      controller.publish({
        type: DragBackendEventType.DRAG_START,
        clientOffset: { x: 0, y: 0 },
        itemType: 'foo'
      });
      fixture.detectChanges();
      tick();
      expect(draggingDebugElement.classes['is-dragging']).toBeTruthy();
      controller.publish({
        type: DragBackendEventType.DROP,
        clientOffset: { x: 0, y: 0 },
        itemType: 'foo'
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
        itemType: 'foo'
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
