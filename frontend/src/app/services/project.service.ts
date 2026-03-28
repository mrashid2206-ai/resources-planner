import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project, ProjectRequest } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private url = `${environment.apiBaseUrl}/projects`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Project[]> {
    return this.http.get<Project[]>(this.url);
  }

  getById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.url}/${id}`);
  }

  create(request: ProjectRequest): Observable<Project> {
    return this.http.post<Project>(this.url, request);
  }

  update(id: string, request: ProjectRequest): Observable<Project> {
    return this.http.put<Project>(`${this.url}/${id}`, request);
  }

  archive(id: string): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/archive`, {});
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  convertFromBid(bidId: string): Observable<Project> {
    return this.http.post<Project>(`${this.url}/convert-bid/${bidId}`, {});
  }
}
