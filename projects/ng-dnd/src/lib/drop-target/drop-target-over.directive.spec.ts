import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TestBed, ComponentFixture, tick, fakeAsync } from '@angular/core/testing';
import { DropTarget } from './drop-target.directive';
import { DropTargetIsOver } from './drop-target-over.directive';
import { DragBackendEventType } from '../backends/drag-backend-event-type';
import { DISPATCHER_STUB_PROVIDERS, DispatcherStubController } from '../testing/dispatcher-stub';

@Component({
  template: `<div ccDropTarget [itemType]="'test'" [ccDropTargetOver]="activeClass"></div>`
})
class TestComponent {
  activeClass = 'is-over';
}

describe('DropTargetOver', () => {
  let controller: DispatcherStubController;
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let isOverDebugElement: DebugElement;
  let isOver: DropTargetIsOver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, DropTarget, DropTargetIsOver],
      providers: DISPATCHER_STUB_PROVIDERS
    });
    controller = TestBed.get(DispatcherStubController);
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
      controller.publish({
        type: DragBackendEventType.DRAG_OVER,
        clientOffset: { x: 0, y: 0 },
        sourceOffset: { x: 0, y: 0, width: 0, height: 0 },
        itemType: 'test'
      });
      fixture.detectChanges();
      tick();
      expect(isOverDebugElement.classes['is-over']).toBeTruthy();
    })
  );

  it(
    'should remove the specified class when an item is dragged out of the drop target',
    fakeAsync(() => {
      controller.publish({
        type: DragBackendEventType.DRAG_OVER,
        clientOffset: { x: 0, y: 0 },
        sourceOffset: { x: 0, y: 0, width: 0, height: 0 },
        itemType: 'test'
      });
      fixture.detectChanges();
      tick();
      expect(isOverDebugElement.classes['is-over']).toBeTruthy();
      controller.publish({
        type: DragBackendEventType.DRAG_OUT,
        clientOffset: { x: 0, y: 0 },
        sourceOffset: { x: 0, y: 0, width: 0, height: 0 },
        itemType: 'test'
      });
      fixture.detectChanges();
      tick();
      expect(isOverDebugElement.classes['is-over']).toBeFalsy();
    })
  );

  it(
    'should remove the specified class when the drag finishes',
    fakeAsync(() => {
      controller.publish({
        type: DragBackendEventType.DRAG_OVER,
        clientOffset: { x: 0, y: 0 },
        sourceOffset: { x: 0, y: 0, width: 0, height: 0 },
        itemType: 'test'
      });
      fixture.detectChanges();
      tick();
      expect(isOverDebugElement.classes['is-over']).toBeTruthy();
      controller.publish({
        type: DragBackendEventType.DROP,
        clientOffset: { x: 0, y: 0 },
        sourceOffset: { x: 0, y: 0, width: 0, height: 0 },
        itemType: 'test'
      });
      fixture.detectChanges();
      tick();
      expect(isOverDebugElement.classes['is-over']).toBeFalsy();
    })
  );

  it(
    'should immediately change the specified class when active',
    fakeAsync(() => {
      controller.publish({
        type: DragBackendEventType.DRAG_OVER,
        clientOffset: { x: 0, y: 0 },
        sourceOffset: { x: 0, y: 0, width: 0, height: 0 },
        itemType: 'test'
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
