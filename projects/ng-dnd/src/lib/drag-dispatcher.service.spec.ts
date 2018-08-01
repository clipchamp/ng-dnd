import { DragDispatcher2 } from './drag-dispatcher.service';
import { TestBed } from '@angular/core/testing';
import { DRAG_BACKEND, DragBackendFactory } from './backends/drag-backend-factory';
import { testDragBackendFactory, TestDragBackend } from './backends/test-drag-backend';
import { DragMonitor } from './drag-monitor';

describe('DragDispatcher', () => {
  let dispatcher: DragDispatcher2;
  let backend: TestDragBackend;
  let backendFactory: DragBackendFactory;

  beforeEach(() => {
    backendFactory = jasmine.createSpy('backendFactory').and.callFake((monitor: DragMonitor) => {
      backend = testDragBackendFactory()(monitor) as any;
      return backend;
    });

    TestBed.configureTestingModule({
      providers: [
        DragDispatcher2,
        {
          provide: DRAG_BACKEND,
          useValue: backendFactory
        }
      ]
    });

    dispatcher = TestBed.get(DragDispatcher2);
  });

  it('should create', () => {
    expect(dispatcher).toBeTruthy();
  });

  it('should create a drag backend', () => {
    expect(backendFactory).toHaveBeenCalledWith(jasmine.any(DragMonitor));
    expect(backend).toBeTruthy();
  });
});
