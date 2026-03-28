import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Resource, ResourceRequest } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ResourceService {
  private url = `${environment.apiBaseUrl}/resources`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Resource[]> {
    return this.http.get<Resource[]>(this.url);
  }

  getById(id: string): Observable<Resource> {
    return this.http.get<Resource>(`${this.url}/${id}`);
  }

  create(request: ResourceRequest): Observable<Resource> {
    return this.http.post<Resource>(this.url, request);
  }

  update(id: string, request: ResourceRequest): Observable<Resource> {
    return this.http.put<Resource>(`${this.url}/${id}`, request);
  }

  archive(id: string): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/archive`, {});
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
