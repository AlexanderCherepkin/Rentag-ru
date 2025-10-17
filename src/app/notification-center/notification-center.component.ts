import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
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
  imports: [NgIf, NgFor, DatePipe],
  templateUrl: './notifications-center.component.html',
  styleUrls: ['./notifications-center.component.css']
})
export class NotificationsCenterComponent implements OnInit, OnDestroy {
  readonly notifications = signal<UINotification[]>([]);

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

  ngOnInit()  { if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message', this.onMessage); }
  ngOnDestroy(){ if ('serviceWorker' in navigator) navigator.serviceWorker.removeEventListener('message', this.onMessage); }

  subscribe() { this.push.subscribe(); }
  testPush()  { this.push.test(location.pathname); }
  clear()     { this.notifications.set([]); }

  private add(n: UINotification) {
    this.notifications.update(list => [n, ...list].slice(0, 100));
  }
}
