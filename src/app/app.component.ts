import { Component } from '@angular/core';
import { DragBackendEvent } from 'projects/drag-n-drop/src/public_api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  sideNav = false;
  simpleSources = [1, 2, 3];
  simpleSources2 = [];

  simpleDrop({ item }: any): void {
    this.simpleSources = this.simpleSources.filter(
      candidate => candidate !== item
    );
    this.simpleSources2 = [...this.simpleSources2, item];
  }

  simpleDrop2({ item }: any): void {
    this.simpleSources2 = this.simpleSources2.filter(
      candidate => candidate !== item
    );
    this.simpleSources = [...this.simpleSources, item];
  }
}
