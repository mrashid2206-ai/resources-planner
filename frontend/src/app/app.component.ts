import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { DashboardService } from './services/dashboard.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="topbar" *ngIf="authService.isLoggedIn()">
      <div class="topbar-left">
        <div class="logo-circle">R</div>
        <div class="logo-info">
          <span class="logo-name">Resource Planner</span>
          <span class="logo-sub">{{ counts.resources }} resources · {{ counts.projects }} projects · {{ counts.bids }} bids · ✓ Saved</span>
        </div>
      </div>

      <div class="nav-pills">
        <a routerLink="/dashboard" routerLinkActive="active" class="pill">Dashboard</a>
        <a routerLink="/resources" routerLinkActive="active" class="pill">Resources</a>
        <a routerLink="/projects" routerLinkActive="active" class="pill">Projects</a>
        <a routerLink="/bids" routerLinkActive="active" class="pill">Bids</a>
        <a routerLink="/timeline" routerLinkActive="active" class="pill">Timeline</a>
      </div>

      <div class="topbar-right">
        <button class="btn-save">💾 Save</button>
        <button class="btn-signout" (click)="authService.logout()">Sign Out</button>
      </div>
    </nav>

    <main class="main-content" [class.no-nav]="!authService.isLoggedIn()">
      <router-outlet />
    </main>

    <nav class="mobile-nav" *ngIf="authService.isLoggedIn()">
      <a routerLink="/dashboard" routerLinkActive="active" class="pill">Dashboard</a>
      <a routerLink="/resources" routerLinkActive="active" class="pill">Resources</a>
      <a routerLink="/projects" routerLinkActive="active" class="pill">Projects</a>
      <a routerLink="/bids" routerLinkActive="active" class="pill">Bids</a>
      <a routerLink="/timeline" routerLinkActive="active" class="pill">Timeline</a>
    </nav>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: #0c0f17; color: #e2e8f0; font-family: 'DM Sans', sans-serif; }

    .topbar {
      position: fixed; top: 0; left: 0; right: 0; height: 56px;
      background: #141820; border-bottom: 1px solid #1e2433;
      display: flex; align-items: center; padding: 0 20px; gap: 12px; z-index: 100;
    }

    .topbar-left { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

    .logo-circle {
      width: 32px; height: 32px; border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 15px; color: #fff; flex-shrink: 0;
    }

    .logo-info { display: flex; flex-direction: column; line-height: 1.3; }
    .logo-name { font-size: 13px; font-weight: 700; color: #e2e8f0; white-space: nowrap; }
    .logo-sub { font-size: 10px; color: #4a5568; white-space: nowrap; }

    .nav-pills { display: flex; gap: 2px; flex: 1; justify-content: center; }

    .pill {
      padding: 6px 13px; border-radius: 8px; font-size: 13px; font-weight: 500;
      color: #64748b; text-decoration: none; transition: all 0.15s; white-space: nowrap;
    }
    .pill:hover { background: rgba(255,255,255,.04); color: #94a3b8; }
    .pill.active { background: rgba(99,102,241,.12); color: #a5b4fc; }

    .topbar-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

    .btn-save {
      background: transparent; border: 1px solid #2d3548; color: #64748b;
      padding: 6px 12px; border-radius: 7px; font-size: 12px;
      cursor: pointer; font-family: inherit; transition: all .15s;
    }
    .btn-save:hover { border-color: #4a5568; color: #94a3b8; }

    .btn-signout {
      background: transparent; border: 1px solid #2d3548; color: #64748b;
      padding: 6px 12px; border-radius: 7px; font-size: 12px;
      cursor: pointer; font-family: inherit; transition: all 0.15s;
    }
    .btn-signout:hover { border-color: rgba(248,113,113,.3); color: #f87171; }

    .main-content {
      margin-top: 56px; padding: 24px 28px; min-height: calc(100vh - 56px);
    }
    .main-content.no-nav { margin-top: 0; padding: 0; min-height: 100vh; }

    .mobile-nav { display: none; }

    @media (max-width: 900px) {
      .logo-sub { display: none; }
    }

    @media (max-width: 768px) {
      .nav-pills { display: none; }
      .topbar { padding: 0 14px; }
      .btn-save { display: none; }

      .mobile-nav {
        display: flex; position: fixed; bottom: 0; left: 0; right: 0;
        background: #141820; border-top: 1px solid #1e2433;
        padding: 6px 4px; z-index: 100; justify-content: space-around;
      }
      .mobile-nav .pill {
        font-size: 11px; padding: 6px 10px; flex: 1;
        text-align: center; border-radius: 8px;
      }

      .main-content { padding: 14px; padding-bottom: 68px; }
    }
  `]
})
export class AppComponent implements OnInit {
  counts = { resources: 0, projects: 0, bids: 0 };
  private countsLoaded = false;

  constructor(
    public authService: AuthService,
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        if (this.authService.isLoggedIn() && !this.countsLoaded) {
          this.countsLoaded = true;
          this.dashboardService.getDashboardData().subscribe({
            next: d => this.counts = { resources: d.totalResources, projects: d.activeProjects, bids: d.activeBids },
            error: () => {}
          });
        }
      });
  }
}
