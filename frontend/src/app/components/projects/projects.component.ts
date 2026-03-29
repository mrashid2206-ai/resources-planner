import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { Project, ProjectRequest, MONTHS } from '../../models/models';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">

      <div class="page-header">
        <h1>Projects</h1>
        <div class="header-controls">
          <label class="filter-lbl">Year</label>
          <select class="filter-sel" [(ngModel)]="filterYear" (ngModelChange)="load()">
            <option value="">All Years</option>
            <option *ngFor="let y of yearOptions" [value]="y">{{ y }}</option>
          </select>
          <button class="btn-primary" (click)="showModal = true; resetForm()">+ Add Project</button>
        </div>
      </div>

      <div class="card-grid" *ngIf="filteredProjects.length">
        <div *ngFor="let p of filteredProjects" class="proj-card" [class]="'st-' + p.status">

          <div class="card-top">
            <div class="card-info">
              <div class="card-name">{{ p.name }}</div>
              <div class="card-client" *ngIf="p.client">{{ p.client }}</div>
              <div class="card-desc" *ngIf="p.description">{{ p.description }}</div>
            </div>
            <div class="card-actions">
              <span class="badge" [ngClass]="'badge-' + p.status">{{ formatStatus(p.status) }}</span>
              <button class="icon-btn" (click)="editProject(p)" title="Edit">✎</button>
              <button class="icon-btn red" (click)="deleteProject(p.id)" title="Delete">×</button>
            </div>
          </div>

          <div class="card-meta">
            <span>{{ months[p.startMonth] }} {{ p.startYear }}–{{ months[p.endMonth] }} {{ p.endYear }}</span>
            <span class="meta-dot">·</span>
            <span>{{ p.assignments.length }} resources</span>
          </div>

          <div class="status-seg">
            <button *ngFor="let s of projectStatuses" class="seg-btn" [class.active]="p.status === s"
                    (click)="changeStatus(p, s)">{{ formatStatus(s) }}</button>
          </div>

          <div *ngIf="p.assignments.length" class="assigns">
            <div class="assigns-label">Assigned Resources</div>
            <div *ngFor="let a of p.assignments" class="assign-row">
              <span class="assign-name">{{ a.resourceName }}</span>
              <span class="assign-info">
                <span class="assign-period">{{ months[a.startMonth] }}–{{ months[a.endMonth] }}</span>
                <span class="assign-alloc">{{ a.allocation }}%</span>
              </span>
            </div>
          </div>

        </div>
      </div>

      <div *ngIf="!filteredProjects.length" class="empty-state">
        No projects yet. Click <strong>+ Add Project</strong> to get started.
      </div>

      <!-- Add / Edit Modal -->
      <div *ngIf="showModal" class="modal-backdrop" (click)="showModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingId ? 'Edit Project' : 'New Project' }}</h2>
            <button class="btn-close" (click)="showModal = false">✕</button>
          </div>
          <div class="fg"><label>Name *</label><input [(ngModel)]="form.name" placeholder="Project Phoenix" /></div>
          <div class="fg"><label>Country</label><input [(ngModel)]="form.client" placeholder="Qatar, Saudi, Angola..." /></div>
          <div class="fg"><label>Description</label><textarea [(ngModel)]="form.description" rows="3"></textarea></div>
          <div class="form-row">
            <div class="fg"><label>Start Month</label><select [(ngModel)]="form.startMonth"><option *ngFor="let m of months; let i = index" [ngValue]="i">{{ m }}</option></select></div>
            <div class="fg"><label>Start Year</label><select [(ngModel)]="form.startYear"><option *ngFor="let y of yearOptions" [ngValue]="y">{{ y }}</option></select></div>
            <div class="fg"><label>End Month</label><select [(ngModel)]="form.endMonth"><option *ngFor="let m of months; let i = index" [ngValue]="i">{{ m }}</option></select></div>
            <div class="fg"><label>End Year</label><select [(ngModel)]="form.endYear"><option *ngFor="let y of yearOptions" [ngValue]="y">{{ y }}</option></select></div>
          </div>
          <div class="fg"><label>Status</label><select [(ngModel)]="form.status"><option *ngFor="let s of projectStatuses" [value]="s">{{ formatStatus(s) }}</option></select></div>
          <div class="modal-actions">
            <button class="btn-secondary" (click)="showModal = false">Cancel</button>
            <button class="btn-primary" (click)="saveProject()" [disabled]="!form.name">{{ editingId ? 'Save Changes' : 'Create' }}</button>
          </div>
        </div>
      </div>

      <!-- Confirm Modal -->
      <div *ngIf="showConfirmModal" class="modal-backdrop" (click)="showConfirmModal = false">
        <div class="confirm-modal" (click)="$event.stopPropagation()">
          <div class="confirm-icon" [class.warn]="confirmType === 'warning'">
            {{ confirmType === 'warning' ? '⚠' : '🗑' }}
          </div>
          <h3 class="confirm-title">{{ confirmTitle }}</h3>
          <div class="confirm-message" [innerHTML]="confirmMessage"></div>
          <div class="confirm-actions">
            <button class="btn-secondary" (click)="showConfirmModal = false">Cancel</button>
            <button class="confirm-btn" [class.warn]="confirmType === 'warning'" [class.danger]="confirmType === 'danger'"
                    (click)="onConfirmYes()">{{ confirmAction }}</button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }

    .page-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 28px; gap: 16px;
    }
    .page-header h1 { font-size: 22px; font-weight: 700; margin: 0; }
    .header-controls { display: flex; align-items: center; gap: 10px; }
    .filter-lbl { font-size: 12px; color: #64748b; }
    .filter-sel {
      background: #141820; border: 1px solid #2d3548; color: #e2e8f0;
      padding: 6px 10px; border-radius: 8px; font-size: 13px; font-family: inherit; cursor: pointer;
    }
    .filter-sel:focus { outline: none; border-color: #6366f1; }

    /* ── Card Grid ── */
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }

    .proj-card {
      background: #141820; border: 1px solid #1e2433;
      border-left: 3px solid #2d3548; border-radius: 14px;
      padding: 20px; transition: transform .15s, box-shadow .15s;
    }
    .proj-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.3); }
    .proj-card.st-active    { border-left-color: #34d399; }
    .proj-card.st-on_hold   { border-left-color: #fbbf24; }
    .proj-card.st-completed { border-left-color: #60a5fa; }

    .card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
    .card-info { min-width: 0; flex: 1; }
    .card-name { font-size: 15px; font-weight: 600; color: #e2e8f0; }
    .card-client { font-size: 12px; color: #64748b; margin-top: 2px; }
    .card-desc { font-size: 11px; color: #4a5568; line-height: 1.5; margin-top: 4px; }
    .card-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }

    .badge { padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 600; white-space: nowrap; }
    .badge-active    { background: rgba(52,211,153,.12);  color: #34d399; border: 1px solid rgba(52,211,153,.25); }
    .badge-on_hold   { background: rgba(251,191,36,.1);   color: #fbbf24; border: 1px solid rgba(251,191,36,.25); }
    .badge-completed { background: rgba(96,165,250,.1);   color: #60a5fa; border: 1px solid rgba(96,165,250,.25); }

    .card-meta {
      display: flex; align-items: center; gap: 8px;
      font-size: 12px; color: #64748b; margin-bottom: 14px; flex-wrap: wrap;
    }
    .meta-dot { opacity: .35; }

    /* ── Status Segmented Control ── */
    .status-seg {
      display: flex; background: #0c0f17; border: 1px solid #1e2433;
      border-radius: 8px; padding: 3px; margin-bottom: 14px;
    }
    .seg-btn {
      flex: 1; padding: 5px 6px; border-radius: 6px; border: none;
      font-size: 11px; font-weight: 500; cursor: pointer;
      background: transparent; color: #4a5568; font-family: inherit;
      transition: all .15s; white-space: nowrap;
    }
    .seg-btn:hover { color: #94a3b8; }
    .seg-btn.active { background: #1e2433; color: #e2e8f0; }

    /* ── Assignments ── */
    .assigns { border-top: 1px solid #1e2433; padding-top: 12px; }
    .assigns-label { font-size: 10px; font-weight: 600; color: #4a5568; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 8px; }
    .assign-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 5px 10px; background: #0c0f17; border-radius: 6px; margin-bottom: 3px;
    }
    .assign-name { font-size: 12px; color: #94a3b8; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .assign-info { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
    .assign-period { font-size: 10px; color: #4a5568; }
    .assign-alloc { font-size: 11px; font-weight: 700; color: #a5b4fc; font-family: 'JetBrains Mono', monospace; }

    .empty-state { background: #141820; border: 1px solid #1e2433; border-radius: 14px; padding: 64px 24px; text-align: center; color: #64748b; font-size: 14px; }

    /* ── Shared Buttons ── */
    .btn-primary {
      background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border: none;
      padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 500;
      cursor: pointer; font-family: inherit; white-space: nowrap;
    }
    .btn-primary:hover { opacity: .9; }
    .btn-primary:disabled { opacity: .5; cursor: not-allowed; }
    .btn-secondary { background: #1a1f2e; color: #94a3b8; border: 1px solid #2d3548; padding: 9px 16px; border-radius: 8px; font-size: 13px; cursor: pointer; font-family: inherit; }
    .icon-btn { background: none; border: none; color: #4a5568; cursor: pointer; font-size: 16px; padding: 3px 6px; border-radius: 4px; line-height: 1; transition: color .15s, background .15s; }
    .icon-btn:hover { color: #94a3b8; background: rgba(255,255,255,.04); }
    .icon-btn.red:hover { color: #f87171; background: rgba(248,113,113,.06); }

    /* ── Modal ── */
    .modal-backdrop { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,.75); backdrop-filter: blur(8px); }
    .modal { background: #141820; border: 1px solid #2d3548; border-radius: 16px; padding: 24px; width: 92%; max-width: 520px; max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 80px rgba(0,0,0,.6); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .modal-header h2 { margin: 0; font-size: 17px; font-weight: 600; }
    .btn-close { background: none; border: none; color: #64748b; font-size: 16px; cursor: pointer; padding: 4px; line-height: 1; }
    .btn-close:hover { color: #e2e8f0; }
    .modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px; }
    .fg { margin-bottom: 14px; }
    .fg label { display: block; margin-bottom: 6px; color: #94a3b8; font-size: 12px; font-weight: 500; }
    .fg input, .fg select, .fg textarea {
      width: 100%; padding: 10px 14px; background: #0c0f17;
      border: 1px solid #2d3548; border-radius: 8px; color: #e2e8f0;
      font-size: 14px; font-family: inherit; outline: none; box-sizing: border-box;
      transition: border-color .15s;
    }
    .fg input:focus, .fg select:focus, .fg textarea:focus { border-color: #6366f1; }
    .fg textarea { resize: vertical; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    /* ── Confirm Modal ── */
    .confirm-modal { background: #141820; border: 1px solid #2d3548; border-radius: 16px; padding: 32px 28px; width: 92%; max-width: 420px; text-align: center; animation: slideIn .2s ease-out; }
    @keyframes slideIn { from { opacity: 0; transform: scale(.93) translateY(8px); } to { opacity: 1; transform: none; } }
    .confirm-icon { font-size: 40px; margin-bottom: 12px; line-height: 1; }
    .confirm-icon.warn { filter: drop-shadow(0 0 10px rgba(251,191,36,.3)); }
    .confirm-title { font-size: 17px; font-weight: 700; color: #e2e8f0; margin: 0 0 10px; }
    .confirm-message { font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 22px; text-align: left; }
    .confirm-actions { display: flex; gap: 10px; justify-content: center; }
    .confirm-actions .btn-secondary { flex: 1; max-width: 130px; }
    .confirm-btn { flex: 1; max-width: 180px; border: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: opacity .15s; }
    .confirm-btn:hover { opacity: .85; }
    .confirm-btn.danger { background: linear-gradient(135deg, #f87171, #dc2626); color: #fff; }
    .confirm-btn.warn { background: linear-gradient(135deg, #fbbf24, #d97706); color: #1a1f2e; }

    /* ── Responsive ── */
    @media (max-width: 600px) {
      .card-grid { grid-template-columns: 1fr; }
      .page-header { flex-wrap: wrap; }
    }
  `]
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  months = MONTHS;
  yearOptions = Array.from({length: 10}, (_, i) => 2026 + i);
  filterYear = '';
  projectStatuses: string[] = ['active', 'on_hold', 'completed'];

  get filteredProjects(): Project[] {
    if (!this.filterYear) return this.projects;
    const y = +this.filterYear;
    return this.projects.filter(p => {
      const sy = p.startYear || y;
      const ey = p.endYear || y;
      return sy <= y && ey >= y;
    });
  }
  showModal = false;
  editingId: string | null = null;
  form: any = { name: '', status: 'active', startMonth: 0, endMonth: 5, startYear: new Date().getFullYear(), endYear: new Date().getFullYear() };

  // Confirm modal
  showConfirmModal = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmType: 'danger' | 'warning' = 'danger';
  confirmAction = 'Confirm';
  private confirmCallback: (() => void) | null = null;

  constructor(private projectService: ProjectService) {}
  ngOnInit() { this.load(); }

  load() {
    this.projectService.getAll().subscribe({ next: d => this.projects = d, error: e => console.error(e) });
  }

  resetForm() {
    this.editingId = null;
    this.form = { name: '', status: 'active', startMonth: 0, endMonth: 5, startYear: new Date().getFullYear(), endYear: new Date().getFullYear(), client: '', description: '' };
  }

  editProject(p: Project) {
    this.editingId = p.id;
    this.form = { name: p.name, status: p.status, startMonth: p.startMonth, endMonth: p.endMonth, startYear: p.startYear || new Date().getFullYear(), endYear: p.endYear || new Date().getFullYear(), client: p.client || '', description: p.description || '' };
    this.showModal = true;
  }

  saveProject() {
    if (!this.form.name) return;
    const req: ProjectRequest = { name: this.form.name, status: this.form.status, startMonth: +this.form.startMonth, endMonth: +this.form.endMonth, startYear: +this.form.startYear, endYear: +this.form.endYear, client: this.form.client, description: this.form.description };
    const obs = this.editingId ? this.projectService.update(this.editingId, req) : this.projectService.create(req);
    obs.subscribe({ next: () => { this.showModal = false; this.load(); } });
  }

  openConfirm(title: string, message: string, type: 'danger' | 'warning', action: string, callback: () => void) {
    this.confirmTitle = title;
    this.confirmMessage = message;
    this.confirmType = type;
    this.confirmAction = action;
    this.confirmCallback = callback;
    this.showConfirmModal = true;
  }

  onConfirmYes() {
    this.showConfirmModal = false;
    if (this.confirmCallback) this.confirmCallback();
  }

  deleteProject(id: string) {
    this.openConfirm('Delete Project', 'Are you sure you want to delete this project? This cannot be undone.', 'danger', 'Yes, Delete', () => {
      this.projectService.delete(id).subscribe({ next: () => this.load() });
    });
  }

  changeStatus(p: Project, status: string) {
    const req: ProjectRequest = { name: p.name, startMonth: p.startMonth, endMonth: p.endMonth, status: status as any, client: p.client, description: p.description, budget: p.budget };
    this.projectService.update(p.id, req).subscribe({ next: () => this.load() });
  }

  formatStatus(s: string): string { return s === 'on_hold' ? 'On Hold' : s.charAt(0).toUpperCase() + s.slice(1); }
  formatBudget(val: any): string {
    if (!val) return '$0';
    const n = Number(val);
    return n >= 1000 ? '$' + (n / 1000).toFixed(0) + 'k' : '$' + n;
  }
}
