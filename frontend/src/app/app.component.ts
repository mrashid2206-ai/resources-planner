import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="topbar" *ngIf="isManagePage()">
      <div class="topbar-left">
        <a routerLink="/" class="back-btn">← Dashboard</a>
      </div>
      <div class="nav-pills">
        <a routerLink="/manage/resources" routerLinkActive="active" class="pill">Resources</a>
        <a routerLink="/manage/projects" routerLinkActive="active" class="pill">Projects</a>
        <a routerLink="/manage/bids" routerLinkActive="active" class="pill">Bids</a>
        <a routerLink="/manage/leaves" routerLinkActive="active" class="pill">Leaves</a>
      </div>
      <div class="topbar-right"></div>
    </nav>

    <main class="app-shell" [class.with-nav]="isManagePage()">
      <router-outlet />
    </main>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: #0c0f17; color: #e2e8f0; font-family: 'DM Sans', sans-serif; }

    .topbar {
      position: fixed; top: 0; left: 0; right: 0; height: 52px;
      background: #141820; border-bottom: 1px solid #1e2433;
      display: flex; align-items: center; padding: 0 20px; gap: 12px; z-index: 100;
    }
    .topbar-left { flex-shrink: 0; }
    .topbar-right { flex-shrink: 0; width: 100px; }
    .back-btn {
      color: #64748b; text-decoration: none; font-size: 13px; font-weight: 500;
      padding: 6px 12px; border-radius: 8px; transition: all .15s;
    }
    .back-btn:hover { background: rgba(255,255,255,.04); color: #a5b4fc; }

    .nav-pills { display: flex; gap: 2px; flex: 1; justify-content: center; }
    .pill {
      padding: 6px 16px; border-radius: 8px; font-size: 13px; font-weight: 500;
      color: #64748b; text-decoration: none; transition: all 0.15s;
    }
    .pill:hover { background: rgba(255,255,255,.04); color: #94a3b8; }
    .pill.active { background: rgba(99,102,241,.12); color: #a5b4fc; }

    .app-shell { padding: 24px 28px; min-height: 100vh; max-width: 1500px; margin: 0 auto; }
    .app-shell.with-nav { margin-top: 52px; }
    @media (max-width: 768px) { .app-shell { padding: 14px; } }
  `]
})
export class AppComponent {
  constructor(private router: Router) {}

  isManagePage(): boolean {
    return this.router.url.startsWith('/manage');
  }
}
