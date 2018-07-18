import {
  Component,
  Input,
  ContentChild,
  ContentChildren,
  QueryList
} from '@angular/core';
import { ExampleTitleDirective } from './example-title.directive';
import { ExampleSourceDirective } from './example-source.directive';

@Component({
  selector: 'cc-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss']
})
export class ExampleComponent {
  showSourceCode = false;

  @Input() label?: string;
  @ContentChild(ExampleTitleDirective) labelTemplate?: ExampleTitleDirective;
  @ContentChildren(ExampleSourceDirective)
  sourceSections?: QueryList<ExampleSourceDirective>;
}
