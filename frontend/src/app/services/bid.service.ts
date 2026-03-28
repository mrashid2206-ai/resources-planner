import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bid, BidRequest } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BidService {
  private url = `${environment.apiBaseUrl}/bids`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Bid[]> {
    return this.http.get<Bid[]>(this.url);
  }

  getById(id: string): Observable<Bid> {
    return this.http.get<Bid>(`${this.url}/${id}`);
  }

  create(request: BidRequest): Observable<Bid> {
    return this.http.post<Bid>(this.url, request);
  }

  update(id: string, request: BidRequest): Observable<Bid> {
    return this.http.put<Bid>(`${this.url}/${id}`, request);
  }

  updateStatus(id: string, status: string, reason?: string): Observable<Bid> {
    return this.http.patch<Bid>(`${this.url}/${id}/status`, null, {
      params: { status, ...(reason ? { reason } : {}) }
    });
  }

  archive(id: string): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/archive`, {});
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
