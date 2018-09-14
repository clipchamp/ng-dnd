import { NgZone } from '@angular/core';
import { Observable } from 'rxjs';

export const enterZone = (zone: NgZone) => <T>(source: Observable<T>) =>
  new Observable<T>(observer => {
    return source.subscribe({
      next(x) {
        zone.run(() => observer.next(x));
      },
      error(err) {
        zone.run(() => observer.error(err));
      },
      complete() {
        zone.run(() => observer.complete());
      }
    });
  });
