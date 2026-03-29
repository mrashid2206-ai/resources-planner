import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ResourceService } from '../../services/resource.service';
import { ProjectService } from '../../services/project.service';
import { BidService } from '../../services/bid.service';
import { Resource, Project, Bid, Assignment, MONTHS } from '../../models/models';
import { AuthService } from '../../services/auth.service';

const TAG_COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#ef4444','#f97316','#eab308','#22c55e',
  '#14b8a6','#3b82f6','#06b6d4','#a855f7','#d946ef','#f43f5e','#fb923c',
  '#84cc16','#2dd4bf','#60a5fa','#818cf8','#c084fc','#e879f9'
];

const REGION_MAP: Record<string, string> = {
  'qatar':'Middle East','saudi':'Middle East','uae':'Middle East','oman':'Middle East',
  'bahrain':'Middle East','lebanon':'Middle East','aljouf':'Aljouf (KSA)',
  'angola':'Africa','kenya':'Africa','kenay':'Africa','somalia':'Africa',
  'south africa':'Africa','zambia':'Africa','libya':'Africa',
  'mongolia':'Asia / Oceania',
  'peru':'Americas','colombia':'Americas','uruguay':'Americas',
  'norway':'Europe'
};

interface ResourceCard {
  resource: Resource;
  h1Avg: number;
  h2Avg: number;
  overallAvg: number;
  projectCount: number;
  bidCount: number;
  projectAssignments: Assignment[];
  bidAssignments: Assignment[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="portfolio-dashboard" *ngIf="!loading">
      <!-- Header -->
      <div class="dash-header">
        <div class="header-left">
          <h1 class="dash-title">Portfolio Resource Dashboard</h1>
          <p class="dash-sub">{{ selectedYear }} · Project Management Team</p>
        </div>
        <div class="header-right">
          <a routerLink="/manage/resources" class="manage-btn">Manage Data</a>
          <div class="header-sep"></div>
          <label class="filter-label">View</label>
          <select class="filter-select" [(ngModel)]="currentView">
            <option value="overview">Overview</option>
            <option value="resources">Resources</option>
            <option value="projects">Projects</option>
            <option value="bids">Bids & Pipeline</option>
          </select>
          <label class="filter-label">Year</label>
          <select class="filter-select" [(ngModel)]="selectedYear" (ngModelChange)="onFilterChange()">
            <option *ngFor="let y of availableYears" [ngValue]="y">{{ y }}</option>
          </select>
          <label class="filter-label">Role</label>
          <select class="filter-select role-select" [(ngModel)]="selectedRole" (ngModelChange)="onFilterChange()">
            <option value="">All Roles</option>
            <option *ngFor="let r of roles" [value]="r">{{r}}</option>
          </select>
          <label class="filter-label">Type</label>
          <select class="filter-select" [(ngModel)]="selectedType" (ngModelChange)="onFilterChange()">
            <option value="">All Types</option>
            <option value="full_time">SITA Full Time</option>
            <option value="part_time">Contractor</option>
          </select>
          <div class="header-sep"></div>
          <div class="export-group">
            <button class="icon-btn export-btn" (click)="exportCSV()" title="Export CSV">CSV</button>
            <button class="icon-btn export-btn" (click)="exportExcel()" title="Export Excel">XLS</button>
            <button class="icon-btn export-btn" (click)="exportPDF()" title="Export PDF">PDF</button>
          </div>
          <button class="icon-btn logout-btn" (click)="logout()" title="Sign Out">Sign Out</button>
        </div>
      </div>

      <!-- ═══════════ OVERVIEW ═══════════ -->
      <ng-container *ngIf="currentView === 'overview'">
        <!-- Stat Cards -->
        <div class="stats-row">
          <div class="stat-card sc-blue">
            <span class="sc-label">TEAM SIZE</span>
            <span class="sc-value blue">{{ filteredCards.length }}</span>
            <span class="sc-sub">Active resources</span>
          </div>
          <div class="stat-card sc-green">
            <span class="sc-label">ACTIVE PROJECTS</span>
            <span class="sc-value green">{{ filteredProjects.length }}</span>
            <span class="sc-sub">Across all regions</span>
          </div>
          <div class="stat-card sc-yellow">
            <span class="sc-label">BIDS IN PIPELINE</span>
            <span class="sc-value yellow">{{ filteredBids.length }}</span>
            <span class="sc-sub">All pending</span>
          </div>
          <div class="stat-card sc-red">
            <span class="sc-label">OVER-ALLOCATED</span>
            <span class="sc-value red">{{ overAllocatedCount }}</span>
            <span class="sc-sub">&gt;100% utilization (H1)</span>
          </div>
          <div class="stat-card sc-purple wide">
            <span class="sc-label">AVG UTILIZATION H1</span>
            <span class="sc-value purple lg">{{ avgH1 }}%</span>
            <span class="sc-sub">Jan – Jun {{ selectedYear }}</span>
          </div>
          <div class="stat-card sc-purple wide">
            <span class="sc-label">AVG UTILIZATION H2</span>
            <span class="sc-value purple lg">{{ avgH2 }}%</span>
            <span class="sc-sub">Jul – Dec {{ selectedYear }}</span>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="charts-row">
          <!-- H1 vs H2 Bar Chart -->
          <div class="chart-card">
            <h3 class="chart-title">RESOURCE UTILIZATION H1 VS H2 ({{ selectedYear }})</h3>
            <div class="chart-legend">
              <span class="legend-item"><span class="legend-box" style="background:#c0392b"></span> H1 Avg (%)</span>
              <span class="legend-item"><span class="legend-box" style="background:#7d8c3b"></span> H2 Avg (%)</span>
            </div>
            <div class="bar-chart">
              <div class="bar-y-axis">
                <span>120%</span><span>100%</span><span>80%</span><span>60%</span><span>40%</span><span>20%</span><span>0%</span>
              </div>
              <div class="bar-area">
                <div class="bar-group" *ngFor="let c of filteredCards">
                  <div class="bar-pair">
                    <div class="bar h1-bar" [style.height.%]="c.h1Avg / 1.2"></div>
                    <div class="bar h2-bar" [style.height.%]="c.h2Avg / 1.2"></div>
                  </div>
                  <div class="bar-x-label">{{ getFirstName(c.resource.name) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Donut Chart -->
          <div class="chart-card">
            <h3 class="chart-title">TEAM CAPACITY SPLIT — JAN VS JUL</h3>
            <div class="donut-wrap">
              <div class="donut" [style.background]="donutGradient">
                <div class="donut-hole"></div>
              </div>
              <div class="donut-legend">
                <div class="dl-item"><span class="dl-dot" style="background:#e74c3c"></span> Over-allocated (&gt;100%)</div>
                <div class="dl-item"><span class="dl-dot" style="background:#e67e22"></span> Fully allocated (90–100%)</div>
                <div class="dl-item"><span class="dl-dot" style="background:#c5a028"></span> Well allocated (70–89%)</div>
                <div class="dl-item"><span class="dl-dot" style="background:#27ae60"></span> Under-allocated (&lt;70%)</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Row 2 -->
        <div class="charts-row">
          <!-- Projects by Region -->
          <div class="chart-card">
            <h3 class="chart-title">PROJECTS BY REGION / COUNTRY</h3>
            <div class="h-bar-chart">
              <div class="h-bar-row" *ngFor="let r of regionData">
                <span class="h-bar-label">{{ r.region }}</span>
                <div class="h-bar-track">
                  <div class="h-bar-fill" [style.width.%]="r.count / maxRegionCount * 100"
                       [style.background]="r.region === 'Middle East' ? '#5b6abf' : r.region === 'Africa' ? '#4e7abf' : '#6f8fbf'"></div>
                </div>
                <span class="h-bar-val">{{ r.count }}</span>
              </div>
            </div>
          </div>

          <!-- Workload Distribution -->
          <div class="chart-card">
            <h3 class="chart-title">WORKLOAD DISTRIBUTION — H1 ACTIVE PROJECTS</h3>
            <div class="stacked-chart">
              <div class="stacked-y-axis">
                <span>100%</span><span>90%</span><span>80%</span><span>70%</span><span>60%</span>
                <span>50%</span><span>40%</span><span>30%</span><span>20%</span><span>10%</span><span>0%</span>
              </div>
              <div class="stacked-area">
                <div class="stacked-col" *ngFor="let c of filteredCards">
                  <div class="stacked-bar">
                    <div *ngFor="let seg of getWorkloadSegments(c)"
                         class="stacked-seg"
                         [style.flex]="seg.allocation"
                         [style.background]="seg.color"
                         [title]="seg.name + ' ' + seg.allocation + '%'">
                    </div>
                  </div>
                  <div class="stacked-label">{{ getFirstName(c.resource.name) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Heatmap (shown when role is filtered) -->
        <div class="chart-card full-width" *ngIf="selectedRole || selectedType">
          <h3 class="chart-title">MONTHLY UTILIZATION HEATMAP — ALL RESOURCES</h3>
          <div class="heatmap-wrap">
            <table class="heatmap">
              <thead>
                <tr>
                  <th class="hm-res">Resource</th>
                  <th *ngFor="let m of months" class="hm-month">{{ m }}</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let c of filteredCards">
                  <td class="hm-res">
                    <div class="hm-name">{{ c.resource.name }}</div>
                    <div class="hm-role">{{ c.resource.role }}</div>
                  </td>
                  <td *ngFor="let m of [0,1,2,3,4,5,6,7,8,9,10,11]"
                      class="hm-cell"
                      [style.background]="getHeatColor(getMonthAlloc(c.resource, m)).bg"
                      [style.color]="getHeatColor(getMonthAlloc(c.resource, m)).text">
                    {{ getMonthAlloc(c.resource, m) }}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ng-container>

      <!-- ═══════════ RESOURCES ═══════════ -->
      <ng-container *ngIf="currentView === 'resources'">
        <h2 class="section-title">TEAM RESOURCE CARDS</h2>
        <div class="resource-grid">
          <div class="res-card" *ngFor="let c of filteredCards">
            <div class="res-card-header">
              <div>
                <div class="res-card-name">{{ c.resource.name }}</div>
                <div class="res-card-role">{{ c.resource.role }}</div>
              </div>
              <div class="res-card-pct" [style.color]="getUtilColor(c.h1Avg)">{{ Math.round(c.h1Avg) }}%</div>
            </div>
            <div class="res-card-bar">
              <div class="res-card-fill" [style.width.%]="Math.min(c.h1Avg, 100)" [style.background]="getUtilColor(c.h1Avg)"></div>
            </div>
            <div class="res-card-stats">
              <span>H1 avg: <b [style.color]="getUtilColor(c.h1Avg)">{{ Math.round(c.h1Avg) }}%</b></span>
              <span>| H2 avg: <b [style.color]="getUtilColor(c.h2Avg)">{{ Math.round(c.h2Avg) }}%</b></span>
              <span>| {{ c.projectCount }} project{{ c.projectCount !== 1 ? 's' : '' }}, {{ c.bidCount }} bid{{ c.bidCount !== 1 ? 's' : '' }}</span>
            </div>
            <div class="res-card-tags">
              <span *ngFor="let a of c.projectAssignments.concat(c.bidAssignments).slice(0,6)"
                    class="tag-pill" [style.border-color]="getTagColor(a.name)">
                <span class="tag-dot" [style.background]="getTagColor(a.name)"></span>
                {{ truncate(a.name, 18) }}
              </span>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- ═══════════ PROJECTS ═══════════ -->
      <ng-container *ngIf="currentView === 'projects'">
        <h2 class="section-title">ACTIVE PROJECTS</h2>
        <div class="chart-card full-width">
          <table class="proj-table">
            <thead>
              <tr>
                <th (click)="sortProjects('name')" class="sortable">PROJECT <span class="sort-arrow">↕</span></th>
                <th (click)="sortProjects('client')" class="sortable">CLIENT <span class="sort-arrow">↕</span></th>
                <th>PERIOD</th>
                <th (click)="sortProjects('resources')" class="sortable"># RESOURCES <span class="sort-arrow">↕</span></th>
                <th>ASSIGNED TEAM</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of sortedProjects">
                <td class="proj-name">{{ p.name }}</td>
                <td class="proj-client">{{ p.client || '—' }}</td>
                <td class="proj-period">{{ months[p.startMonth] }} {{ p.startYear }}–{{ months[p.endMonth] }} {{ p.endYear }}</td>
                <td class="proj-count">{{ p.assignments?.length || 0 }}</td>
                <td class="proj-team">
                  <span *ngFor="let a of p.assignments" class="team-tag" [style.background]="getTagColor(a.resourceName || a.name) + '22'" [style.color]="getTagColor(a.resourceName || a.name)">
                    {{ a.resourceName || a.name }} {{ a.allocation }}%
                  </span>
                </td>
                <td><span class="status-badge active">Active</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </ng-container>

      <!-- ═══════════ BIDS ═══════════ -->
      <ng-container *ngIf="currentView === 'bids'">
        <h2 class="section-title">BIDS & PROPOSALS PIPELINE ({{ filteredBids.length }} PENDING)</h2>
        <div class="bids-grid">
          <div class="bid-card" *ngFor="let b of filteredBids">
            <div class="bid-card-name">{{ b.name }}</div>
            <div class="bid-card-meta">
              <span *ngIf="b.client" class="bid-client">{{ b.client }}</span>
              <span class="bid-period">{{ months[b.startMonth] }} {{ b.startYear }}–{{ months[b.endMonth] }} {{ b.endYear }}</span>
              · <span class="bid-status">Pending</span>
            </div>
            <div class="bid-card-tags">
              <span *ngFor="let a of b.assignments" class="team-tag sm"
                    [style.background]="getTagColor(a.resourceName || a.name) + '22'"
                    [style.color]="getTagColor(a.resourceName || a.name)">
                {{ a.resourceName || a.name }} {{ a.allocation }}%
              </span>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- Footer -->
      <div class="dash-footer">
        Portfolio Resource Dashboard · {{ selectedYear }} · Data extracted from resource management tool
      </div>
    </div>

    <div *ngIf="loading" class="loading-screen">Loading dashboard...</div>
  `,
  styles: [`
    :host { display: block; }
    .loading-screen { text-align: center; padding: 100px; color: #64748b; font-size: 16px; }
    .Math { display: none; }

    /* ── Header ── */
    .dash-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 28px; flex-wrap: wrap; gap: 16px;
    }
    .dash-title { font-size: 22px; font-weight: 700; margin: 0; color: #e2e8f0; }
    .dash-sub { font-size: 13px; color: #64748b; margin: 4px 0 0; }
    .header-right { display: flex; align-items: center; gap: 8px; }
    .filter-label { font-size: 12px; color: #64748b; }
    .filter-select {
      background: #141820; border: 1px solid #2d3548; color: #e2e8f0;
      padding: 6px 10px; border-radius: 8px; font-size: 13px; font-family: inherit;
      cursor: pointer;
    }
    .filter-select:focus { outline: none; border-color: #6366f1; }
    .role-select { min-width: 160px; }
    .manage-btn {
      padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600;
      color: #a5b4fc; background: rgba(99,102,241,.12); border: 1px solid rgba(99,102,241,.25);
      text-decoration: none; transition: all .15s; white-space: nowrap;
    }
    .manage-btn:hover { background: rgba(99,102,241,.2); border-color: rgba(99,102,241,.4); }
    .header-sep { width: 1px; height: 24px; background: #2d3548; flex-shrink: 0; }
    .export-group { display: flex; gap: 4px; }
    .icon-btn {
      padding: 5px 10px; border-radius: 7px; font-size: 11px; font-weight: 600;
      cursor: pointer; font-family: inherit; transition: all .15s; border: 1px solid #2d3548;
      background: transparent; color: #64748b;
    }
    .icon-btn:hover { border-color: #4a5568; color: #e2e8f0; }
    .export-btn:hover { border-color: rgba(52,211,153,.3); color: #34d399; }
    .logout-btn { color: #64748b; }
    .logout-btn:hover { border-color: rgba(248,113,113,.3); color: #f87171; }

    /* ── Stat Cards ── */
    .stats-row {
      display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px; margin-bottom: 24px;
    }
    .stat-card {
      background: #141820; border: 1px solid #1e2433; border-radius: 12px;
      padding: 18px 20px; border-top: 3px solid #1e2433;
    }
    .stat-card.wide { }
    .sc-blue { border-top-color: #3b82f6; }
    .sc-green { border-top-color: #22c55e; }
    .sc-yellow { border-top-color: #eab308; }
    .sc-red { border-top-color: #ef4444; }
    .sc-purple { border-top-color: #8b5cf6; }
    .sc-label { display: block; font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: .8px; margin-bottom: 8px; }
    .sc-value { display: block; font-size: 28px; font-weight: 700; line-height: 1; margin-bottom: 6px; }
    .sc-value.lg { font-size: 36px; }
    .sc-value.blue { color: #3b82f6; }
    .sc-value.green { color: #22c55e; }
    .sc-value.yellow { color: #eab308; }
    .sc-value.red { color: #ef4444; }
    .sc-value.purple { color: #a78bfa; }
    .sc-sub { font-size: 11px; color: #4a5568; }

    /* ── Chart Cards ── */
    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .chart-card {
      background: #141820; border: 1px solid #1e2433; border-radius: 14px; padding: 24px;
    }
    .chart-card.full-width { margin-bottom: 20px; }
    .chart-title { font-size: 12px; font-weight: 600; color: #94a3b8; letter-spacing: .5px; margin: 0 0 16px; }
    .chart-legend { display: flex; gap: 16px; margin-bottom: 12px; justify-content: center; }
    .legend-item { font-size: 11px; color: #94a3b8; display: flex; align-items: center; gap: 6px; }
    .legend-box { width: 20px; height: 10px; border-radius: 2px; display: inline-block; }

    /* ── Bar Chart (H1 vs H2) ── */
    .bar-chart { display: flex; height: 220px; }
    .bar-y-axis {
      display: flex; flex-direction: column; justify-content: space-between;
      font-size: 10px; color: #4a5568; padding-right: 8px; width: 36px; text-align: right;
    }
    .bar-area {
      flex: 1; display: flex; align-items: flex-end; gap: 4px;
      border-left: 1px solid #1e2433; border-bottom: 1px solid #1e2433; padding: 0 4px;
    }
    .bar-group { flex: 1; display: flex; flex-direction: column; align-items: center; min-width: 0; }
    .bar-pair { display: flex; gap: 2px; align-items: flex-end; height: 180px; width: 100%; justify-content: center; }
    .bar { width: 40%; max-width: 24px; border-radius: 3px 3px 0 0; min-height: 2px; transition: height .3s; }
    .h1-bar { background: #c0392b; }
    .h2-bar { background: #7d8c3b; }
    .bar-x-label {
      font-size: 9px; color: #64748b; margin-top: 4px; writing-mode: vertical-rl;
      text-orientation: mixed; transform: rotate(180deg); max-height: 60px;
      overflow: hidden; text-overflow: ellipsis;
    }

    /* ── Donut Chart ── */
    .donut-wrap { display: flex; align-items: center; gap: 32px; justify-content: center; padding: 16px 0; }
    .donut {
      width: 180px; height: 180px; border-radius: 50%; position: relative; flex-shrink: 0;
    }
    .donut-hole {
      position: absolute; top: 35px; left: 35px; width: 110px; height: 110px;
      border-radius: 50%; background: #141820;
    }
    .donut-legend { display: flex; flex-direction: column; gap: 10px; }
    .dl-item { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #94a3b8; }
    .dl-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

    /* ── Horizontal Bar Chart (Regions) ── */
    .h-bar-chart { display: flex; flex-direction: column; gap: 16px; padding: 8px 0; }
    .h-bar-row { display: flex; align-items: center; gap: 12px; }
    .h-bar-label { font-size: 12px; color: #94a3b8; width: 110px; text-align: right; flex-shrink: 0; }
    .h-bar-track { flex: 1; height: 28px; background: #0c0f17; border-radius: 4px; overflow: hidden; }
    .h-bar-fill { height: 100%; border-radius: 4px; transition: width .3s; }
    .h-bar-val { font-size: 12px; color: #64748b; width: 20px; }

    /* ── Stacked Bar Chart (Workload) ── */
    .stacked-chart { display: flex; height: 260px; }
    .stacked-y-axis {
      display: flex; flex-direction: column; justify-content: space-between;
      font-size: 9px; color: #4a5568; padding-right: 8px; width: 32px; text-align: right;
    }
    .stacked-area {
      flex: 1; display: flex; gap: 6px; align-items: flex-end;
      border-left: 1px solid #1e2433; border-bottom: 1px solid #1e2433; padding: 0 4px;
    }
    .stacked-col { flex: 1; display: flex; flex-direction: column; align-items: center; min-width: 0; }
    .stacked-bar {
      width: 80%; max-width: 48px; height: 210px;
      display: flex; flex-direction: column-reverse; gap: 1px; justify-content: flex-start;
    }
    .stacked-seg { border-radius: 2px; min-height: 2px; }
    .stacked-label { font-size: 9px; color: #64748b; margin-top: 4px; text-align: center; max-width: 60px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    /* ── Heatmap ── */
    .heatmap-wrap { overflow-x: auto; }
    .heatmap { width: 100%; border-collapse: separate; border-spacing: 3px; }
    .heatmap th { font-size: 11px; color: #64748b; font-weight: 500; padding: 6px; text-align: center; }
    .hm-res { text-align: left !important; min-width: 160px; }
    .hm-month { min-width: 54px; }
    .hm-name { font-size: 13px; font-weight: 600; color: #e2e8f0; }
    .hm-role { font-size: 11px; color: #64748b; }
    .hm-cell {
      text-align: center; font-size: 11px; font-weight: 600; border-radius: 6px;
      padding: 8px 4px; font-family: 'JetBrains Mono', monospace;
    }

    /* ── Section Title ── */
    .section-title { font-size: 13px; font-weight: 600; color: #f97316; letter-spacing: 1px; margin: 0 0 20px; }

    /* ── Resource Cards ── */
    .resource-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .res-card {
      background: #141820; border: 1px solid #1e2433; border-radius: 12px; padding: 20px;
    }
    .res-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
    .res-card-name { font-size: 15px; font-weight: 600; color: #e2e8f0; }
    .res-card-role { font-size: 12px; color: #64748b; }
    .res-card-pct { font-size: 28px; font-weight: 700; }
    .res-card-bar { height: 4px; background: #1e2433; border-radius: 2px; margin-bottom: 10px; overflow: hidden; }
    .res-card-fill { height: 100%; border-radius: 2px; transition: width .3s; }
    .res-card-stats { font-size: 11px; color: #64748b; margin-bottom: 12px; }
    .res-card-stats b { font-weight: 600; }
    .res-card-tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .tag-pill {
      font-size: 10px; color: #94a3b8; padding: 3px 8px; border-radius: 6px;
      border: 1px solid; display: flex; align-items: center; gap: 4px;
      background: rgba(255,255,255,.03);
    }
    .tag-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

    /* ── Projects Table ── */
    .proj-table { width: 100%; border-collapse: collapse; }
    .proj-table th {
      font-size: 11px; color: #64748b; font-weight: 600; text-align: left;
      padding: 12px 16px; border-bottom: 1px solid #1e2433; text-transform: uppercase;
      letter-spacing: .5px;
    }
    .sortable { cursor: pointer; }
    .sortable:hover { color: #a5b4fc; }
    .sort-arrow { font-size: 10px; }
    .proj-table td { padding: 14px 16px; border-bottom: 1px solid #0c0f17; font-size: 13px; }
    .proj-name { font-weight: 500; color: #e2e8f0; }
    .proj-client { color: #64748b; }
    .proj-period { color: #94a3b8; }
    .proj-count { text-align: center; }
    .proj-team { display: flex; flex-wrap: wrap; gap: 4px; }
    .team-tag {
      font-size: 10px; padding: 3px 8px; border-radius: 6px; white-space: nowrap; font-weight: 500;
    }
    .team-tag.sm { font-size: 10px; padding: 2px 6px; }
    .status-badge {
      padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;
    }
    .status-badge.active { background: rgba(34,197,94,.12); color: #22c55e; }

    /* ── Bids Grid ── */
    .bids-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
    .bid-card {
      background: #141820; border: 1px solid #1e2433; border-radius: 12px; padding: 18px;
    }
    .bid-card-name { font-size: 14px; font-weight: 600; color: #e2e8f0; margin-bottom: 8px; }
    .bid-card-meta { font-size: 11px; color: #64748b; margin-bottom: 10px; }
    .bid-client { color: #94a3b8; }
    .bid-period { color: #94a3b8; }
    .bid-status { color: #d946ef; font-weight: 600; }
    .bid-card-tags { display: flex; flex-wrap: wrap; gap: 4px; }

    /* ── Footer ── */
    .dash-footer {
      text-align: center; padding: 32px 0 16px; font-size: 12px; color: #4a5568;
    }

    /* ── Responsive ── */
    @media (max-width: 1100px) {
      .stats-row { grid-template-columns: repeat(3, 1fr); }
    }
    @media (max-width: 900px) {
      .charts-row { grid-template-columns: 1fr; }
      .stats-row { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 640px) {
      .dash-header { flex-direction: column; }
      .header-right { flex-wrap: wrap; }
      .stats-row { grid-template-columns: 1fr 1fr; }
      .resource-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  Math = Math;
  months = MONTHS;
  loading = true;

  resources: Resource[] = [];
  projects: Project[] = [];
  bids: Bid[] = [];

  currentView = 'overview';
  selectedYear = new Date().getFullYear();
  availableYears: number[] = [];
  selectedRole = '';
  selectedType = '';
  roles: string[] = [];

  filteredCards: ResourceCard[] = [];
  filteredProjects: Project[] = [];
  filteredBids: Bid[] = [];
  sortedProjects: Project[] = [];

  avgH1 = 0;
  avgH2 = 0;
  overAllocatedCount = 0;
  donutGradient = '';
  regionData: { region: string; count: number }[] = [];
  maxRegionCount = 1;

  private projectSortField = '';
  private projectSortAsc = true;

  constructor(
    private resourceService: ResourceService,
    private projectService: ProjectService,
    private bidService: BidService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    forkJoin({
      resources: this.resourceService.getAll(),
      projects: this.projectService.getAll(),
      bids: this.bidService.getAll()
    }).subscribe({
      next: ({ resources, projects, bids }) => {
        this.resources = resources.filter(r => !r.isArchived);
        this.projects = projects.filter(p => !p.isArchived && p.status === 'active');
        this.bids = bids.filter(b => !b.isArchived && (b.status === 'pending' || b.status === 'submitted'));
        this.roles = [...new Set(this.resources.map(r => r.role))].sort();

        // Compute available years from all assignments, projects, bids
        const years = new Set<number>();
        for (const r of this.resources) {
          for (const a of (r.assignments || [])) {
            if (a.startYear) years.add(a.startYear);
            if (a.endYear) years.add(a.endYear);
          }
        }
        for (const p of this.projects) { if (p.startYear) years.add(p.startYear); if (p.endYear) years.add(p.endYear); }
        for (const b of this.bids) { if (b.startYear) years.add(b.startYear); if (b.endYear) years.add(b.endYear); }
        if (!years.size) years.add(new Date().getFullYear());
        this.availableYears = [...years].sort();
        if (this.availableYears.length && !this.availableYears.includes(this.selectedYear)) {
          this.selectedYear = this.availableYears[0];
        }

        this.onFilterChange();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onFilterChange() {
    let filtered = this.resources;
    if (this.selectedRole) filtered = filtered.filter(r => r.role === this.selectedRole);
    if (this.selectedType) filtered = filtered.filter(r => r.availability === this.selectedType);

    this.filteredCards = filtered.map(r => this.buildCard(r)).sort((a, b) => a.resource.name.localeCompare(b.resource.name));

    const resourceIds = new Set(filtered.map(r => r.id));
    const hasFilter = this.selectedRole || this.selectedType;
    const y = this.selectedYear;
    this.filteredProjects = this.projects.filter(p =>
      this.overlapsYear(p.startMonth, p.startYear, p.endMonth, p.endYear, y) &&
      (!hasFilter || p.assignments?.some(a => resourceIds.has(a.resourceId)))
    );
    this.filteredBids = this.bids.filter(b =>
      this.overlapsYear(b.startMonth, b.startYear, b.endMonth, b.endYear, y) &&
      (!hasFilter || b.assignments?.some(a => resourceIds.has(a.resourceId)))
    );
    this.sortedProjects = [...this.filteredProjects];

    this.computeStats();
    this.computeDonut();
    this.computeRegions();
  }

  private buildCard(r: Resource): ResourceCard {
    const projAssignments = (r.assignments || []).filter(a => a.type === 'project');
    const bidAssignments = (r.assignments || []).filter(a => a.type === 'bid');
    const h1Avg = this.getHalfAvg(r, 0, 5);
    const h2Avg = this.getHalfAvg(r, 6, 11);
    return {
      resource: r,
      h1Avg, h2Avg,
      overallAvg: (h1Avg + h2Avg) / 2,
      projectCount: projAssignments.length,
      bidCount: bidAssignments.length,
      projectAssignments: projAssignments,
      bidAssignments: bidAssignments
    };
  }

  private getHalfAvg(r: Resource, startM: number, endM: number): number {
    let total = 0;
    const count = endM - startM + 1;
    for (let m = startM; m <= endM; m++) {
      total += this.getMonthAlloc(r, m);
    }
    return Math.round(total / count);
  }

  getMonthAlloc(r: Resource, month: number): number {
    const y = this.selectedYear;
    const target = y * 12 + month;
    return (r.assignments || [])
      .filter(a => {
        const aStart = (a.startYear || y) * 12 + a.startMonth;
        const aEnd = (a.endYear || y) * 12 + a.endMonth;
        return target >= aStart && target <= aEnd;
      })
      .reduce((sum, a) => sum + a.allocation, 0);
  }

  private overlapsYear(startMonth: number, startYear: number, endMonth: number, endYear: number, year: number): boolean {
    const aStart = (startYear || year) * 12 + startMonth;
    const aEnd = (endYear || year) * 12 + endMonth;
    const yearStart = year * 12;
    const yearEnd = year * 12 + 11;
    return aStart <= yearEnd && aEnd >= yearStart;
  }

  private computeStats() {
    if (!this.filteredCards.length) {
      this.avgH1 = 0; this.avgH2 = 0; this.overAllocatedCount = 0;
      return;
    }
    this.avgH1 = Math.round(this.filteredCards.reduce((s, c) => s + c.h1Avg, 0) / this.filteredCards.length);
    this.avgH2 = Math.round(this.filteredCards.reduce((s, c) => s + c.h2Avg, 0) / this.filteredCards.length);
    this.overAllocatedCount = this.filteredCards.filter(c => c.h1Avg > 100).length;
  }

  private computeDonut() {
    const cards = this.filteredCards;
    if (!cards.length) { this.donutGradient = '#1e2433'; return; }
    const over = cards.filter(c => c.h1Avg > 100).length;
    const full = cards.filter(c => c.h1Avg >= 90 && c.h1Avg <= 100).length;
    const well = cards.filter(c => c.h1Avg >= 70 && c.h1Avg < 90).length;
    const under = cards.filter(c => c.h1Avg < 70).length;
    const total = cards.length;
    const pOver = over / total * 360;
    const pFull = full / total * 360;
    const pWell = well / total * 360;
    const pUnder = under / total * 360;
    this.donutGradient = `conic-gradient(
      #e74c3c 0deg ${pOver}deg,
      #e67e22 ${pOver}deg ${pOver + pFull}deg,
      #c5a028 ${pOver + pFull}deg ${pOver + pFull + pWell}deg,
      #27ae60 ${pOver + pFull + pWell}deg ${pOver + pFull + pWell + pUnder}deg
    )`;
  }

  private computeRegions() {
    const regionCounts: Record<string, number> = {};
    for (const p of this.filteredProjects) {
      const region = this.getRegion(p.name);
      regionCounts[region] = (regionCounts[region] || 0) + 1;
    }
    this.regionData = Object.entries(regionCounts)
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count);
    this.maxRegionCount = Math.max(1, ...this.regionData.map(r => r.count));
  }

  private getRegion(projectName: string): string {
    const lower = projectName.toLowerCase();
    for (const [key, region] of Object.entries(REGION_MAP)) {
      if (lower.includes(key)) return region;
    }
    return 'Other';
  }

  getWorkloadSegments(card: ResourceCard): { name: string; allocation: number; color: string }[] {
    return card.projectAssignments
      .filter(a => a.startMonth <= 5) // H1 projects
      .map(a => ({
        name: a.name,
        allocation: a.allocation,
        color: this.getTagColor(a.name)
      }));
  }

  getFirstName(fullName: string): string {
    return fullName.split(' ')[0];
  }

  getUtilColor(util: number): string {
    if (util > 100) return '#ef4444';
    if (util >= 90) return '#f97316';
    if (util >= 70) return '#eab308';
    return '#22c55e';
  }

  getHeatColor(util: number): { bg: string; text: string } {
    if (util === 0) return { bg: '#1a1f2e', text: '#4a5568' };
    if (util > 100) return { bg: '#3b1111', text: '#f87171' };
    if (util >= 90) return { bg: '#3b2511', text: '#fb923c' };
    if (util >= 70) return { bg: '#332b0a', text: '#fbbf24' };
    return { bg: '#0d2818', text: '#34d399' };
  }

  getTagColor(name: string): string {
    let hash = 0;
    for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
    return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
  }

  truncate(s: string, max: number): string {
    return s.length > max ? s.substring(0, max) + '...' : s;
  }

  sortProjects(field: string) {
    if (this.projectSortField === field) {
      this.projectSortAsc = !this.projectSortAsc;
    } else {
      this.projectSortField = field;
      this.projectSortAsc = true;
    }
    const dir = this.projectSortAsc ? 1 : -1;
    this.sortedProjects.sort((a, b) => {
      if (field === 'name') return a.name.localeCompare(b.name) * dir;
      if (field === 'client') return (a.client || '').localeCompare(b.client || '') * dir;
      if (field === 'resources') return ((a.assignments?.length || 0) - (b.assignments?.length || 0)) * dir;
      return 0;
    });
  }

  logout() {
    this.authService.logout();
  }

  // ── Export: CSV ──
  exportCSV() {
    const lines: string[] = [];
    lines.push('"Portfolio Resource Dashboard — Export"');
    lines.push('');
    lines.push('"Metric","Value"');
    lines.push(`"Team Size","${this.filteredCards.length}"`);
    lines.push(`"Active Projects","${this.filteredProjects.length}"`);
    lines.push(`"Bids in Pipeline","${this.filteredBids.length}"`);
    lines.push(`"Avg Utilization H1","${this.avgH1}%"`);
    lines.push(`"Avg Utilization H2","${this.avgH2}%"`);
    lines.push('');

    lines.push('"Resource","Role","H1 Avg","H2 Avg","Projects","Bids"');
    for (const c of this.filteredCards) {
      lines.push(`"${c.resource.name}","${c.resource.role}","${c.h1Avg}%","${c.h2Avg}%","${c.projectCount}","${c.bidCount}"`);
    }
    lines.push('');

    lines.push('"Utilization Heatmap"');
    lines.push('"Resource","Role",' + MONTHS.map(m => `"${m}"`).join(','));
    for (const c of this.filteredCards) {
      const vals = Array.from({length: 12}, (_, i) => `"${this.getMonthAlloc(c.resource, i)}%"`).join(',');
      lines.push(`"${c.resource.name}","${c.resource.role}",${vals}`);
    }
    lines.push('');

    lines.push('"Projects"');
    lines.push('"Name","Client","Period","# Resources","Status"');
    for (const p of this.filteredProjects) {
      lines.push(`"${p.name}","${p.client || ''}","${MONTHS[p.startMonth]}-${MONTHS[p.endMonth]}","${p.assignments?.length || 0}","${p.status}"`);
    }
    lines.push('');

    lines.push('"Bids"');
    lines.push('"Name","Client","Period","Status"');
    for (const b of this.filteredBids) {
      lines.push(`"${b.name}","${b.client || ''}","${MONTHS[b.startMonth]}-${MONTHS[b.endMonth]}","${b.status}"`);
    }

    this.download('portfolio-dashboard.csv', lines.join('\n'), 'text/csv');
  }

  // ── Export: Excel (SpreadsheetML XML) ──
  exportExcel() {
    let sheets = '';

    sheets += `<Worksheet ss:Name="Summary"><Table>`;
    sheets += this.xlRow(['Metric', 'Value'], true);
    sheets += this.xlRow(['Team Size', this.filteredCards.length]);
    sheets += this.xlRow(['Active Projects', this.filteredProjects.length]);
    sheets += this.xlRow(['Bids in Pipeline', this.filteredBids.length]);
    sheets += this.xlRow(['Avg Utilization H1', this.avgH1 + '%']);
    sheets += this.xlRow(['Avg Utilization H2', this.avgH2 + '%']);
    sheets += `</Table></Worksheet>`;

    sheets += `<Worksheet ss:Name="Resources"><Table>`;
    sheets += this.xlRow(['Resource', 'Role', 'H1 Avg', 'H2 Avg', 'Projects', 'Bids'], true);
    for (const c of this.filteredCards) {
      sheets += this.xlRow([c.resource.name, c.resource.role, c.h1Avg + '%', c.h2Avg + '%', c.projectCount, c.bidCount]);
    }
    sheets += `</Table></Worksheet>`;

    sheets += `<Worksheet ss:Name="Utilization"><Table>`;
    sheets += this.xlRow(['Resource', 'Role', ...MONTHS], true);
    for (const c of this.filteredCards) {
      const vals = Array.from({length: 12}, (_, i) => this.getMonthAlloc(c.resource, i) + '%');
      sheets += this.xlRow([c.resource.name, c.resource.role, ...vals]);
    }
    sheets += `</Table></Worksheet>`;

    sheets += `<Worksheet ss:Name="Projects"><Table>`;
    sheets += this.xlRow(['Name', 'Client', 'Period', '# Resources', 'Status'], true);
    for (const p of this.filteredProjects) {
      sheets += this.xlRow([p.name, p.client || '', MONTHS[p.startMonth] + '-' + MONTHS[p.endMonth], p.assignments?.length || 0, p.status]);
    }
    sheets += `</Table></Worksheet>`;

    sheets += `<Worksheet ss:Name="Bids"><Table>`;
    sheets += this.xlRow(['Name', 'Client', 'Period', 'Status'], true);
    for (const b of this.filteredBids) {
      sheets += this.xlRow([b.name, b.client || '', MONTHS[b.startMonth] + '-' + MONTHS[b.endMonth], b.status]);
    }
    sheets += `</Table></Worksheet>`;

    const xml = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>` +
      `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">` +
      `<Styles><Style ss:ID="hdr"><Font ss:Bold="1"/><Interior ss:Color="#E2E8F0" ss:Pattern="Solid"/></Style></Styles>` +
      sheets + `</Workbook>`;

    this.download('portfolio-dashboard.xls', xml, 'application/vnd.ms-excel');
  }

  // ── Export: PDF (printable HTML) ──
  exportPDF() {
    const y = this.selectedYear;
    const pdfHeatColor = (v: number) => {
      if (v === 0) return { bg: '#1e293b', color: '#64748b' };
      if (v > 100) return { bg: '#7f1d1d', color: '#fca5a5' };
      if (v >= 90) return { bg: '#7c2d12', color: '#fdba74' };
      if (v >= 70) return { bg: '#713f12', color: '#fde047' };
      return { bg: '#14532d', color: '#86efac' };
    };

    const heatRows = this.filteredCards.map(c => {
      const cells = Array.from({length: 12}, (_, i) => {
        const v = this.getMonthAlloc(c.resource, i);
        const col = pdfHeatColor(v);
        return `<td class="hm" style="background:${col.bg};color:${col.color}">${v}%</td>`;
      }).join('');
      const h1 = Math.round(Array.from({length:6},(_,i)=>this.getMonthAlloc(c.resource,i)).reduce((a,b)=>a+b,0)/6);
      const h2 = Math.round(Array.from({length:6},(_,i)=>this.getMonthAlloc(c.resource,i+6)).reduce((a,b)=>a+b,0)/6);
      const h1c = pdfHeatColor(h1);
      const h2c = pdfHeatColor(h2);
      return `<tr><td class="res-cell"><div class="res-n">${c.resource.name}</div><div class="res-r">${c.resource.role}</div></td>${cells}<td class="hm" style="background:${h1c.bg};color:${h1c.color};font-weight:700">${h1}%</td><td class="hm" style="background:${h2c.bg};color:${h2c.color};font-weight:700">${h2}%</td></tr>`;
    }).join('');

    const projRows = this.filteredProjects.map(p => {
      const team = (p.assignments || []).map(a =>
        `<span class="tag" style="background:${this.getTagColor(a.resourceName || a.name)}22;color:${this.getTagColor(a.resourceName || a.name)}">${a.resourceName || a.name} ${a.allocation}%</span>`
      ).join(' ');
      return `<tr><td style="font-weight:600">${p.name}</td><td>${p.client || '—'}</td><td>${MONTHS[p.startMonth]} ${p.startYear}–${MONTHS[p.endMonth]} ${p.endYear}</td><td style="text-align:center">${p.assignments?.length || 0}</td><td>${team}</td><td><span class="badge-active">Active</span></td></tr>`;
    }).join('');

    const bidRows = this.filteredBids.map(b => {
      const team = (b.assignments || []).map(a =>
        `<span class="tag" style="background:${this.getTagColor(a.resourceName || a.name)}22;color:${this.getTagColor(a.resourceName || a.name)}">${a.resourceName || a.name} ${a.allocation}%</span>`
      ).join(' ');
      return `<tr><td style="font-weight:600">${b.name}</td><td>${b.client || '—'}</td><td>${MONTHS[b.startMonth]} ${b.startYear}–${MONTHS[b.endMonth]} ${b.endYear}</td><td>${team}</td><td><span class="badge-pending">Pending</span></td></tr>`;
    }).join('');

    const statCard = (label: string, value: string | number, color: string, borderColor: string) =>
      `<div class="stat" style="border-top:3px solid ${borderColor}"><div class="stat-label">${label}</div><div class="stat-val" style="color:${color}">${value}</div></div>`;

    const html = `<!DOCTYPE html><html><head><title>Portfolio Dashboard Report — ${y}</title>
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Segoe UI',Arial,sans-serif;padding:32px 40px;background:#0f172a;color:#e2e8f0;max-width:1300px;margin:0 auto}
        h1{font-size:24px;font-weight:700;color:#f1f5f9}
        .sub{color:#64748b;font-size:13px;margin:4px 0 28px}
        .stats{display:flex;gap:14px;margin-bottom:28px;flex-wrap:wrap}
        .stat{background:#1e293b;border-radius:10px;padding:14px 18px;min-width:130px;flex:1}
        .stat-label{font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.7px;margin-bottom:6px}
        .stat-val{font-size:26px;font-weight:700}
        h2{font-size:14px;font-weight:600;color:#94a3b8;letter-spacing:.5px;margin:28px 0 12px;text-transform:uppercase}
        table{width:100%;border-collapse:separate;border-spacing:0;font-size:11px;margin-bottom:20px;background:#1e293b;border-radius:10px;overflow:hidden}
        th{background:#334155;color:#94a3b8;font-weight:600;padding:10px 8px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.5px}
        td{padding:8px;border-bottom:1px solid #334155;color:#cbd5e1}
        tr:last-child td{border-bottom:none}
        .hm{text-align:center;font-size:11px;font-weight:600;font-family:'Consolas',monospace;padding:6px 4px;min-width:46px}
        .res-cell{min-width:150px}
        .res-n{font-weight:600;color:#f1f5f9;font-size:12px}
        .res-r{font-size:10px;color:#64748b}
        .tag{display:inline-block;padding:2px 7px;border-radius:5px;font-size:10px;font-weight:600;margin:1px 2px;white-space:nowrap}
        .badge-active{background:rgba(34,197,94,.15);color:#4ade80;padding:3px 10px;border-radius:6px;font-size:10px;font-weight:600}
        .badge-pending{background:rgba(168,85,247,.15);color:#c084fc;padding:3px 10px;border-radius:6px;font-size:10px;font-weight:600}
        @media print{
          body{padding:16px 20px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
          .stats{gap:8px} .stat{padding:10px 12px}
        }
      </style>
    </head><body>
      <h1>Portfolio Resource Dashboard</h1>
      <div class="sub">${y} · Project Management Team · Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}${this.selectedRole ? ' · Role: ' + this.selectedRole : ''}</div>
      <div class="stats">
        ${statCard('Team Size', this.filteredCards.length, '#3b82f6', '#3b82f6')}
        ${statCard('Active Projects', this.filteredProjects.length, '#22c55e', '#22c55e')}
        ${statCard('Bids in Pipeline', this.filteredBids.length, '#eab308', '#eab308')}
        ${statCard('Over-Allocated', this.overAllocatedCount, '#ef4444', '#ef4444')}
        ${statCard('H1 Avg Util', this.avgH1 + '%', '#a78bfa', '#8b5cf6')}
        ${statCard('H2 Avg Util', this.avgH2 + '%', '#a78bfa', '#8b5cf6')}
      </div>
      <h2>Resource Utilization Heatmap — ${y}</h2>
      <table>
        <thead><tr><th>Resource</th>${MONTHS.map(m => `<th style="text-align:center">${m}</th>`).join('')}<th style="text-align:center">H1</th><th style="text-align:center">H2</th></tr></thead>
        <tbody>${heatRows}</tbody>
      </table>
      <h2>Active Projects (${this.filteredProjects.length})</h2>
      <table>
        <thead><tr><th>Project</th><th>Client</th><th>Period</th><th style="text-align:center"># Res</th><th>Assigned Team</th><th>Status</th></tr></thead>
        <tbody>${projRows || '<tr><td colspan="6" style="text-align:center;color:#64748b">No projects</td></tr>'}</tbody>
      </table>
      <h2>Bids & Pipeline (${this.filteredBids.length})</h2>
      <table>
        <thead><tr><th>Bid</th><th>Client</th><th>Period</th><th>Assigned Team</th><th>Status</th></tr></thead>
        <tbody>${bidRows || '<tr><td colspan="5" style="text-align:center;color:#64748b">No bids</td></tr>'}</tbody>
      </table>
      <div style="text-align:center;margin-top:32px;color:#475569;font-size:11px">Portfolio Resource Dashboard · ${y} · Data extracted from resource management tool</div>
    </body></html>`;

    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 400); }
  }

  private xlRow(cells: any[], header = false): string {
    const style = header ? ' ss:StyleID="hdr"' : '';
    return '<Row>' + cells.map(c => {
      const v = String(c ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
      const isNum = typeof c === 'number';
      return `<Cell${style}><Data ss:Type="${isNum ? 'Number' : 'String'}">${v}</Data></Cell>`;
    }).join('') + '</Row>';
  }

  private download(filename: string, content: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }
}
