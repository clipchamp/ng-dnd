import {
  ContentChild,
  Input,
  Component,
  AfterContentInit,
  OnDestroy,
  AfterViewInit,
  QueryList,
  ContentChildren,
  ElementRef
} from '@angular/core';
import { DragItem } from './drag-item.directive';
import { DropTarget } from './drop-target.directive';
import { Subject } from 'rxjs';
import { DragSource } from './drag-source.directive';
import { Coordinates } from './backends/offset';
import { DragBackendEventType } from './backends/drag-backend-event-type';
import {
  takeUntil,
  finalize,
  max
} from '../../../../node_modules/rxjs/operators';

interface Bounds {
  center: Coordinates;
  left: number;
  top: number;
  right: number;
  bottom: number;
  source: DragSource;
}

function attach(node: any, newParent: any, before?: any, copy = false): any {
  const parent = node.parentNode;
  const next = node.nextSibling;
  if (copy) {
    node = node.cloneNode(true);
  } else {
    parent.removeChild(node);
  }
  newParent.insertBefore(node, before);
  return () => {
    newParent.removeChild(node);
    if (!copy) {
      parent.insertBefore(node, next);
    }
  };
}

@Component({
  selector: 'cc-drag-container,[ccDragContainer]',
  templateUrl: './drag-container.component.html',
  styles: [``]
})
// tslint:disable-next-line:component-class-suffix
export class DragContainer<T = any>
  implements AfterContentInit, AfterViewInit, OnDestroy {
  @Input()
  set ccDragContainer(items: T[]) {
    if (Array.isArray(items)) {
      this.items = items;
    } else {
      this.items = [items];
    }
  }

  @Input() copy = false;

  @ContentChild(DragItem) sourceItem: DragItem;
  @ContentChildren(DragSource) sources: QueryList<DragSource>;
  @ContentChild(DropTarget) target: DropTarget;

  get hostElement(): any {
    return this.elementRef.nativeElement;
  }

  items: T[];

  private sourceBounds: Bounds[] = [];
  private selector: 'x' | 'y' = 'x';
  private destroyed = new Subject<void>();

  constructor(private readonly elementRef: ElementRef) {}

  ngAfterContentInit(): void {
    if (this.target) {
      let preview: any = () => {};
      let lastPos = -2;
      this.target.eventStream$
        .pipe(
          takeUntil(this.destroyed),
          finalize(() => preview())
        )
        .subscribe(({ type, source, clientOffset }) => {
          // TODO: Cleanup
          if (
            type !== DragBackendEventType.DRAG_ENTER &&
            type !== DragBackendEventType.DRAG_OVER
          ) {
            preview();
            preview = () => {};
            lastPos = -2;
          } else {
            const pos = this.findPositionForCoordinates(clientOffset);
            if (pos > -1 && pos !== lastPos) {
              if (
                this.sourceBounds[pos].source.hostElement === source.hostElement
              ) {
                return;
              }
              preview();
              preview = attach(
                source.hostElement,
                this.hostElement,
                this.sourceBounds[pos].source.hostElement,
                source.container && source.container.copy
              );
            } else if (pos !== lastPos) {
              preview();
              preview = attach(
                source.hostElement,
                this.hostElement,
                null,
                source.container && source.container.copy
              );
            }
            lastPos = pos;
          }
        });
      this.target.dropped
        .pipe(takeUntil(this.destroyed))
        .subscribe(({ clientOffset, item }) => {
          const pos = this.findPositionForCoordinates(clientOffset);
          item = Array.isArray(item) ? [...item] : { ...item };
          if (pos > -1) {
            this.items.splice(pos, 0, item);
          } else {
            this.items.push(item);
          }
        });
    }
  }

  ngAfterViewInit(): void {
    if (this.sources) {
      this.sources.changes.subscribe(_ => this.registerSources());
    }
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  private findPositionForCoordinates(coords: Coordinates): number {
    return this.sourceBounds.findIndex(
      bounds => coords[this.selector] <= bounds.center[this.selector]
    );
  }

  private registerSources(): void {
    this.sources.forEach(source => {
      source.container = this;
      return source.dropped
        .pipe(takeUntil(this.sources.changes))
        .subscribe(() => {
          if (!this.copy) {
            const position = this.items.indexOf(source.item);
            this.items.splice(position, 1);
          }
        });
    });
    Promise.resolve().then(() => {
      const equals = { x: {}, y: {} };
      this.sourceBounds = this.sources.map(source => {
        const {
          top,
          left,
          right,
          bottom,
          width,
          height
        } = source.hostElement.getBoundingClientRect();

        if (equals.x[left]) {
          equals.x[left] += 1;
        } else {
          equals.x[left] = 1;
        }
        if (equals.y[top]) {
          equals.y[top] += 1;
        } else {
          equals.y[top] = 1;
        }

        return {
          center: {
            x: left + width / 2,
            y: top + height / 2
          },
          left,
          top,
          right,
          bottom,
          source
        };
      });

      const maxX = Object.keys(equals.x).reduce(
        (xMax, x) => Math.max(xMax, equals.x[x]),
        0
      );
      const maxY = Object.keys(equals.y).reduce(
        (yMax, y) => Math.max(yMax, equals.y[y]),
        0
      );

      this.selector = maxX < maxY ? 'x' : 'y';

      this.sourceBounds = this.sourceBounds.sort(
        (boundA, boundB) =>
          boundA.center[this.selector] < boundB.center[this.selector] ? -1 : 1
      );
    });
  }
}
