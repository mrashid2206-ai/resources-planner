import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardData } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private url = `${environment.apiBaseUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getDashboardData(): Observable<DashboardData> {
    return this.http.get<DashboardData>(this.url);
  }

  getStats(year?: number): Observable<DashboardData> {
    const params: Record<string, string> = {};
    if (year) params['year'] = year.toString();
    return this.http.get<DashboardData>(this.url, { params });
  }
}
