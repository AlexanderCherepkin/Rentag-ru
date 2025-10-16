import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface InAppNotification {
  title: string;
  body?: string;
  icon?: string;
  data?: any;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class SwMessagesService {
  notifications$ = new BehaviorSubject<InAppNotification[]>([]);

  constructor(private zone: NgZone) {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event: MessageEvent) => {
        this.zone.run(() => {
          const { type, payload } = event.data || {};
          if (type === 'PUSH_MESSAGE') {
            this.notifications$.next([
              {
                title: payload.title,
                body: payload.body,
                icon: payload.icon,
                data: payload.data,
                timestamp: Date.now()
              },
              ...this.notifications$.value
            ]);
          } else if (type === 'OPEN_DEEPLINK') {
            const url = payload?.url;
            if (url) window.location.href = url;
          }
        });
      });
    }
  }

  clear() { this.notifications$.next([]); }
}
