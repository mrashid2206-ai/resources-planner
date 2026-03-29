import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="logo">
          <span class="logo-icon">◈</span>
          <span class="logo-text">Resource Planner<span class="logo-pro">PRO</span></span>
        </div>

        <h2 class="title">Welcome Alaa</h2>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="field">
            <label for="username">Username</label>
            <input
              id="username"
              type="text"
              [(ngModel)]="username"
              name="username"
              placeholder="Enter your username"
              required
              autocomplete="username"
            />
          </div>

          <div class="field">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              [(ngModel)]="password"
              name="password"
              placeholder="Enter your password"
              required
              autocomplete="current-password"
            />
          </div>

          <div *ngIf="error" class="error">{{ error }}</div>

          <button type="submit" class="btn-login" [disabled]="loading">
            <span *ngIf="!loading">Sign In</span>
            <span *ngIf="loading">Signing in...</span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      background: #0c0f17;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .login-card {
      background: #141820;
      border: 1px solid #1e2433;
      border-radius: 20px;
      padding: 40px;
      width: 100%;
      max-width: 400px;
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 32px;
    }

    .logo-icon {
      font-size: 28px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .logo-text {
      font-size: 18px;
      font-weight: 600;
      color: #e2e8f0;
    }

    .logo-pro {
      font-size: 11px;
      font-weight: 700;
      color: #6366f1;
      margin-left: 4px;
      vertical-align: super;
    }

    .title {
      font-size: 18px;
      font-weight: 600;
      color: #94a3b8;
      text-align: center;
      margin-bottom: 28px;
    }

    .field {
      margin-bottom: 16px;
    }

    label {
      display: block;
      font-size: 13px;
      color: #64748b;
      margin-bottom: 6px;
      font-weight: 500;
    }

    input {
      width: 100%;
      background: #0c0f17;
      border: 1px solid #1e2433;
      border-radius: 10px;
      padding: 10px 14px;
      color: #e2e8f0;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }

    input:focus {
      border-color: #6366f1;
    }

    input::placeholder {
      color: #334155;
    }

    .error {
      background: rgba(248, 113, 113, 0.1);
      border: 1px solid rgba(248, 113, 113, 0.3);
      border-radius: 8px;
      padding: 10px 14px;
      color: #f87171;
      font-size: 13px;
      margin-bottom: 16px;
    }

    .btn-login {
      width: 100%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border: none;
      border-radius: 10px;
      padding: 12px;
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 8px;
      transition: opacity 0.2s;
    }

    .btn-login:hover:not(:disabled) {
      opacity: 0.9;
    }

    .btn-login:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.username || !this.password) return;
    this.loading = true;
    this.error = '';

    this.authService.login(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.error = err.message || 'Invalid username or password';
        this.loading = false;
      }
    });
  }
}
