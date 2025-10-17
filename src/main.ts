import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServiceWorker } from '@angular/service-worker';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    provideClientHydration(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: true, // даже в dev — нам нужна рега воркера
      registrationStrategy: 'registerWhenStable:3000'
    })
  ]
}).then(async () => {
  // Регистрируем кастомный push SW из /push/ (в assets)
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/push/push-sw.js', { scope: '/push/' });
      console.log('[push-sw] registered:', reg.scope);
    } catch (e) {
      console.error('[push-sw] register error:', e);
    }
  }
});
