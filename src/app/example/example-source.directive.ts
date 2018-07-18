import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ccExampleSource],[cc-example-source]'
})
export class ExampleSourceDirective {
  @Input()
  set ccExampleSource(value: string) {
    this.label = value;
  }

  label: string;

  constructor(public templateRef: TemplateRef<any>) {}
}
