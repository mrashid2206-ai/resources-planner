import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Leave, LeaveRequest } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LeaveService {
  private url = `${environment.apiBaseUrl}/leaves`;

  constructor(private http: HttpClient) {}

  getByResource(resourceId: string): Observable<Leave[]> {
    return this.http.get<Leave[]>(`${this.url}/resource/${resourceId}`);
  }

  create(request: LeaveRequest): Observable<Leave> {
    return this.http.post<Leave>(this.url, request);
  }

  update(id: string, request: LeaveRequest): Observable<Leave> {
    return this.http.put<Leave>(`${this.url}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
