import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExampleComponent } from './example.component';
import { ExampleTitleDirective } from './example-title.directive';
import { ExampleSourceDirective } from './example-source.directive';
import {
  MatIconModule,
  MatButtonModule,
  MatTabsModule
} from '@angular/material';

@NgModule({
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTabsModule],
  declarations: [
    ExampleComponent,
    ExampleTitleDirective,
    ExampleSourceDirective
  ],
  exports: [ExampleComponent, ExampleTitleDirective, ExampleSourceDirective]
})
export class ExampleModule {}
