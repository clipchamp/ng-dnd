import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HighlightModule } from 'ngx-highlightjs';
import {
  MatToolbarModule,
  MatSidenavModule,
  MatIconModule,
  MatButtonModule,
  MatCardModule
} from '@angular/material';

import { DragModule, html5DragBackendFactory, DRAG_BACKEND } from 'projects/ng-dnd/src/public_api';
import { AppComponent } from './app.component';
import { ExampleModule } from './example/example.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    DragModule,
    ExampleModule,
    HighlightModule.forRoot({
      theme: 'xcode'
    }),
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
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
