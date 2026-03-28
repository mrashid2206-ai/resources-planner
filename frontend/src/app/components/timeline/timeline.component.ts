import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResourceService } from '../../services/resource.service';
import { Resource, MONTHS, getUtilizationColor } from '../../models/models';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1>Timeline</h1>
      <div class="year-nav">
        <button class="btn-icon" (click)="changeYear(-1)">◀</button>
        <span class="year-label">{{ year }}</span>
        <button class="btn-icon" (click)="changeYear(1)">▶</button>
      </div>
    </div>

    <div class="legend">
      <span class="legend-item"><span class="dot" style="background:#34d399"></span> &lt;50%</span>
      <span class="legend-item"><span class="dot" style="background:#a3e635"></span> 50–79%</span>
      <span class="legend-item"><span class="dot" style="background:#fbbf24"></span> 80–99%</span>
      <span class="legend-item"><span class="dot" style="background:#f87171"></span> ≥100%</span>
    </div>

    <div class="timeline-table-wrapper">
      <table class="timeline-table">
        <thead>
          <tr>
            <th class="sticky-col">Resource</th>
            <th *ngFor="let m of months; let i = index" class="month-col" [class.current]="i === currentMonth">{{ m }}</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let r of resources">
            <td class="sticky-col resource-cell">
              <div class="res-name">{{ r.name }}</div>
              <div class="res-role">{{ r.role }}</div>
            </td>
            <td *ngFor="let m of months; let i = index" class="month-cell" [class.current]="i === currentMonth">
              <!-- Utilization cell -->
              <div class="util-cell" [style.background]="getColor(r, i).bg" [style.color]="getColor(r, i).text" [style.border-color]="getColor(r, i).border">
                {{ getUtil(r, i) }}%
              </div>
              <!-- Assignment bars -->
              <div *ngFor="let a of getAssignmentsForMonth(r, i)" class="assign-bar" [class.bid-bar]="a.type === 'bid'"
                   [title]="a.name + ' (' + a.allocation + '%)'">
                <span class="bar-label">{{ a.name }}</span>
                <span class="bar-alloc">{{ a.allocation }}%</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div *ngIf="resources.length === 0" class="empty-state">No resources found.</div>
  `,
  styles: [`
    :host{display:block}
    .page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
    .page-header h1{font-size:22px;font-weight:700;margin:0}
    .year-nav{display:flex;align-items:center;gap:12px}
    .year-label{font-size:18px;font-weight:700;font-family:'JetBrains Mono',monospace;color:#a5b4fc}
    .btn-icon{background:none;border:1px solid #2d3548;color:#94a3b8;cursor:pointer;font-size:14px;padding:6px 10px;border-radius:6px}
    .btn-icon:hover{background:#1a1f2e}

    .legend{display:flex;gap:16px;margin-bottom:16px;flex-wrap:wrap}
    .legend-item{font-size:11px;color:#94a3b8;display:flex;align-items:center;gap:5px}
    .dot{width:10px;height:10px;border-radius:50%;display:inline-block}

    .timeline-table-wrapper{overflow-x:auto;border-radius:14px;border:1px solid #1e2433;background:#141820}
    .timeline-table{width:100%;border-collapse:collapse;min-width:900px}
    .timeline-table thead th{padding:12px 8px;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;background:#0c0f17;border-bottom:1px solid #1e2433;white-space:nowrap;text-align:center}
    .timeline-table thead th.current{background:rgba(99,102,241,.1);color:#a5b4fc}
    .sticky-col{position:sticky;left:0;z-index:2;background:#141820;min-width:160px;border-right:1px solid #1e2433}
    thead .sticky-col{background:#0c0f17 !important}
    .resource-cell{padding:10px 14px}
    .res-name{font-size:13px;font-weight:600;color:#e2e8f0}
    .res-role{font-size:10px;color:#64748b;margin-top:1px}
    .month-cell{padding:6px;border-right:1px solid #0c0f17;border-bottom:1px solid #0c0f17;vertical-align:top;min-width:72px}
    .month-cell.current{background:rgba(99,102,241,.03)}
    .util-cell{padding:4px 6px;border-radius:4px;font-size:11px;font-weight:700;font-family:'JetBrains Mono',monospace;text-align:center;border:1px solid;margin-bottom:3px}
    .assign-bar{padding:2px 6px;border-radius:3px;font-size:9px;margin-bottom:2px;display:flex;justify-content:space-between;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);color:#a5b4fc}
    .assign-bar.bid-bar{background:rgba(251,191,36,.06);border-color:rgba(251,191,36,.15);color:#fbbf24}
    .bar-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:50px}
    .bar-alloc{font-weight:700;font-family:'JetBrains Mono',monospace;flex-shrink:0}
    .empty-state{background:#141820;border:1px solid #1e2433;border-radius:14px;padding:60px 24px;text-align:center;color:#64748b}
  `]
})
export class TimelineComponent implements OnInit {
  resources: Resource[] = [];
  months = MONTHS;
  year = 2026;
  currentMonth = new Date().getMonth();

  constructor(private resourceService: ResourceService) {}
  ngOnInit() { this.load(); }

  load() {
    this.resourceService.getAll().subscribe({
      next: d => this.resources = d.filter(r => !r.isArchived),
      error: e => console.error(e)
    });
  }

  changeYear(delta: number) { this.year += delta; }

  getAssignmentsForMonth(r: Resource, month: number) {
    if (!r.assignments) return [];
    return r.assignments.filter(a =>
      month >= a.startMonth && month <= a.endMonth &&
      (a.startYear || this.year) <= this.year && (a.endYear || this.year) >= this.year
    );
  }

  getUtil(r: Resource, month: number): number {
    const assignments = this.getAssignmentsForMonth(r, month);
    const totalAlloc = assignments.reduce((sum, a) => sum + a.allocation, 0);
    const leaveDays = r.leaves?.find(l => l.month === month && l.year === this.year)?.days || 0;
    const capacity = Math.max(0, (r.monthlyCapacity || 22) - leaveDays);
    if (capacity === 0) return 0;
    return Math.round(totalAlloc);
  }

  getColor(r: Resource, month: number) {
    return getUtilizationColor(this.getUtil(r, month));
  }
}
