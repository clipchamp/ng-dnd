import { TestBed, ComponentFixture } from '@angular/core/testing';
import { DragSource } from './drag-source.directive';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { DragDispatcher2 } from '../drag-dispatcher.service';
import { Subject } from 'rxjs';
import { DragBackendEvent } from '../backends/drag-backend-event';
import { DragBackendEventType } from '../backends/drag-backend-event-type';
import { take } from 'rxjs/operators';

@Component({
  template: `<div ccDragSource [item]="{ foo: 'bar' }" itemType="baz" *ngIf="showSource"></div>`
})
export class TestHostComponent {
  showSource = true;
}

class MockDispatcher {
  connectDragSource(): any {}
  disconnectDragSource(): void {}
}

describe('DragSource', () => {
  let dispatcher: DragDispatcher2;
  let connectSpy: jasmine.Spy;
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let sourceDebugElement: DebugElement;
  let source: DragSource;
  let eventStream: Subject<DragBackendEvent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestHostComponent, DragSource],
      providers: [
        {
          provide: DragDispatcher2,
          useClass: MockDispatcher
        }
      ]
    });

    eventStream = new Subject<DragBackendEvent>();
    dispatcher = TestBed.get(DragDispatcher2);
    connectSpy = spyOn(dispatcher, 'connectDragSource').and.returnValue(eventStream.asObservable());

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    sourceDebugElement = fixture.debugElement.query(By.directive(DragSource));
    source = sourceDebugElement.injector.get(DragSource);
  });

  it('should create', () => {
    expect(source).toBeTruthy();
  });

  it('should register itself with the drag dispatcher after view init', () => {
    expect(connectSpy).toHaveBeenCalledTimes(1);
    expect(connectSpy).toHaveBeenCalledWith(source, source.hostElement);
  });

  it('should deregister itself when destroyed', (done: any) => {
    const disconnectSpy = spyOn(dispatcher, 'disconnectDragSource').and.callThrough();
    (source as any).eventStream.subscribe(
      () => {},
      () => {},
      () => {
        expect(disconnectSpy).toHaveBeenCalledTimes(1);
        done();
      }
    );
    component.showSource = false;
    fixture.detectChanges();
  });

  describe('with dragging', () => {
    beforeEach(() => {
      eventStream.next({
        type: DragBackendEventType.DRAG_START,
        sourceId: 'test',
        clientOffset: {
          x: 100,
          y: 100
        }
      });
      fixture.detectChanges();
    });

    it('should set isDragging to true on drag start', () => {
      expect(source.isDragging).toBeTruthy();
    });

    it('should set isDragging to false on drag end', () => {
      eventStream.next({
        type: DragBackendEventType.DRAG_END,
        sourceId: 'test',
        clientOffset: {
          x: 100,
          y: 100
        }
      });
      fixture.detectChanges();
      expect(source.isDragging).toBeFalsy();
    });

    it('should set isDragging to false on drop', () => {
      eventStream.next({
        type: DragBackendEventType.DROP,
        sourceId: 'test',
        clientOffset: {
          x: 100,
          y: 100
        }
      });
      fixture.detectChanges();
      expect(source.isDragging).toBeFalsy();
    });

    it('should emit a dropped event', (done: any) => {
      source.dropped.pipe(take(1)).subscribe(payload => {
        expect(payload).toEqual({ foo: 'bar' });
        done();
      });
      eventStream.next({
        type: DragBackendEventType.DROP,
        sourceId: 'test',
        clientOffset: {
          x: 100,
          y: 100
        },
        item: source.item
      });
    });
  });
});
