import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';
import { ResourceService } from '../../services/resource.service';
import { ProjectService } from '../../services/project.service';
import { BidService } from '../../services/bid.service';
import { DashboardData, Resource, Project, Bid, MONTHS, getUtilizationColor } from '../../models/models';

@Component({
  selector: 'app-portal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1>Portal (Read-Only)</h1>
      <div class="portal-badge">🔒 Stakeholder View</div>
    </div>

    <div class="info-banner">
      This is a read-only stakeholder portal showing current resource allocation, active projects, and bid pipeline status.
    </div>

    <!-- Summary cards -->
    <div class="summary-cards" *ngIf="dashboard">
      <div class="stat-card">
        <div class="stat-value">{{ dashboard.totalResources }}</div>
        <div class="stat-label">Team Members</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ dashboard.avgUtilization | number:'1.0-0' }}%</div>
        <div class="stat-label">Avg Utilization</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ dashboard.activeProjects }}</div>
        <div class="stat-label">Active Projects</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ dashboard.activeBids }}</div>
        <div class="stat-label">Active Bids</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ formatMoney(dashboard.totalBudget) }}</div>
        <div class="stat-label">Total Budget</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ formatMoney(dashboard.weightedPipeline) }}</div>
        <div class="stat-label">Weighted Pipeline</div>
      </div>
    </div>

    <!-- Active Projects -->
    <h2 class="section-title">Active Projects</h2>
    <div class="portal-grid">
      <div *ngFor="let p of projects" class="portal-card">
        <div class="pc-header">
          <h3>{{ p.name }}</h3>
          <span class="badge badge-active">{{ p.status }}</span>
        </div>
        <div class="pc-meta">
          <span *ngIf="p.client">📋 {{ p.client }}</span>
          <span>📅 {{ months[p.startMonth] }}–{{ months[p.endMonth] }}</span>
          <span>💰 {{ formatMoney(p.budget) }}</span>
        </div>
        <div *ngIf="p.assignments?.length" class="pc-team">
          <span *ngFor="let a of p.assignments" class="team-chip">{{ a.resourceName }} ({{ a.allocation }}%)</span>
        </div>
      </div>
    </div>

    <!-- Bid Pipeline -->
    <h2 class="section-title">Bid Pipeline</h2>
    <div class="portal-grid">
      <div *ngFor="let b of bids" class="portal-card">
        <div class="pc-header">
          <h3>{{ b.name }}</h3>
          <span class="badge" [ngClass]="'badge-' + b.status">{{ b.status }}</span>
        </div>
        <div class="pc-meta">
          <span *ngIf="b.client">📋 {{ b.client }}</span>
          <span>💰 {{ formatMoney(b.estimatedValue) }}</span>
          <span *ngIf="b.probability != null">🎯 {{ b.probability }}%</span>
        </div>
      </div>
    </div>

    <!-- Team Utilization -->
    <h2 class="section-title">Team Utilization</h2>
    <div class="util-table-wrap">
      <table class="util-table" *ngIf="resources.length">
        <thead>
          <tr>
            <th>Resource</th>
            <th *ngFor="let m of months">{{ m }}</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let r of resources">
            <td class="res-cell"><span class="res-name">{{ r.name }}</span><span class="res-role">{{ r.role }}</span></td>
            <td *ngFor="let m of months; let i = index">
              <div class="util-pill" [style.background]="getColor(getUtil(r, i)).bg" [style.color]="getColor(getUtil(r, i)).text">
                {{ getUtil(r, i) }}%
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    :host{display:block}
    .page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
    .page-header h1{font-size:22px;font-weight:700;margin:0}
    .portal-badge{padding:6px 14px;border-radius:8px;background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.2);color:#fbbf24;font-size:12px;font-weight:600}
    .info-banner{padding:12px 18px;border-radius:10px;background:rgba(99,102,241,.06);border:1px solid rgba(99,102,241,.15);color:#a5b4fc;font-size:13px;margin-bottom:24px}
    .summary-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-bottom:28px}
    .stat-card{background:#141820;border:1px solid #1e2433;border-radius:12px;padding:18px;text-align:center}
    .stat-value{font-size:24px;font-weight:800;font-family:'JetBrains Mono',monospace;color:#e2e8f0}
    .stat-label{font-size:11px;color:#64748b;margin-top:4px;text-transform:uppercase;letter-spacing:.5px}
    .section-title{font-size:16px;font-weight:600;margin:24px 0 14px;padding-bottom:8px;border-bottom:1px solid #1e2433}
    .portal-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px;margin-bottom:8px}
    .portal-card{background:#141820;border:1px solid #1e2433;border-radius:12px;padding:18px}
    .pc-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;gap:10px}
    .pc-header h3{margin:0;font-size:14px;font-weight:600}
    .badge{padding:3px 10px;border-radius:6px;font-size:10px;font-weight:600}
    .badge-active{background:rgba(52,211,153,.1);color:#34d399;border:1px solid rgba(52,211,153,.2)}
    .badge-pending{background:rgba(251,191,36,.08);color:#fbbf24;border:1px solid rgba(251,191,36,.2)}
    .badge-submitted{background:rgba(96,165,250,.1);color:#60a5fa;border:1px solid rgba(96,165,250,.2)}
    .badge-won{background:rgba(52,211,153,.1);color:#34d399;border:1px solid rgba(52,211,153,.2)}
    .badge-lost{background:rgba(248,113,113,.08);color:#f87171;border:1px solid rgba(248,113,113,.2)}
    .pc-meta{display:flex;gap:12px;font-size:11px;color:#94a3b8;flex-wrap:wrap}
    .pc-team{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
    .team-chip{padding:3px 10px;border-radius:6px;font-size:10px;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);color:#a5b4fc}
    .util-table-wrap{overflow-x:auto;border-radius:12px;border:1px solid #1e2433;background:#141820}
    .util-table{width:100%;border-collapse:collapse;min-width:800px}
    .util-table thead th{padding:10px 6px;font-size:10px;font-weight:600;color:#64748b;text-transform:uppercase;background:#0c0f17;border-bottom:1px solid #1e2433;text-align:center}
    .util-table tbody td{padding:6px;border-bottom:1px solid #0c0f17;text-align:center}
    .res-cell{text-align:left !important;padding:8px 14px;min-width:140px}
    .res-name{display:block;font-size:12px;font-weight:600;color:#e2e8f0}
    .res-role{font-size:10px;color:#64748b}
    .util-pill{padding:3px 6px;border-radius:4px;font-size:10px;font-weight:700;font-family:'JetBrains Mono',monospace;display:inline-block;min-width:36px}
  `]
})
export class PortalComponent implements OnInit {
  months = MONTHS;
  dashboard: DashboardData | null = null;
  resources: Resource[] = [];
  projects: Project[] = [];
  bids: Bid[] = [];

  constructor(
    private dashboardService: DashboardService,
    private resourceService: ResourceService,
    private projectService: ProjectService,
    private bidService: BidService
  ) {}

  ngOnInit() {
    this.dashboardService.getStats(2026).subscribe({ next: d => this.dashboard = d });
    this.resourceService.getAll().subscribe({ next: d => this.resources = d.filter(r => !r.isArchived) });
    this.projectService.getAll().subscribe({ next: d => this.projects = d.filter(p => p.status === 'active') });
    this.bidService.getAll().subscribe({ next: d => this.bids = d.filter(b => b.status !== 'lost') });
  }

  getUtil(r: Resource, month: number): number {
    if (!r.assignments) return 0;
    const active = r.assignments.filter(a => month >= a.startMonth && month <= a.endMonth);
    return active.reduce((sum, a) => sum + a.allocation, 0);
  }

  getColor(util: number) { return getUtilizationColor(util); }

  formatMoney(val: any): string {
    if (!val) return '$0';
    const n = Number(val);
    if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return '$' + (n / 1000).toFixed(0) + 'k';
    return '$' + n;
  }
}
