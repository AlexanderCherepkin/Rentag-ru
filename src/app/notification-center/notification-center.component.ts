import { Component, OnInit, OnDestroy, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { PushSubscriptionService } from '../services/push-subscription.service';

interface UINotification {
  title: string;
  body?: string;
  icon?: string;
  timestamp: number;
  url?: string;
}

@Component({
  selector: 'app-notifications-center',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.css']
})
export class NotificationsCenterComponent implements OnInit, OnDestroy {
  readonly notifications = signal<UINotification[]>([]);

  // ✅ определяемся с платформой один раз
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private onMessage = (event: MessageEvent) => {
    const msg = event.data;
    if (!msg || msg.type !== 'PUSH_PAYLOAD') return;
    const p = msg.payload || {};
    this.add({
      title: String(p.title ?? 'Уведомление'),
      body: p.body ? String(p.body) : undefined,
      icon: p.icon ? String(p.icon) : undefined,
      url: p.url ? String(p.url) : undefined,
      timestamp: Date.now()
    });
  };

  constructor(private push: PushSubscriptionService) {}

  // ✅ не трогаем navigator на сервере
  ngOnInit() {
    if (
      this.isBrowser &&
      typeof navigator !== 'undefined' &&
      'serviceWorker' in navigator
    ) {
      navigator.serviceWorker.addEventListener('message', this.onMessage);
    }
  }

  ngOnDestroy() {
    if (
      this.isBrowser &&
      typeof navigator !== 'undefined' &&
      'serviceWorker' in navigator
    ) {
      navigator.serviceWorker.removeEventListener('message', this.onMessage);
    }
  }

  subscribe() { if (this.isBrowser) this.push.subscribe(); }

  // ✅ не используем location на сервере
  testPush()  {
    if (!this.isBrowser) return;
    const path = globalThis.location?.pathname ?? '/';
    this.push.test(path);
  }

  clear()     { this.notifications.set([]); }

  private add(n: UINotification) {
    this.notifications.update(list => [n, ...list].slice(0, 100));
  }
}
