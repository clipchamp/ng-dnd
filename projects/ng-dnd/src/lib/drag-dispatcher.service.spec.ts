import { TestBed } from '@angular/core/testing';
import { DragBackend } from './backends/drag-backend';
import { TestDragBackend, TEST_DRAG_BACKEND_PROVIDER } from './backends/test-drag-backend';
import { DragDispatcher2 } from './drag-dispatcher.service';

describe('DragDispatcher', () => {
  let dispatcher: DragDispatcher2;
  let backend: TestDragBackend;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TEST_DRAG_BACKEND_PROVIDER]
    });

    dispatcher = TestBed.get(DragDispatcher2);
    backend = TestBed.get(DragBackend);
  });

  it('should create', () => {
    expect(dispatcher).toBeTruthy();
  });

  it('should create a drag backend', () => {
    expect(backend).toBeTruthy();
  });
});
