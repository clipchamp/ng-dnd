import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';

const clipchampSvg = `
<svg viewBox="0 0 59 59">
  <path fill="currentColor" d="M0 29.6C0 13.4 12.4.2 29.3.2 38.2.2 44 2.9 49 7.1a6.5 6.5 0 0 1 2 4.7 5.7 5.7 0 0 1-5.8 5.8 9.1 9.1 0 0 1-3.9-1.2c-3.5-2.7-6.9-4.6-12-4.6-9.3 0-16.2 8.1-16.2 17.8v.4c0 10 6.9 17.8 16.6 17.8a17.9 17.9 0 0 0 12.4-5 4.9 4.9 0 0 1 3.5-1.5A5.6 5.6 0 0 1 51 47a4.8 4.8 0 0 1-2 3.8 28.5 28.5 0 0 1-20.5 8.1C12.608 58.519-.059 45.496 0 29.6z"/>
</svg>`;

const githubSvg = `
<svg viewBox="0 0 16 16">
  <path fill="currentColor" fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
</svg>`;

const sourceSvg = `
<svg viewBox="0 0 24 24">
  <path fill="none" d="M0 0h24v24H0V0z"/>
  <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
</svg>`;

export function registerIcons(
  iconRegistry: MatIconRegistry,
  sanitizer: DomSanitizer
): void {
  iconRegistry.addSvgIconLiteral(
    'clipchamp',
    sanitizer.bypassSecurityTrustHtml(clipchampSvg)
  );
  iconRegistry.addSvgIconLiteral(
    'github',
    sanitizer.bypassSecurityTrustHtml(githubSvg)
  );
  iconRegistry.addSvgIconLiteral(
    'source',
    sanitizer.bypassSecurityTrustHtml(sourceSvg)
  );
}
