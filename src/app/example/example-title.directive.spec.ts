import { ExampleTitleDirective } from './example-title.directive';
import { Component } from '@angular/core';
import { TestBed, ComponentFixture, async } from '@angular/core/testing';

@Component({
  template: `<ng-template ccExampleTitle>Test</ng-template>`
})
class TestHostComponent {}

describe('ExampleTitleDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExampleTitleDirective, TestHostComponent]
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
