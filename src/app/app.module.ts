import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {
  DragModule,
  html5DragBackendFactory,
  DRAG_BACKEND
} from 'dist/drag-n-drop';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatToolbarModule,
  MatSidenavModule,
  MatIconModule,
  MatButtonModule,
  MatCardModule,
  MatGridListModule
} from '@angular/material';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    DragModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    MatCardModule
  ],
  providers: [
    {
      provide: DRAG_BACKEND,
      useFactory: html5DragBackendFactory
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
