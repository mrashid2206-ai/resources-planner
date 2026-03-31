import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'admin123';
const PASSWORD_KEY = 'app_password';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';

  constructor(private readonly router: Router) {}

  login(username: string, password: string): Observable<{ token: string }> {
    const storedPassword = localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD;
    if (username === DEFAULT_USERNAME && password === storedPassword) {
      const token = btoa(`${username}:${Date.now()}`);
      localStorage.setItem(this.TOKEN_KEY, token);
      return of({ token });
    }
    return throwError(() => ({ message: 'Invalid username or password' }));
  }

  changePassword(currentPassword: string, newPassword: string): { success: boolean; message: string } {
    const storedPassword = localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD;
    if (currentPassword !== storedPassword) {
      return { success: false, message: 'Current password is incorrect' };
    }
    if (newPassword.length < 4) {
      return { success: false, message: 'New password must be at least 4 characters' };
    }
    localStorage.setItem(PASSWORD_KEY, newPassword);
    return { success: true, message: 'Password changed successfully' };
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
