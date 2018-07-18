import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ccExampleTitle],[cc-example-title]'
})
export class ExampleTitleDirective {
  constructor(public templateRef: TemplateRef<any>) {}
}
