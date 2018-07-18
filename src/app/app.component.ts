import {
  Component,
  ViewChildren,
  QueryList,
  ElementRef,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { registerIcons } from './icons';
import {
  SIMPLE_TS_SOURCE,
  SIMPLE_HTML_SOURCE,
  SIMPLE_CSS_SOURCE
} from './example-1';

let id = 0;

@Component({
  selector: 'cc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements AfterViewInit {
  sideNav = false;
  simpleSources = [
    { label: 'Item 1' },
    { label: 'Item 2' },
    { label: 'Item 3' },
    { label: 'Item 4' }
  ];
  simpleTargets = [];
  simpleTsSource = SIMPLE_TS_SOURCE;
  simpleHtmlSource = SIMPLE_HTML_SOURCE;
  simpleCssSource = SIMPLE_CSS_SOURCE;
  hozSources = [
    { label: 'Item 1' },
    { label: 'Item 2' },
    { label: 'Item 3' },
    { label: 'Item 4' }
  ];
  hozTargets = [];

  sourceData = [
    { label: 'Item 1', source: true },
    { label: 'Item 2', source: true }
  ];
  set originalData(value: any) {
    this._data = value;
    this.data = [...value];
  }
  data: any;

  private itemBounds: any[] = [];
  private _data: any;

  @ViewChildren('targetItem', { read: ElementRef })
  targetItems: QueryList<ElementRef>;

  constructor(
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
    private cdRef: ChangeDetectorRef
  ) {
    registerIcons(iconRegistry, sanitizer);
    this.originalData = [];
  }

  ngAfterViewInit(): void {
    this.cdRef.detach();
  }

  onHover(event: any): void {
    this.data = this._data;
    if (event) {
      const index = this.findPosition(event.clientOffset);
      const item = event.item.source
        ? {
            ...event.item,
            label: event.item.label + `.${id}`,
            source: undefined
          }
        : event.item;
      if (index > -1) {
        this.data = [
          ...this.data.slice(0, index).filter(candidate => candidate !== item),
          item,
          ...this.data.slice(index).filter(candidate => candidate !== item)
        ];
      } else {
        this.data = [
          ...this.data.filter(candidate => candidate !== item),
          item
        ];
      }
    }
    this.cdRef.detectChanges();
  }

  onDrop(event: any): void {
    const index = this.findPosition(event.clientOffset);
    const item = event.item.source
      ? {
          ...event.item,
          label: event.item.label + `.${id++}`,
          source: undefined
        }
      : event.item;
    if (index > -1) {
      this.originalData = [
        ...this._data.slice(0, index).filter(candidate => candidate !== item),
        item,
        ...this._data.slice(index).filter(candidate => candidate !== item)
      ];
    } else {
      this.originalData = [
        ...this._data.filter(candidate => candidate !== item),
        item
      ];
    }
    this.cdRef.detectChanges();

    this.itemBounds = this.targetItems
      .map(item => item.nativeElement.getBoundingClientRect())
      .filter(bound => !!bound);
  }

  private findPosition({ y }: any): number {
    return this.itemBounds.findIndex(
      bounds => y < bounds.top + bounds.height / 2
    );
  }
}
