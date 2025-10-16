import { Component, computed, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { SwMessagesService, InAppNotification } from '../push/sw-messages.service';
import { PushService } from '../push/push.service';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.css']
})
export class NotificationCenterComponent {
  private readonly notificationsSrc = toSignal(this.sw.notifications$, {
    initialValue: [] as InAppNotification[]
  });
  readonly notifications: Signal<InAppNotification[]> =
    computed(() => this.notificationsSrc());

  constructor(private sw: SwMessagesService, private push: PushService) {}
  subscribe() { this.push.askPermissionAndSubscribe(); }
  testPush()  { this.push.triggerTestPush('/notifications'); }
  clear()     { this.sw.clear(); }
}
