import { ExampleSourceDirective } from './example-source.directive';
import { Component } from '@angular/core';
import { TestBed, ComponentFixture, async } from '@angular/core/testing';

@Component({
  template: `<ng-template ccExampleSource>Test</ng-template>`
})
class TestHostComponent {}

describe('ExampleSourceDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExampleSourceDirective, TestHostComponent]
    }).compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });
  it('should create an instance', () => {
    expect(fixture).toBeTruthy();
  });
});
