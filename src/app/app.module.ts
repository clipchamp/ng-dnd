import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {
  DragModule,
  html5DragBackendFactory,
  DRAG_BACKEND
} from 'dist/drag-n-drop';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, DragModule],
  providers: [
    {
      provide: DRAG_BACKEND,
      useFactory: html5DragBackendFactory
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
