self.addEventListener('push', (event) => {
  const data = (() => {
    try { return event.data?.json() ?? {}; }
    catch { try { return JSON.parse(event.data?.text() || '{}'); } catch { return {}; } }
  })();

  const title = data.title || 'Rentag';
  const options = {
    body: data.body || '',
    icon: data.icon || '/assets/icons/icon-192x192.png',
    badge: data.badge || '/assets/icons/badge-72x72.png',
    tag: data.tag,
    data: data.data || {},
    actions: data.actions || []
  };

  event.waitUntil((async () => {
    // если нет разрешения — не вызываем showNotification, только шлём событие в приложение
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      await self.registration.showNotification(title, options);
    }
    try {
      const bc = new BroadcastChannel('push-events');
      bc.postMessage({ type: 'PUSH_MESSAGE', payload: { title, body: options.body, icon: options.icon, data: options.data } });
      bc.close();
    } catch {
      const cl = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      cl.forEach(c => c.postMessage({ type: 'PUSH_MESSAGE', payload: { title, body: options.body, icon: options.icon, data: options.data } }));
    }
  })());
});

self.addEventListener('notificationclick', (event) => {
  const url = event.notification?.data?.url || '/notifications';
  event.notification.close();
  event.waitUntil((async () => {
    try { const bc = new BroadcastChannel('push-events'); bc.postMessage({ type: 'OPEN_DEEPLINK', payload: { url } }); bc.close(); } catch {}
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const w of wins) { try { await w.focus(); await w.navigate(url); return; } catch {} }
    await self.clients.openWindow(url);
  })());
});
