import { isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
    // Angular Service Worker (ngsw)
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ]
}).then(() => {
  // Кастомный push-SW (отдельная scope, не конфликтует с NGSW)
  if ('serviceWorker' in navigator) {
    // Регистрируем после onload — твой вариант корректный
    window.addEventListener('load', async () => {
      try {
        // опционально: избегаем лишней повторной регистрации
        const existing = await navigator.serviceWorker.getRegistration('/push/');
        if (!existing) {
          await navigator.serviceWorker.register('/push/push-sw.js', { scope: '/push/' });
          // console.log('[push-sw] registered');
        } else {
          // console.log('[push-sw] already registered');
        }
      } catch (err) {
        console.error('push sw register:', err);
      }
    });
  }
}).catch(err => console.error(err));
