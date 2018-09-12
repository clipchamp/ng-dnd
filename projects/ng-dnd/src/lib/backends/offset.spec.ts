import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import {
  getNodeDOMRect,
  getEventClientOffset,
  getDragPreviewOffset,
  getSourceOffset
} from './offset';

describe('getNodeDOMRect', () => {
  let nativeDocument: Document;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    nativeDocument = TestBed.get(DOCUMENT);
  });

  it('should return the dom rect of a element', () => {
    const el = nativeDocument.createElement('div');
    const rect = getNodeDOMRect(el);
    expect(rect).toEqual(jasmine.any(DOMRect));
    expect(rect.left).toBe(0);
    expect(rect.top).toBe(0);
    expect(rect.bottom).toBe(0);
    expect(rect.right).toBe(0);
    expect(rect.width).toBe(0);
    expect(rect.height).toBe(0);
  });

  it('should return the dom rect of the parent element when a text node is passed', () => {
    const el = nativeDocument.createElement('div');
    const textNode = nativeDocument.createTextNode('abc');
    el.appendChild(textNode);
    const rect = getNodeDOMRect(textNode);
    expect(rect).toEqual(jasmine.any(DOMRect));
    expect(rect.left).toBe(0);
    expect(rect.top).toBe(0);
    expect(rect.bottom).toBe(0);
    expect(rect.right).toBe(0);
    expect(rect.width).toBe(0);
    expect(rect.height).toBe(0);
  });

  it('should return null when a text node is passed which is not contained in an element', () => {
    const el = nativeDocument.createElement('div');
    const textNode = nativeDocument.createTextNode('abc');
    const rect = getNodeDOMRect(textNode);
    expect(rect).toBeFalsy();
  });
});

describe('getEventClientOffset', () => {
  it('should return the x and y coordinates from a drag event', () => {
    const event = { x: 10, y: 20 } as DragEvent;
    expect(getEventClientOffset(event)).toEqual({ x: 10, y: 20 });
  });
});

describe('getDragPreviewOffset', () => {
  let nativeDocument: Document;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    nativeDocument = TestBed.get(DOCUMENT);
  });

  it('should calculate the offset between a position and an element', () => {
    const el = nativeDocument.createElement('div');
    el.style.position = 'fixed';
    el.style.left = '10px';
    el.style.top = '10px';
    el.style.width = '100px';
    el.style.height = '100px';
    nativeDocument.body.appendChild(el);
    const offset = getDragPreviewOffset(el, { x: 50, y: 50 });
    expect(offset).toEqual({ x: 40, y: 40 });
    nativeDocument.body.removeChild(el);
  });

  it('should calculate the offset between a position and the parent element of a text node', () => {
    const el = nativeDocument.createElement('div');
    const textNode = nativeDocument.createTextNode('abc');
    el.appendChild(textNode);
    el.style.position = 'fixed';
    el.style.left = '10px';
    el.style.top = '10px';
    el.style.width = '100px';
    el.style.height = '100px';
    nativeDocument.body.appendChild(el);
    const offset = getDragPreviewOffset(el, { x: 50, y: 50 });
    expect(offset).toEqual({ x: 40, y: 40 });
    nativeDocument.body.removeChild(el);
  });

  it('should return a position when a node is passed which is not contained in an element', () => {
    const textNode = nativeDocument.createTextNode('abc');
    const offset = getDragPreviewOffset(textNode, { x: 50, y: 50 });
    expect(offset).toEqual({ x: 50, y: 50 });
  });
});

describe('getSourceOffset', () => {
  let nativeDocument: Document;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    nativeDocument = TestBed.get(DOCUMENT);
  });

  it('should calculate the offset between a position and an element including the element`s width and height', () => {
    const el = nativeDocument.createElement('div');
    el.style.position = 'fixed';
    el.style.left = '10px';
    el.style.top = '10px';
    el.style.width = '100px';
    el.style.height = '100px';
    nativeDocument.body.appendChild(el);
    const offset = getSourceOffset(el, { x: 50, y: 50 });
    expect(offset).toEqual({ x: 40, y: 40, width: 100, height: 100 });
    nativeDocument.body.removeChild(el);
  });

  it('should calculate the offset between a position and the parent element of a text node including the element`s width and height', () => {
    const el = nativeDocument.createElement('div');
    const textNode = nativeDocument.createTextNode('abc');
    el.appendChild(textNode);
    el.style.position = 'fixed';
    el.style.left = '10px';
    el.style.top = '10px';
    el.style.width = '100px';
    el.style.height = '100px';
    nativeDocument.body.appendChild(el);
    const offset = getSourceOffset(el, { x: 50, y: 50 });
    expect(offset).toEqual({ x: 40, y: 40, width: 100, height: 100 });
    nativeDocument.body.removeChild(el);
  });

  it('should return a position when a node is passed which is not contained in an element', () => {
    const textNode = nativeDocument.createTextNode('abc');
    const offset = getSourceOffset(textNode, { x: 50, y: 50 });
    expect(offset).toEqual({ x: 50, y: 50, width: 0, height: 0 });
  });
});
