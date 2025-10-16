import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PushService {
  private http = inject(HttpClient);

  async askPermissionAndSubscribe(): Promise<PushSubscription|null> {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Web Push не поддерживается в этом браузере');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(environment.PUSH_PUBLIC_VAPID_KEY)
    });

    await this.http.post(environment.BACKEND_PUSH_URL, sub).toPromise();
    return sub;
  }

  triggerTestPush(toUrl: string = '/notifications') {
    return this.http.post(environment.BACKEND_TEST_PUSH, { url: toUrl }).toPromise();
  }

  private urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
    return outputArray;
  }
}
