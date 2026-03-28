import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      if (error.error instanceof ErrorEvent) {
        errorMessage = error.error.message;
      } else {
        switch (error.status) {
          case 400: errorMessage = error.error?.message || 'Invalid request'; break;
          case 401:
            localStorage.removeItem('auth_token');
            router.navigate(['/login']);
            errorMessage = 'Session expired. Please sign in again.';
            break;
          case 404: errorMessage = error.error?.message || 'Resource not found'; break;
          case 409: errorMessage = error.error?.message || 'Conflict detected'; break;
          case 500: errorMessage = 'Server error. Please try again later.'; break;
        }
      }

      console.error('API Error:', error.status, errorMessage);
      return throwError(() => ({ status: error.status, message: errorMessage }));
    })
  );
};
