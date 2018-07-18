export const SIMPLE_TS_SOURCE = ` // app.component.ts

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  simpleSources = [
    { label: 'Item 1' },
    { label: 'Item 2' },
    { label: 'Item 3' }
  ];
  simpleTargets = [];
}
`;

export const SIMPLE_HTML_SOURCE = `<!-- app.component.html -->

<div class="drop-target" 
    [ccDragContainer]="simpleSources" 
    ccDropTarget 
    [itemType]="'source'">
  <div class="drag-source" 
      ccDragSource 
      [item]="item" 
      [itemType]="'source'"
      *ccDragItem="let item">
    {{ item.label }}
  </div>
</div>
<div class="drop-target" 
    [ccDragContainer]="simpleTargets" 
    ccDropTarget 
    [itemType]="'source'">
  <div class="drag-source" 
    ccDragSource 
    [item]="item" 
    [itemType]="'source'"
    *ccDragItem="let item">
  {{ item.label }}
  </div>
</div>
`;

export const SIMPLE_CSS_SOURCE = `/* app.component.css */

.drop-target {}

.drag-source {}
`;
