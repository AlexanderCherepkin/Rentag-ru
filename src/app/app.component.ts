import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationsCenterComponent } from './notification-center/notification-center.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationsCenterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] // ← фикс: было styleUrl
})
export class AppComponent {
  title = 'webapp'; // можно оставить; если в шаблоне не используется — смело удаляй
}
