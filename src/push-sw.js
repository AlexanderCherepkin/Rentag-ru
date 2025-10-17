// /src/push/push-sw.js

/* Быстрая активация воркера */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));

/* Обработка PUSH + отправка payload во все открытые окна */
self.addEventListener('push', (event) => {
  const run = async () => {
    let data = {};
    try {
      data = event.data ? event.data.json() : {};
    } catch {
      data = { body: event.data?.text() };
    }

    const title = data.title || 'Уведомление';
    const body  = data.body  || 'Нет текста';
    const url   = data.url   || '/';
    const icon  = data.icon  || '/assets/icons/icon-192x192.png';

    const options = {
      body,
      data: { url },
      icon,
      badge: '/assets/icons/icon-72x72.png'
    };

    await self.registration.showNotification(title, options);

    // Рассылаем payload во все клиентские окна
    const list = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of list) {
      client.postMessage({
        type: 'PUSH_PAYLOAD',
        payload: { title, body, url, icon }
      });
    }
  };

  event.waitUntil(run());
});

/* Клик по уведомлению — фокусируем/открываем вкладку и переходим по url */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';

  event.waitUntil((async () => {
    const all = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    const sameOrigin = all.find(c => new URL(c.url).origin === self.location.origin);

    if (sameOrigin) {
      await sameOrigin.focus();
      sameOrigin.navigate(url);
    } else {
      await clients.openWindow(url);
    }
  })());
});
