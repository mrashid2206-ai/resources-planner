import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

const VALID_USERNAME = 'admin';
const VALID_PASSWORD = 'admin123';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';

  constructor(private readonly router: Router) {}

  login(username: string, password: string): Observable<{ token: string }> {
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      const token = btoa(`${username}:${Date.now()}`);
      localStorage.setItem(this.TOKEN_KEY, token);
      return of({ token });
    }
    return throwError(() => ({ message: 'Invalid username or password' }));
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
