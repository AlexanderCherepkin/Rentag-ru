import { Routes } from '@angular/router';
import { NotificationCenterComponent } from './notification-center/notification-center.component';

export const routes: Routes = [
  { path: 'notifications', component: NotificationCenterComponent },
  { path: '', pathMatch: 'full', redirectTo: 'notifications' },
];
