import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';
import { ProjectService } from '../../services/project.service';
import { BidService } from '../../services/bid.service';
import { DashboardData, MONTHS, getUtilizationColor, Project, Bid } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <div *ngIf="loading" class="loading">Loading dashboard data...</div>
      <div *ngIf="error" class="error-box">{{ error }}</div>

      <ng-container *ngIf="data && !loading">

        <!-- Section 1: Stat Cards -->
        <div class="stats-grid">
          <div class="stat-card top-purple">
            <span class="stat-label">Resources</span>
            <span class="stat-value purple">{{ data.totalResources }}</span>
          </div>
          <div class="stat-card"
            [class.top-green]="data.avgUtilization < 80"
            [class.top-yellow]="data.avgUtilization >= 80 && data.avgUtilization < 100"
            [class.top-red]="data.avgUtilization >= 100">
            <span class="stat-label">Avg Utilization</span>
            <span class="stat-value"
              [class.green]="data.avgUtilization < 80"
              [class.yellow]="data.avgUtilization >= 80 && data.avgUtilization < 100"
              [class.red]="data.avgUtilization >= 100">
              {{ data.avgUtilization | number:'1.0-0' }}%
            </span>
          </div>
          <div class="stat-card top-green">
            <span class="stat-label">Active Projects</span>
            <span class="stat-value green">{{ data.activeProjects }}</span>
          </div>
          <div class="stat-card top-yellow">
            <span class="stat-label">Active Bids</span>
            <span class="stat-value yellow">{{ data.activeBids }}</span>
          </div>
          <div class="stat-card top-green">
            <span class="stat-label">Total Budget</span>
            <span class="stat-value green">{{ formatMoney(data.totalBudget) }}</span>
          </div>
          <div class="stat-card top-yellow">
            <span class="stat-label">Weighted Pipeline</span>
            <span class="stat-value yellow">{{ formatMoney(data.weightedPipeline) }}</span>
          </div>
        </div>

        <!-- Section 2: Utilization Heatmap -->
        <div class="card">
          <h2 class="card-title">Resource Utilization Heatmap</h2>
          <div class="heatmap-wrap">
            <table class="heatmap">
              <thead>
                <tr>
                  <th class="col-resource">Resource</th>
                  <th *ngFor="let m of months" class="col-month">{{ m }}</th>
                  <th class="col-free">Free</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let entry of data.utilizationHeatmap">
                  <td class="col-resource">
                    <div class="res-name">{{ entry.resourceName }}</div>
                    <div class="res-role">{{ entry.role }}</div>
                  </td>
                  <td *ngFor="let util of entry.monthlyUtilization"
                      class="util-cell"
                      [style.background]="getColor(util).bg"
                      [style.color]="getColor(util).text"
                      [style.border-color]="getColor(util).border">
                    {{ util }}%
                  </td>
                  <td class="free-cell">{{ getFirstFreeMonth(entry.monthlyUtilization) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Section 3: Monthly Breakdown -->
        <div class="card">
          <h2 class="card-title">Monthly Breakdown</h2>
          <div class="month-pills">
            <button *ngFor="let m of months; let i = index"
                    class="month-pill" [class.active]="selectedMonth === i"
                    (click)="selectedMonth = i">{{ m }}</button>
          </div>
          <ng-container *ngIf="getMonthStats() as ms">
            <div class="month-stats-grid">
              <div class="stat-card small">
                <span class="stat-label">Capacity</span>
                <span class="stat-value purple">{{ ms.capacity }}d</span>
              </div>
              <div class="stat-card small">
                <span class="stat-label">Allocated</span>
                <span class="stat-value yellow">{{ ms.allocated }}d</span>
              </div>
              <div class="stat-card small">
                <span class="stat-label">Available</span>
                <span class="stat-value green">{{ ms.available }}d</span>
              </div>
              <div class="stat-card small">
                <span class="stat-label">Utilization</span>
                <span class="stat-value"
                  [class.green]="ms.utilization < 80"
                  [class.yellow]="ms.utilization >= 80 && ms.utilization < 100"
                  [class.red]="ms.utilization >= 100">{{ ms.utilization }}%</span>
              </div>
            </div>
          </ng-container>
          <div class="resource-bars">
            <div *ngFor="let entry of data.utilizationHeatmap" class="bar-row">
              <div class="bar-label">
                <span class="bar-name">{{ entry.resourceName }}</span>
                <span class="bar-pct">{{ entry.monthlyUtilization[selectedMonth] }}%</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill"
                     [style.width.%]="entry.monthlyUtilization[selectedMonth]"
                     [style.background]="getBarColor(entry.monthlyUtilization[selectedMonth])">
                </div>
              </div>
            </div>
            <div *ngIf="!data.utilizationHeatmap?.length" class="empty-msg">No resource data available</div>
          </div>
        </div>

        <!-- Section 4: Projects + Bids Breakdown -->
        <div class="breakdown-grid">
          <div class="card no-mb">
            <h2 class="card-title">Projects Breakdown</h2>
            <div class="breakdown-list">
              <div *ngFor="let p of projects" class="breakdown-row">
                <div class="bd-info">
                  <span class="bd-name">{{ p.name }}</span>
                  <span class="bd-client" *ngIf="p.client">{{ p.client }}</span>
                </div>
                <div class="bd-meta">
                  <span *ngIf="p.budget" class="bd-value">{{ formatMoney(p.budget) }}</span>
                  <span class="badge" [ngClass]="'badge-' + p.status">{{ formatStatus(p.status) }}</span>
                </div>
              </div>
              <div *ngIf="!projects.length" class="empty-msg">No projects yet</div>
            </div>
          </div>

          <div class="card no-mb">
            <h2 class="card-title">Bids Breakdown</h2>
            <div class="breakdown-list">
              <div *ngFor="let b of bids" class="breakdown-row">
                <div class="bd-info">
                  <span class="bd-name">{{ b.name }}</span>
                  <span class="bd-client" *ngIf="b.client">{{ b.client }}</span>
                </div>
                <div class="bd-meta">
                  <span *ngIf="b.estimatedValue" class="bd-value">{{ formatMoney(b.estimatedValue) }}</span>
                  <span *ngIf="b.probability" class="bd-prob">{{ b.probability }}%</span>
                  <span class="badge" [ngClass]="'badge-' + b.status">{{ formatStatus(b.status) }}</span>
                </div>
              </div>
              <div *ngIf="!bids.length" class="empty-msg">No bids yet</div>
            </div>
          </div>
        </div>

        <!-- Section 5: Export -->
        <div class="export-row">
          <button class="btn-export csv" (click)="exportCSV()">⬇ Export CSV</button>
          <button class="btn-export excel" (click)="exportExcel()">⬇ Export Excel</button>
          <button class="btn-export pdf" (click)="exportPDF()">⬇ Export PDF</button>
        </div>

      </ng-container>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1400px; }

    .loading { text-align: center; padding: 64px; color: #64748b; }
    .error-box { padding: 16px 20px; border-radius: 10px; color: #f87171; background: rgba(248,113,113,.08); border: 1px solid rgba(248,113,113,.2); margin-bottom: 20px; }

    /* ── Section 1: Stat Cards ── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 14px;
      margin-bottom: 20px;
    }

    .stat-card {
      background: #141820; border: 1px solid #1e2433; border-radius: 12px;
      padding: 18px 20px; display: flex; flex-direction: column; gap: 8px;
      border-top: 2px solid #1e2433;
    }
    .stat-card.small { padding: 14px 16px; }
    .stat-card.top-purple { border-top-color: #6366f1; }
    .stat-card.top-green  { border-top-color: #34d399; }
    .stat-card.top-yellow { border-top-color: #fbbf24; }
    .stat-card.top-red    { border-top-color: #f87171; }

    .stat-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: .5px; }
    .stat-value { font-size: 26px; font-weight: 700; font-family: 'JetBrains Mono', monospace; line-height: 1; }
    .stat-card.small .stat-value { font-size: 20px; }
    .stat-value.purple { color: #a5b4fc; }
    .stat-value.green  { color: #34d399; }
    .stat-value.yellow { color: #fbbf24; }
    .stat-value.red    { color: #f87171; }

    /* ── Cards ── */
    .card {
      background: #141820; border: 1px solid #1e2433; border-radius: 14px;
      padding: 24px; margin-bottom: 20px;
    }
    .card.no-mb { margin-bottom: 0; }
    .card-title { font-size: 15px; font-weight: 600; margin: 0 0 16px; }

    /* ── Section 2: Heatmap ── */
    .heatmap-wrap { overflow-x: auto; }
    .heatmap { width: 100%; border-collapse: separate; border-spacing: 3px; }
    .heatmap th { font-size: 11px; color: #64748b; font-weight: 500; padding: 6px; }
    .col-resource { text-align: left; min-width: 150px; }
    .col-month { text-align: center; min-width: 50px; }
    .col-free { text-align: center; min-width: 56px; color: #34d399; }
    .res-name { font-size: 13px; font-weight: 600; }
    .res-role { font-size: 11px; color: #64748b; }
    .util-cell {
      text-align: center; font-size: 11px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; border-radius: 6px;
      padding: 8px 4px; border: 1px solid;
    }
    .free-cell {
      text-align: center; font-size: 11px; font-weight: 600;
      color: #34d399; font-family: 'JetBrains Mono', monospace; padding: 8px 4px;
    }

    /* ── Section 3: Monthly Breakdown ── */
    .month-pills { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
    .month-pill {
      padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;
      color: #64748b; background: #1a1f2e; border: 1px solid #2d3548;
      cursor: pointer; font-family: inherit; transition: all .15s;
    }
    .month-pill:hover { color: #e2e8f0; border-color: #4a5568; }
    .month-pill.active { background: rgba(99,102,241,.15); color: #a5b4fc; border-color: rgba(99,102,241,.3); }

    .month-stats-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;
    }

    .resource-bars { display: flex; flex-direction: column; gap: 10px; }
    .bar-row { display: flex; flex-direction: column; gap: 4px; }
    .bar-label { display: flex; justify-content: space-between; align-items: center; }
    .bar-name { font-size: 12px; color: #94a3b8; }
    .bar-pct { font-size: 11px; font-weight: 600; font-family: 'JetBrains Mono', monospace; color: #64748b; }
    .bar-track { height: 8px; background: #1a1f2e; border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 4px; transition: width .3s ease; max-width: 100%; }

    /* ── Section 5: Export ── */
    .export-row { display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap; }
    .btn-export {
      flex: 1; min-width: 140px; padding: 14px 20px; border-radius: 10px;
      font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit;
      border: none; transition: all .2s; text-align: center;
    }
    .btn-export:hover { transform: translateY(-1px); filter: brightness(1.15); }
    .btn-export.csv { background: linear-gradient(135deg, #34d399, #059669); color: #fff; }
    .btn-export.excel { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; }
    .btn-export.pdf { background: linear-gradient(135deg, #f87171, #dc2626); color: #fff; }

    /* ── Section 5: Breakdown ── */
    .breakdown-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .breakdown-list { display: flex; flex-direction: column; gap: 6px; max-height: 380px; overflow-y: auto; }
    .breakdown-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 14px; background: #0c0f17; border-radius: 8px; border: 1px solid #1e2433;
    }
    .bd-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; margin-right: 12px; }
    .bd-name { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .bd-client { font-size: 11px; color: #64748b; }
    .bd-meta { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .bd-value { font-size: 12px; font-weight: 600; color: #34d399; font-family: 'JetBrains Mono', monospace; }
    .bd-prob { font-size: 11px; color: #fbbf24; font-weight: 600; }
    .empty-msg { text-align: center; padding: 24px; color: #64748b; font-size: 13px; }

    /* ── Badges ── */
    .badge { padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 600; white-space: nowrap; }
    .badge-active   { background: rgba(52,211,153,.1);  color: #34d399; border: 1px solid rgba(52,211,153,.2); }
    .badge-on_hold  { background: rgba(251,191,36,.08); color: #fbbf24; border: 1px solid rgba(251,191,36,.2); }
    .badge-completed{ background: rgba(96,165,250,.1);  color: #60a5fa; border: 1px solid rgba(96,165,250,.2); }
    .badge-pending  { background: rgba(148,163,184,.1); color: #94a3b8; border: 1px solid rgba(148,163,184,.2); }
    .badge-submitted{ background: rgba(251,191,36,.08); color: #fbbf24; border: 1px solid rgba(251,191,36,.2); }
    .badge-won      { background: rgba(52,211,153,.1);  color: #34d399; border: 1px solid rgba(52,211,153,.2); }
    .badge-lost     { background: rgba(248,113,113,.1); color: #f87171; border: 1px solid rgba(248,113,113,.2); }

    /* ── Responsive ── */
    @media (max-width: 900px) {
      .breakdown-grid { grid-template-columns: 1fr; }
      .month-pills { gap: 4px; }
      .month-pill { padding: 4px 10px; font-size: 11px; }
    }
    @media (max-width: 640px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .month-stats-grid { grid-template-columns: repeat(2, 1fr); }
      .export-row { flex-direction: column; }
      .btn-export { min-width: unset; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  data: DashboardData | null = null;
  projects: Project[] = [];
  bids: Bid[] = [];
  loading = true;
  error = '';
  months = MONTHS;
  selectedMonth = new Date().getMonth();

  constructor(
    private dashboardService: DashboardService,
    private projectService: ProjectService,
    private bidService: BidService
  ) {}

  ngOnInit() {
    forkJoin({
      dashboard: this.dashboardService.getDashboardData(),
      projects: this.projectService.getAll(),
      bids: this.bidService.getAll()
    }).subscribe({
      next: ({ dashboard, projects, bids }) => {
        this.data = dashboard;
        this.projects = projects.filter(p => !p.isArchived);
        this.bids = bids.filter(b => !b.isArchived);
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load dashboard data. Please check the backend is running.';
        this.loading = false;
      }
    });
  }

  getColor(util: number) { return getUtilizationColor(util); }

  getBarColor(util: number): string {
    if (util === 0) return '#2d3548';
    if (util < 50) return '#34d399';
    if (util < 80) return '#a3e635';
    if (util < 100) return '#fbbf24';
    return '#f87171';
  }

  getFirstFreeMonth(monthlyUtilization: number[]): string {
    const idx = monthlyUtilization.findIndex(u => u === 0);
    return idx === -1 ? '—' : MONTHS[idx];
  }

  getMonthStats(): { capacity: number; allocated: number; available: number; utilization: number } {
    if (!this.data?.capacityForecast.length) {
      return { capacity: 0, allocated: 0, available: 0, utilization: 0 };
    }
    const f = this.data.capacityForecast.find(m => m.monthIndex === this.selectedMonth)
      ?? this.data.capacityForecast[0];
    const utilization = f.totalCapacity > 0
      ? Math.round((f.totalAllocated / f.totalCapacity) * 100) : 0;
    return { capacity: f.totalCapacity, allocated: f.totalAllocated, available: f.availableCapacity, utilization };
  }

  formatMoney(val: any): string {
    const n = Number(val);
    if (!n) return '$0';
    if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1000) return '$' + (n / 1000).toFixed(0) + 'k';
    return '$' + n;
  }

  formatStatus(s: string): string {
    return s === 'on_hold' ? 'On Hold' : s.charAt(0).toUpperCase() + s.slice(1);
  }

  // ── Export: CSV ──
  exportCSV() {
    if (!this.data) return;
    const lines: string[] = [];

    // Summary
    lines.push('"Resource Planner Pro — Dashboard Export"');
    lines.push('');
    lines.push('"Metric","Value"');
    lines.push(`"Total Resources","${this.data.totalResources}"`);
    lines.push(`"Avg Utilization","${this.data.avgUtilization}%"`);
    lines.push(`"Active Projects","${this.data.activeProjects}"`);
    lines.push(`"Active Bids","${this.data.activeBids}"`);
    lines.push(`"Total Budget","${this.data.totalBudget}"`);
    lines.push(`"Weighted Pipeline","${this.data.weightedPipeline}"`);
    lines.push('');

    // Utilization heatmap
    lines.push('"Resource","Role",' + MONTHS.map(m => `"${m}"`).join(',') + ',"Avg"');
    for (const e of this.data.utilizationHeatmap) {
      const avg = Math.round(e.monthlyUtilization.reduce((s, v) => s + v, 0) / 12);
      lines.push(`"${e.resourceName}","${e.role}",` +
        e.monthlyUtilization.map(u => `"${u}%"`).join(',') + `,"${avg}%"`);
    }
    lines.push('');

    // Capacity forecast
    if (this.data.capacityForecast?.length) {
      lines.push('"Month","Total Capacity","Allocated","Available"');
      for (const f of this.data.capacityForecast) {
        lines.push(`"${f.monthName}","${f.totalCapacity}","${f.totalAllocated}","${f.availableCapacity}"`);
      }
      lines.push('');
    }

    // Projects
    lines.push('"Projects"');
    lines.push('"Name","Status","Client","Budget","Start","End"');
    for (const p of this.projects) {
      lines.push(`"${p.name}","${p.status}","${p.client || ''}","${p.budget || 0}","${MONTHS[p.startMonth]}","${MONTHS[p.endMonth]}"`);
    }
    lines.push('');

    // Bids
    lines.push('"Bids"');
    lines.push('"Name","Status","Client","Est. Value","Probability","Start","End"');
    for (const b of this.bids) {
      lines.push(`"${b.name}","${b.status}","${b.client || ''}","${b.estimatedValue || 0}","${b.probability || 0}%","${MONTHS[b.startMonth]}","${MONTHS[b.endMonth]}"`);
    }

    this.download('dashboard-export.csv', lines.join('\n'), 'text/csv');
  }

  // ── Export: Excel (SpreadsheetML XML) ──
  exportExcel() {
    if (!this.data) return;
    const esc = (v: any) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');

    let sheets = '';

    // Sheet 1: Summary
    sheets += `<Worksheet ss:Name="Summary"><Table>`;
    sheets += this.xlRow(['Metric', 'Value'], true);
    sheets += this.xlRow(['Total Resources', this.data.totalResources]);
    sheets += this.xlRow(['Avg Utilization', this.data.avgUtilization + '%']);
    sheets += this.xlRow(['Active Projects', this.data.activeProjects]);
    sheets += this.xlRow(['Active Bids', this.data.activeBids]);
    sheets += this.xlRow(['Total Budget', this.data.totalBudget]);
    sheets += this.xlRow(['Weighted Pipeline', this.data.weightedPipeline]);
    sheets += `</Table></Worksheet>`;

    // Sheet 2: Utilization
    sheets += `<Worksheet ss:Name="Utilization"><Table>`;
    sheets += this.xlRow(['Resource', 'Role', ...MONTHS, 'Avg'], true);
    for (const e of this.data.utilizationHeatmap) {
      const avg = Math.round(e.monthlyUtilization.reduce((s, v) => s + v, 0) / 12);
      sheets += this.xlRow([e.resourceName, e.role, ...e.monthlyUtilization.map(u => u + '%'), avg + '%']);
    }
    sheets += `</Table></Worksheet>`;

    // Sheet 3: Capacity Forecast
    if (this.data.capacityForecast?.length) {
      sheets += `<Worksheet ss:Name="Capacity"><Table>`;
      sheets += this.xlRow(['Month', 'Total Capacity', 'Allocated', 'Available'], true);
      for (const f of this.data.capacityForecast) {
        sheets += this.xlRow([f.monthName, f.totalCapacity, f.totalAllocated, f.availableCapacity]);
      }
      sheets += `</Table></Worksheet>`;
    }

    // Sheet 4: Projects
    sheets += `<Worksheet ss:Name="Projects"><Table>`;
    sheets += this.xlRow(['Name', 'Status', 'Client', 'Budget', 'Start', 'End'], true);
    for (const p of this.projects) {
      sheets += this.xlRow([p.name, p.status, p.client || '', p.budget || 0, MONTHS[p.startMonth], MONTHS[p.endMonth]]);
    }
    sheets += `</Table></Worksheet>`;

    // Sheet 5: Bids
    sheets += `<Worksheet ss:Name="Bids"><Table>`;
    sheets += this.xlRow(['Name', 'Status', 'Client', 'Est. Value', 'Probability', 'Start', 'End'], true);
    for (const b of this.bids) {
      sheets += this.xlRow([b.name, b.status, b.client || '', b.estimatedValue || 0, (b.probability || 0) + '%', MONTHS[b.startMonth], MONTHS[b.endMonth]]);
    }
    sheets += `</Table></Worksheet>`;

    const xml = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>` +
      `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ` +
      `xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">` +
      `<Styles><Style ss:ID="hdr"><Font ss:Bold="1"/><Interior ss:Color="#E2E8F0" ss:Pattern="Solid"/></Style></Styles>` +
      sheets + `</Workbook>`;

    this.download('dashboard-export.xls', xml, 'application/vnd.ms-excel');
  }

  private xlRow(cells: any[], header = false): string {
    const style = header ? ' ss:StyleID="hdr"' : '';
    return '<Row>' + cells.map(c => {
      const v = String(c ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
      const isNum = typeof c === 'number';
      return `<Cell${style}><Data ss:Type="${isNum ? 'Number' : 'String'}">${v}</Data></Cell>`;
    }).join('') + '</Row>';
  }

  // ── Export: PDF (printable HTML) ──
  exportPDF() {
    if (!this.data) return;

    const rows = this.data.utilizationHeatmap.map(e => {
      const avg = Math.round(e.monthlyUtilization.reduce((s, v) => s + v, 0) / 12);
      return `<tr><td>${e.resourceName}</td><td>${e.role}</td>` +
        e.monthlyUtilization.map(u => `<td style="text-align:center">${u}%</td>`).join('') +
        `<td style="text-align:center;font-weight:bold">${avg}%</td></tr>`;
    }).join('');

    const projRows = this.projects.map(p =>
      `<tr><td>${p.name}</td><td>${p.status}</td><td>${p.client || '—'}</td><td style="text-align:right">$${p.budget?.toLocaleString() || '0'}</td><td>${MONTHS[p.startMonth]}–${MONTHS[p.endMonth]}</td></tr>`
    ).join('') || '<tr><td colspan="5" style="text-align:center;color:#999">No projects</td></tr>';

    const bidRows = this.bids.map(b =>
      `<tr><td>${b.name}</td><td>${b.status}</td><td>${b.client || '—'}</td><td style="text-align:right">$${b.estimatedValue?.toLocaleString() || '0'}</td><td>${b.probability || 0}%</td><td>${MONTHS[b.startMonth]}–${MONTHS[b.endMonth]}</td></tr>`
    ).join('') || '<tr><td colspan="6" style="text-align:center;color:#999">No bids</td></tr>';

    const html = `<!DOCTYPE html><html><head><title>Dashboard Report</title>
      <style>
        body{font-family:Arial,sans-serif;padding:32px;color:#1a1a2e;max-width:1200px;margin:0 auto}
        h1{font-size:22px;margin-bottom:4px}
        .sub{color:#666;font-size:13px;margin-bottom:24px}
        .stats{display:flex;gap:16px;margin-bottom:24px;flex-wrap:wrap}
        .stat{border:1px solid #ddd;border-radius:8px;padding:12px 16px;min-width:120px}
        .stat-label{font-size:11px;color:#666;text-transform:uppercase}
        .stat-val{font-size:22px;font-weight:700}
        h2{font-size:16px;margin:24px 0 8px;border-bottom:1px solid #ddd;padding-bottom:6px}
        table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:16px}
        th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}
        th{background:#f0f0f5;font-weight:600}
        @media print{body{padding:16px} .no-print{display:none}}
      </style>
    </head><body>
      <h1>Resource Planner Pro — Dashboard Report</h1>
      <div class="sub">Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      <div class="stats">
        <div class="stat"><div class="stat-label">Resources</div><div class="stat-val">${this.data.totalResources}</div></div>
        <div class="stat"><div class="stat-label">Avg Utilization</div><div class="stat-val">${Math.round(this.data.avgUtilization)}%</div></div>
        <div class="stat"><div class="stat-label">Projects</div><div class="stat-val">${this.data.activeProjects}</div></div>
        <div class="stat"><div class="stat-label">Bids</div><div class="stat-val">${this.data.activeBids}</div></div>
        <div class="stat"><div class="stat-label">Budget</div><div class="stat-val">$${this.data.totalBudget.toLocaleString()}</div></div>
        <div class="stat"><div class="stat-label">Pipeline</div><div class="stat-val">$${this.data.weightedPipeline.toLocaleString()}</div></div>
      </div>
      <h2>Utilization Heatmap</h2>
      <table><thead><tr><th>Resource</th><th>Role</th>${MONTHS.map(m => `<th>${m}</th>`).join('')}<th>Avg</th></tr></thead><tbody>${rows}</tbody></table>
      <h2>Projects (${this.projects.length})</h2>
      <table><thead><tr><th>Name</th><th>Status</th><th>Client</th><th>Budget</th><th>Period</th></tr></thead><tbody>${projRows}</tbody></table>
      <h2>Bids (${this.bids.length})</h2>
      <table><thead><tr><th>Name</th><th>Status</th><th>Client</th><th>Est. Value</th><th>Prob.</th><th>Period</th></tr></thead><tbody>${bidRows}</tbody></table>
    </body></html>`;

    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
      setTimeout(() => w.print(), 400);
    }
  }

  private download(filename: string, content: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
