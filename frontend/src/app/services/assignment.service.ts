import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Assignment, AssignmentRequest, ReassignmentRequest } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AssignmentService {
  private url = `${environment.apiBaseUrl}/assignments`;

  constructor(private http: HttpClient) {}

  getByResource(resourceId: string): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${this.url}/resource/${resourceId}`);
  }

  getByProject(projectId: string): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${this.url}/project/${projectId}`);
  }

  getByBid(bidId: string): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${this.url}/bid/${bidId}`);
  }

  create(request: AssignmentRequest): Observable<Assignment> {
    return this.http.post<Assignment>(this.url, request);
  }

  update(id: string, request: AssignmentRequest): Observable<Assignment> {
    return this.http.put<Assignment>(`${this.url}/${id}`, request);
  }

  reassign(request: ReassignmentRequest): Observable<Assignment> {
    return this.http.post<Assignment>(`${this.url}/reassign`, request);
  }

  checkConflicts(resourceId: string, startMonth: number, endMonth: number,
                  allocation: number, excludeId?: string): Observable<{ hasConflict: boolean }> {
    return this.http.get<{ hasConflict: boolean }>(`${this.url}/conflicts`, {
      params: {
        resourceId, startMonth: startMonth.toString(), endMonth: endMonth.toString(),
        allocation: allocation.toString(), ...(excludeId ? { excludeId } : {})
      }
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
