import { Component, ViewChildren, QueryList, ChangeDetectionStrategy, NgZone } from '@angular/core';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { registerIcons } from './icons';
import { DragSource } from 'projects/ng-dnd/src/public_api';

function splice<T extends { id: string }>(index: number, array: T[], newItem: T): T[] {
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
  nativeFileDrops: File[] = [];
  nativeStringDrops: string[] = [];

  private _targetData: any;
  private itemBounds: any[] = [];

  @ViewChildren(DragSource) sources: QueryList<DragSource>;

  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    registerIcons(iconRegistry, sanitizer);
    this.originalTargetData = [
      {
        id: '1',
        children: []
      },
      {
        id: '2',
        children: []
      },
      {
        id: '3',
        children: []
      }
    ];
  }

  onHover(event: any, target?: any): void {
    if (event) {
      if (!!event.item.children && !target) {
        let index2 = this.findByPosition(event.clientOffset, event.target, true);
        if (index2 < 0) {
          index2 = this._targetData.length;
        }
        this.targetData = splice(index2, this._targetData, event.item);
        return;
      }
      let index = this.findByPosition(event.clientOffset, event.target);
      const parentIdx = this._targetData.findIndex(container => container.id === target.id);
      const item =
        event.item.id === undefined
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
    } else if (this._targetData !== this.targetData) {
      this.targetData = this._targetData;
    }
  }

  onDrop(event: any, target?: any): void {
    console.warn('Is in angular zone?', NgZone.isInAngularZone());
    if (!!event.item.children && !target) {
      let index2 = this.findByPosition(event.clientOffset, event.target, true);
      if (index2 < 0) {
        index2 = this._targetData.length;
      }
      this.originalTargetData = splice(index2, this._targetData, event.item);
      return;
    }
    let index = this.findByPosition(event.clientOffset, event.target);
    const parentIdx = this._targetData.findIndex(container => container.id === target.id);
    const item =
      event.item.id === undefined
        ? {
            ...event.item,
            id: +id++,
            label: event.item.label
          }
        : event.item;
    if (index < 0) {
      index = target.children.length;
    }
    this.originalTargetData = splice(
      parentIdx,
      this._targetData
        .filter(t => t !== target)
        .map(t => ({ ...t, children: t.children.filter(c => c !== item) })),
      {
        ...target,
        children: splice(index, target.children, item)
      }
    );

    this.calculateBounds();
  }

  onNativeFileDrop(event: any): void {
    if (Array.isArray(event.item)) {
      this.nativeFileDrops = [...this.nativeFileDrops, ...event.item];
    }
  }

  onNativeStringDrop(event: any): void {
    if (Array.isArray(event.item)) {
      this.nativeStringDrops = [...this.nativeStringDrops, ...event.item];
    }
  }

  trackByFn(index: number, item: any): any {
    return item.id;
  }

  addTarget(): void {
    const last = this._targetData[this._targetData.length - 1];
    const newId = +last.id + 1;
    this.originalTargetData = [
      ...this._targetData,
      {
        id: newId + '',
        children: []
      }
    ];
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
