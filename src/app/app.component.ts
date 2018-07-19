import {
  Component,
  ViewChildren,
  QueryList,
  ElementRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  AfterViewInit
} from '@angular/core';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { registerIcons } from './icons';
import {
  SIMPLE_TS_SOURCE,
  SIMPLE_HTML_SOURCE,
  SIMPLE_CSS_SOURCE
} from './example-1';
import { DragSource } from 'projects/ng-dnd/src/public_api';

function splice<T extends { id: string }>(
  index: number,
  array: T[],
  newItem: T
): T[] {
  return [
    ...array.slice(0, index).filter(candidate => candidate.id !== newItem.id),
    newItem,
    ...array.slice(index).filter(candidate => candidate.id !== newItem.id)
  ];
}

let id = 0;

@Component({
  selector: 'cc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  sideNav = false;
  sourceData = [
    { label: 'Item 1' },
    { label: 'Item 2' },
    { label: 'Item 3' },
    { label: 'Item 4' },
    { label: 'Item 5' }
  ];

  set originalTargetData(value: any) {
    this._targetData = value;
    this.targetData = [...value];
  }

  targetData: any;

  private _targetData: any;
  private itemBounds: any[] = [];

  @ViewChildren(DragSource) sources: QueryList<DragSource>;

  constructor(
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
    private cdRef: ChangeDetectorRef
  ) {
    registerIcons(iconRegistry, sanitizer);
    this.originalTargetData = [
      {
        id: '1',
        children: []
      },
      {
        id: '2',
        children: []
      }
    ];
  }

  onDrag(isDragging: boolean): void {
    if (isDragging) {
      this.cdRef.detach();
    } else {
      this.cdRef.reattach();
    }
  }

  onHover(event: any, target: any): void {
    if (event) {
      if (!!event.item.children) {
        let index2 = this.findByPosition(
          event.clientOffset,
          event.target,
          true
        );
        if (index2 < 0) {
          index2 = this._targetData.length;
        }
        this.targetData = splice(index2, this._targetData, event.item);
        return;
      }
      let index = this.findByPosition(event.clientOffset, event.target);
      const parentIdx = this._targetData.indexOf(target);
      const item = !event.item.id
        ? {
            ...event.item,
            id: +id,
            label: event.item.label,
            preview: true
          }
        : event.item;
      if (index < 0) {
        index = target.children.length;
      }
      this.targetData = splice(parentIdx, this._targetData, {
        ...target,
        children: splice(index, target.children, item)
      });
      this.cdRef.detectChanges();
    } else if (this._targetData !== this.targetData) {
      this.targetData = this._targetData;
      this.cdRef.detectChanges();
    }
  }

  onDrop(event: any, target: any): void {
    if (!!event.item.children) {
      let index2 = this.findByPosition(event.clientOffset, event.target, true);
      if (index2 < 0) {
        index2 = this._targetData.length;
      }
      this.originalTargetData = splice(index2, this._targetData, event.item);
      return;
    }
    let index = this.findByPosition(event.clientOffset, event.target);
    const parentIdx = this._targetData.indexOf(target);
    const item = !event.item.id
      ? {
          ...event.item,
          id: +id++,
          label: event.item.label
        }
      : event.item;
    if (index < 0) {
      index = target.children.length;
    }
    this.originalTargetData = splice(parentIdx, this._targetData, {
      ...target,
      children: splice(index, target.children, item)
    });
    this.cdRef.detectChanges();

    this.calculateBounds();
  }

  trackByFn(index: number, item: any): any {
    return item.id;
  }

  private calculateBounds(): void {
    this.itemBounds = this.sources.map(source => {
      return {
        source,
        parent: source.parent,
        bounds: source.bounds
      };
    });
  }

  private findByPosition({ x, y }: any, target: any, vertical = false): number {
    return this.itemBounds
      .filter(item => item.parent === target)
      .findIndex(
        item =>
          vertical
            ? y < item.bounds.top + item.bounds.height / 2
            : x < item.bounds.left + item.bounds.width / 2
      );
  }
}
