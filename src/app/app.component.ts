import { Component } from '@angular/core';
import { DragBackendEvent } from 'projects/drag-n-drop/src/public_api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  accept = 'This';

  sources = ['This', 'Is', 'A', 'Test'];

  canDrop(item: any): boolean {
    return item === this.accept;
  }

  onDrop(event: DragBackendEvent): void {
    console.warn(event);
  }

  onMouseOver(): void {
    console.warn('mouseover');
  }
}
