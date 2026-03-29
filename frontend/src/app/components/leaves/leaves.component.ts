import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Resource, Leave, LeaveRequest, MONTHS } from '../../models/models';
import { ResourceService } from '../../services/resource.service';
import { LeaveService } from '../../services/leave.service';

@Component({
  selector: 'app-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Leave Management</h1>
        <button class="btn-primary" (click)="openAddModal()">+ Add Leave</button>
      </div>

      <!-- Year selector -->
      <div class="year-row">
        <label class="yr-label">Year</label>
        <select class="yr-select" [(ngModel)]="selectedYear" (ngModelChange)="loadData()">
          <option *ngFor="let y of years" [ngValue]="y">{{ y }}</option>
        </select>
      </div>

      <!-- Leaves Grid / Table -->
      <div class="card" *ngIf="resources.length">
        <div class="table-wrap">
          <table class="leave-table">
            <thead>
              <tr>
                <th class="col-res">Resource</th>
                <th class="col-role">Role</th>
                <th *ngFor="let m of months; let i = index" class="col-month">{{ m }}</th>
                <th class="col-total">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of resources">
                <td class="col-res">
                  <div class="res-name">{{ r.name }}</div>
                </td>
                <td class="col-role">{{ r.role }}</td>
                <td *ngFor="let m of months; let i = index" class="col-month"
                    [class.has-leave]="getLeave(r.id, i)"
                    (click)="openCellModal(r, i)">
                  <span *ngIf="getLeave(r.id, i)" class="leave-val">
                    {{ getLeave(r.id, i)!.days }}d
                    <span class="leave-reason" *ngIf="getLeave(r.id, i)!.reason">{{ getLeave(r.id, i)!.reason }}</span>
                  </span>
                  <span *ngIf="!getLeave(r.id, i)" class="leave-empty">–</span>
                </td>
                <td class="col-total">
                  <span class="total-val">{{ getTotalDays(r.id) }}d</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div *ngIf="!resources.length" class="empty-state">
        No resources found.
      </div>

      <!-- Summary Cards -->
      <div class="summary-row" *ngIf="resources.length">
        <div class="summary-card">
          <span class="sum-label">Total Leave Days</span>
          <span class="sum-val purple">{{ totalLeaveDays }}</span>
        </div>
        <div class="summary-card">
          <span class="sum-label">Resources with Leave</span>
          <span class="sum-val blue">{{ resourcesWithLeave }}</span>
        </div>
        <div class="summary-card">
          <span class="sum-label">Peak Leave Month</span>
          <span class="sum-val yellow">{{ peakMonth }}</span>
        </div>
      </div>

      <!-- Recent Leaves List -->
      <div class="card" *ngIf="allLeaves.length">
        <h2 class="card-title">All Leave Entries ({{ selectedYear }})</h2>
        <div class="leave-list">
          <div *ngFor="let l of allLeaves" class="leave-row">
            <div class="leave-info">
              <span class="leave-name">{{ getResourceName(l.resourceId) }}</span>
              <span class="leave-detail">{{ months[l.month] }} {{ l.year }} · {{ l.days }} day{{ l.days > 1 ? 's' : '' }}</span>
              <span class="leave-rsn" *ngIf="l.reason">{{ l.reason }}</span>
            </div>
            <div class="leave-actions">
              <button class="icon-btn" (click)="editLeave(l)" title="Edit">✎</button>
              <button class="icon-btn red" (click)="deleteLeave(l.id)" title="Delete">×</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add / Edit Modal -->
      <div *ngIf="showModal" class="modal-backdrop" (click)="showModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingId ? 'Edit Leave' : 'Add Leave' }}</h2>
            <button class="btn-close" (click)="showModal = false">✕</button>
          </div>
          <div class="fg">
            <label>Resource *</label>
            <select [(ngModel)]="form.resourceId" [disabled]="!!editingId">
              <option value="">Select resource</option>
              <option *ngFor="let r of resources" [value]="r.id">{{ r.name }}</option>
            </select>
          </div>
          <div class="form-row">
            <div class="fg">
              <label>Month *</label>
              <select [(ngModel)]="form.month">
                <option *ngFor="let m of months; let i = index" [ngValue]="i">{{ m }}</option>
              </select>
            </div>
            <div class="fg">
              <label>Year *</label>
              <select [(ngModel)]="form.year">
                <option *ngFor="let y of years" [ngValue]="y">{{ y }}</option>
              </select>
            </div>
          </div>
          <div class="fg">
            <label>Days *</label>
            <input type="number" [(ngModel)]="form.days" min="0.5" max="22" step="0.5" />
          </div>
          <div class="fg">
            <label>Reason</label>
            <input [(ngModel)]="form.reason" placeholder="Annual leave, Sick leave, etc." />
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" (click)="showModal = false">Cancel</button>
            <button class="btn-primary" (click)="saveLeave()" [disabled]="!form.resourceId || !form.days">
              {{ editingId ? 'Save Changes' : 'Add Leave' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 1400px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    h1 { font-size: 22px; font-weight: 700; margin: 0; }
    .page-header .btn-primary {
      background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; color: #fff;
      padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600;
      cursor: pointer; font-family: inherit;
    }

    .year-row { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
    .yr-label { font-size: 12px; color: #64748b; }
    .yr-select {
      background: #141820; border: 1px solid #2d3548; color: #e2e8f0;
      padding: 6px 10px; border-radius: 8px; font-size: 13px; font-family: inherit; cursor: pointer;
    }
    .yr-select:focus { outline: none; border-color: #6366f1; }

    .card { background: #141820; border: 1px solid #1e2433; border-radius: 14px; padding: 24px; margin-bottom: 20px; }
    .card-title { font-size: 15px; font-weight: 600; margin: 0 0 16px; }

    .table-wrap { overflow-x: auto; }
    .leave-table { width: 100%; border-collapse: separate; border-spacing: 3px; }
    .leave-table th { font-size: 10px; color: #64748b; font-weight: 600; padding: 8px 6px; text-transform: uppercase; letter-spacing: .5px; }
    .col-res { text-align: left; min-width: 140px; }
    .col-role { text-align: left; min-width: 100px; font-size: 11px; color: #64748b; }
    .col-month { text-align: center; min-width: 58px; cursor: pointer; border-radius: 6px; padding: 8px 4px; transition: background .15s; }
    .col-month:hover { background: rgba(99,102,241,.08); }
    .col-month.has-leave { background: rgba(251,191,36,.08); }
    .col-total { text-align: center; min-width: 56px; }

    .res-name { font-size: 13px; font-weight: 600; color: #e2e8f0; }
    .leave-val { font-size: 12px; font-weight: 600; color: #fbbf24; display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .leave-reason { font-size: 9px; color: #64748b; font-weight: 400; max-width: 60px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .leave-empty { font-size: 11px; color: #2d3548; }
    .total-val { font-size: 13px; font-weight: 700; color: #f97316; }

    .summary-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 20px; }
    .summary-card {
      background: #141820; border: 1px solid #1e2433; border-radius: 12px;
      padding: 18px 20px; display: flex; flex-direction: column; gap: 8px;
    }
    .sum-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: .5px; }
    .sum-val { font-size: 24px; font-weight: 700; }
    .sum-val.purple { color: #a5b4fc; }
    .sum-val.blue { color: #60a5fa; }
    .sum-val.yellow { color: #fbbf24; }

    .leave-list { display: flex; flex-direction: column; gap: 6px; max-height: 400px; overflow-y: auto; }
    .leave-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 14px; background: #0c0f17; border-radius: 8px; border: 1px solid #1e2433;
    }
    .leave-info { display: flex; flex-direction: column; gap: 2px; }
    .leave-name { font-size: 13px; font-weight: 600; color: #e2e8f0; }
    .leave-detail { font-size: 11px; color: #94a3b8; }
    .leave-rsn { font-size: 11px; color: #fbbf24; }
    .leave-actions { display: flex; gap: 4px; }

    .empty-state { text-align: center; padding: 48px; color: #64748b; font-size: 14px; }

    /* Modal */
    .modal-backdrop {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,.6); display: flex; align-items: center; justify-content: center; z-index: 200;
    }
    .modal {
      background: #141820; border: 1px solid #1e2433; border-radius: 16px;
      padding: 28px; width: 100%; max-width: 440px;
    }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .modal-header h2 { font-size: 18px; font-weight: 600; margin: 0; }
    .btn-close { background: none; border: none; color: #64748b; font-size: 18px; cursor: pointer; }
    .fg { margin-bottom: 14px; }
    .fg label { display: block; font-size: 12px; color: #64748b; margin-bottom: 5px; font-weight: 500; }
    .fg input, .fg select, .fg textarea {
      width: 100%; background: #0c0f17; border: 1px solid #1e2433; border-radius: 8px;
      padding: 9px 12px; color: #e2e8f0; font-size: 13px; font-family: inherit; box-sizing: border-box;
    }
    .fg input:focus, .fg select:focus, .fg textarea:focus { outline: none; border-color: #6366f1; }
    .form-row { display: flex; gap: 12px; }
    .form-row .fg { flex: 1; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
    .btn-primary {
      background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; color: #fff;
      padding: 9px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit;
    }
    .btn-primary:disabled { opacity: .5; cursor: not-allowed; }
    .btn-secondary {
      background: transparent; border: 1px solid #2d3548; color: #64748b;
      padding: 9px 20px; border-radius: 8px; font-size: 13px; cursor: pointer; font-family: inherit;
    }
    .icon-btn {
      background: none; border: 1px solid #2d3548; color: #64748b; padding: 4px 8px;
      border-radius: 6px; cursor: pointer; font-size: 12px; transition: all .15s;
    }
    .icon-btn:hover { border-color: #4a5568; color: #e2e8f0; }
    .icon-btn.red:hover { border-color: rgba(248,113,113,.3); color: #f87171; }

    @media (max-width: 768px) {
      .summary-row { grid-template-columns: 1fr; }
    }
  `]
})
export class LeavesComponent implements OnInit {
  months = MONTHS;
  resources: Resource[] = [];
  allLeaves: Leave[] = [];
  selectedYear = new Date().getFullYear();
  years: number[] = [];

  showModal = false;
  editingId: string | null = null;
  form: any = { resourceId: '', month: 0, year: new Date().getFullYear(), days: 1, reason: '' };

  totalLeaveDays = 0;
  resourcesWithLeave = 0;
  peakMonth = '—';

  constructor(
    private resourceService: ResourceService,
    private leaveService: LeaveService
  ) {}

  ngOnInit() {
    this.years = Array.from({length: 10}, (_, i) => 2026 + i);
    this.selectedYear = new Date().getFullYear();
    this.loadData();
  }

  loadData() {
    this.resourceService.getAll().subscribe({
      next: (resources) => {
        this.resources = resources.filter(r => !r.isArchived);
        this.computeAllLeaves();
        this.computeSummary();
      },
      error: (err) => { console.error('Failed to load resources', err); }
    });
  }

  private computeAllLeaves() {
    this.allLeaves = [];
    for (const r of this.resources) {
      for (const l of (r.leaves || [])) {
        if (l.year === this.selectedYear) {
          this.allLeaves.push(l);
        }
      }
    }
    this.allLeaves.sort((a, b) => a.month - b.month);
  }

  private computeSummary() {
    this.computeAllLeaves();
    this.totalLeaveDays = this.allLeaves.reduce((s, l) => s + l.days, 0);
    const resIds = new Set(this.allLeaves.map(l => l.resourceId));
    this.resourcesWithLeave = resIds.size;

    const monthTotals = new Array(12).fill(0);
    for (const l of this.allLeaves) { monthTotals[l.month] += l.days; }
    const maxIdx = monthTotals.indexOf(Math.max(...monthTotals));
    this.peakMonth = monthTotals[maxIdx] > 0 ? MONTHS[maxIdx] : '—';
  }

  getLeave(resourceId: string, month: number): Leave | undefined {
    const r = this.resources.find(r => r.id === resourceId);
    return (r?.leaves || []).find(l => l.month === month && l.year === this.selectedYear);
  }

  getTotalDays(resourceId: string): number {
    const r = this.resources.find(r => r.id === resourceId);
    return (r?.leaves || []).filter(l => l.year === this.selectedYear).reduce((s, l) => s + l.days, 0);
  }

  getResourceName(id: string): string {
    return this.resources.find(r => r.id === id)?.name || 'Unknown';
  }

  openAddModal() {
    this.editingId = null;
    this.form = { resourceId: '', month: new Date().getMonth(), year: this.selectedYear, days: 1, reason: '' };
    this.showModal = true;
  }

  openCellModal(r: Resource, month: number) {
    const existing = this.getLeave(r.id, month);
    if (existing) {
      this.editLeave(existing);
    } else {
      this.editingId = null;
      this.form = { resourceId: r.id, month, year: this.selectedYear, days: 1, reason: '' };
      this.showModal = true;
    }
  }

  editLeave(l: Leave) {
    this.editingId = l.id;
    this.form = { resourceId: l.resourceId, month: l.month, year: l.year, days: l.days, reason: l.reason || '' };
    this.showModal = true;
  }

  saveLeave() {
    if (!this.form.resourceId || !this.form.days) return;
    const req: LeaveRequest = {
      resourceId: this.form.resourceId,
      month: +this.form.month,
      year: +this.form.year,
      days: +this.form.days,
      reason: this.form.reason
    };
    const obs = this.editingId
      ? this.leaveService.update(this.editingId, req)
      : this.leaveService.create(req);
    obs.subscribe({
      next: () => { this.showModal = false; this.loadData(); },
      error: (err) => { alert('Failed to save leave: ' + (err?.error?.message || err?.message || 'Unknown error')); }
    });
  }

  deleteLeave(id: string) {
    if (!confirm('Delete this leave entry?')) return;
    this.leaveService.delete(id).subscribe({ next: () => this.loadData() });
  }
}
