// src/app/services/push-subscription.service.ts
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PushSubscriptionService {
  private b64urlToU8(input: string): Uint8Array {
    if (typeof input !== 'string' || !input.trim()) {
      throw new Error('[push] PUSH_PUBLIC_VAPID_KEY is missing/empty in environment.*');
    }
    const b64url = input.trim();
    const padLen = (4 - (b64url.length % 4)) % 4;
    const base64 = (b64url + '='.repeat(padLen)).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    let bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);

    // VAPID public key должен быть 65 байт (0x04 + 32 + 32). Если 64 — дописываем 0x04.
    if (bytes.length === 64) {
      const fixed = new Uint8Array(65);
      fixed[0] = 0x04;
      fixed.set(bytes, 1);
      bytes = fixed;
      console.warn('[push] VAPID key was 64 bytes; added 0x04 prefix to make it 65.');
    }
    return bytes;
  }

  async ensurePermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }

  async subscribe(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator)) {
      console.error('[push] Service Worker not supported');
      return null;
    }

    // 1) достаём и валидируем ключ
    const vapid = (environment as any).PUSH_PUBLIC_VAPID_KEY as string | undefined;
    if (!vapid) {
      console.error('[push] environment.PUSH_PUBLIC_VAPID_KEY is undefined (проверь environment.*)');
      return null;
    }
    const keyBytes = this.b64urlToU8(vapid);
    console.log('[push] VAPID string prefix:', vapid.slice(0, 10), '… len=', vapid.length);
    console.log('[push] VAPID Uint8Array length:', keyBytes.byteLength); // должно быть 65

    // 2) permission
    const ok = await this.ensurePermission();
    if (!ok) { console.warn('[push] permission not granted'); return null; }

    // 3) subscribe
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyBytes as unknown as ArrayBuffer
      });
    }

    // 4) отправляем подписку на сервер
    const res = await fetch(`${environment.apiBase}/api/push-subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub)
    });
    if (!res.ok) console.error('[push] send sub failed', res.status);
    return sub;
  }

  async test(url: string = '/'): Promise<void> {
    await fetch(`${environment.apiBase}/api/push-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
  }
}
