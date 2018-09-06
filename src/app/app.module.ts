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

import { DragModule, HTML5_DRAG_BACKEND_PROVIDER } from 'dist/ng-dnd';
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
  providers: [HTML5_DRAG_BACKEND_PROVIDER],
  bootstrap: [AppComponent]
})
export class AppModule {}
