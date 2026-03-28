import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BidService } from '../../services/bid.service';
import { ProjectService } from '../../services/project.service';
import { Bid, BidRequest, MONTHS } from '../../models/models';

@Component({
  selector: 'app-bids',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">

      <div class="page-header">
        <h1>Bids &amp; Proposals</h1>
        <button class="btn-primary" (click)="showModal = true; resetForm()">+ Add Bid</button>
      </div>

      <div class="filter-row">
        <button *ngFor="let f of filters" class="filter-btn" [class.active]="activeFilter === f.value"
                (click)="activeFilter = f.value">{{ f.label }} ({{ getCount(f.value) }})</button>
      </div>

      <div class="card-grid" *ngIf="filteredBids.length">
        <div *ngFor="let b of filteredBids" class="bid-card" [class]="'st-' + b.status">

          <div class="card-top">
            <div class="card-info">
              <div class="card-name">{{ b.name }}</div>
              <div class="card-client" *ngIf="b.client">{{ b.client }}</div>
            </div>
            <div class="card-actions">
              <span class="badge" [ngClass]="'badge-' + b.status">{{ b.status }}</span>
              <button class="icon-btn" (click)="editBid(b)" title="Edit">✎</button>
              <button class="icon-btn red" (click)="deleteBid(b.id)" title="Delete">×</button>
            </div>
          </div>

          <div class="card-meta">
            <span>{{ formatValue(b.estimatedValue) }}</span>
            <span class="meta-dot">·</span>
            <span>{{ months[b.startMonth] }}–{{ months[b.endMonth] }}</span>
            <span class="meta-dot">·</span>
            <span>{{ b.assignments.length }} resources</span>
          </div>

          <div *ngIf="b.probability != null" class="prob-row">
            <div class="prob-track">
              <div class="prob-fill" [style.width.%]="b.probability" [style.background]="getProbColor(b.probability)"></div>
            </div>
            <span class="prob-label">{{ b.probability }}% win probability</span>
          </div>

          <div class="status-seg">
            <button *ngFor="let s of bidStatuses" class="seg-btn" [class.active]="b.status === s"
                    (click)="changeStatus(b, s)">{{ s }}</button>
          </div>

          <div *ngIf="b.winLossReason" class="reason-note">{{ b.winLossReason }}</div>

          <button *ngIf="b.status === 'won' && !b.convertedProjectId" class="btn-convert" (click)="convertToProject(b)">
            Convert to Project
          </button>
          <div *ngIf="b.convertedProjectId" class="converted-tag">✓ Converted to project</div>

          <div *ngIf="b.assignments.length" class="assigns">
            <div class="assigns-label">Assigned Resources</div>
            <div *ngFor="let a of b.assignments" class="assign-row">
              <span class="assign-name">{{ a.resourceName }}</span>
              <span class="assign-alloc">{{ a.allocation }}%</span>
            </div>
          </div>

        </div>
      </div>

      <div *ngIf="!filteredBids.length" class="empty-state">
        {{ activeFilter === 'all' ? 'No bids yet.' : 'No ' + activeFilter + ' bids.' }}
      </div>

      <!-- Add / Edit Modal -->
      <div *ngIf="showModal" class="modal-backdrop" (click)="showModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingId ? 'Edit Bid' : 'New Bid' }}</h2>
            <button class="btn-close" (click)="showModal = false">✕</button>
          </div>
          <div class="fg"><label>Name *</label><input [(ngModel)]="form.name" placeholder="Cloud Migration Proposal" /></div>
          <div class="fg"><label>Client</label><input [(ngModel)]="form.client" placeholder="Acme Corp" /></div>
          <div class="form-row">
            <div class="fg"><label>Estimated Value ($)</label><input [(ngModel)]="form.estimatedValue" type="number" /></div>
            <div class="fg"><label>Win Probability (%)</label><input [(ngModel)]="form.probability" type="number" min="0" max="100" /></div>
          </div>
          <div class="fg"><label>Description</label><textarea [(ngModel)]="form.description" rows="3"></textarea></div>
          <div class="form-row">
            <div class="fg"><label>Start</label><select [(ngModel)]="form.startMonth"><option *ngFor="let m of months; let i = index" [ngValue]="i">{{ m }}</option></select></div>
            <div class="fg"><label>End</label><select [(ngModel)]="form.endMonth"><option *ngFor="let m of months; let i = index" [ngValue]="i">{{ m }}</option></select></div>
          </div>
          <div class="fg"><label>Status</label><select [(ngModel)]="form.status"><option *ngFor="let s of bidStatuses" [value]="s">{{ s }}</option></select></div>
          <div *ngIf="form.status === 'won' || form.status === 'lost'" class="fg">
            <label>Win/Loss Reason</label>
            <textarea [(ngModel)]="form.winLossReason" rows="2" placeholder="Reason for outcome"></textarea>
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" (click)="showModal = false">Cancel</button>
            <button class="btn-primary" (click)="saveBid()" [disabled]="!form.name">{{ editingId ? 'Save Changes' : 'Create' }}</button>
          </div>
        </div>
      </div>

      <!-- Status reason modal -->
      <div *ngIf="showReasonModal" class="modal-backdrop" (click)="showReasonModal = false">
        <div class="modal small" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ pendingStatus === 'won' ? 'Mark as Won' : 'Mark as Lost' }}</h2>
          </div>
          <div class="fg"><label>Reason (optional)</label><textarea [(ngModel)]="statusReason" rows="3"></textarea></div>
          <div class="modal-actions">
            <button class="btn-secondary" (click)="showReasonModal = false">Cancel</button>
            <button class="btn-primary" (click)="confirmStatusChange()">Confirm</button>
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
      margin-bottom: 20px; gap: 16px;
    }
    .page-header h1 { font-size: 22px; font-weight: 700; margin: 0; }

    .filter-row { display: flex; gap: 6px; margin-bottom: 20px; flex-wrap: wrap; }
    .filter-btn {
      padding: 6px 14px; border-radius: 8px; border: 1px solid #2d3548;
      background: #141820; color: #64748b; font-size: 12px; cursor: pointer;
      font-family: inherit; transition: all .15s;
    }
    .filter-btn:hover { color: #94a3b8; border-color: #4a5568; }
    .filter-btn.active { background: rgba(99,102,241,.12); color: #a5b4fc; border-color: rgba(99,102,241,.3); }

    /* ── Card Grid ── */
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }

    .bid-card {
      background: #141820; border: 1px solid #1e2433;
      border-left: 3px solid #2d3548; border-radius: 14px;
      padding: 20px; transition: transform .15s, box-shadow .15s;
    }
    .bid-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.3); }
    .bid-card.st-pending   { border-left-color: #94a3b8; }
    .bid-card.st-submitted { border-left-color: #60a5fa; }
    .bid-card.st-won       { border-left-color: #34d399; }
    .bid-card.st-lost      { border-left-color: #f87171; opacity: .75; }

    .card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
    .card-info { min-width: 0; flex: 1; }
    .card-name { font-size: 15px; font-weight: 600; color: #e2e8f0; }
    .card-client { font-size: 12px; color: #64748b; margin-top: 2px; }
    .card-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }

    .badge { padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 600; white-space: nowrap; text-transform: capitalize; }
    .badge-pending   { background: rgba(148,163,184,.1); color: #94a3b8; border: 1px solid rgba(148,163,184,.2); }
    .badge-submitted { background: rgba(96,165,250,.1);  color: #60a5fa; border: 1px solid rgba(96,165,250,.25); }
    .badge-won       { background: rgba(52,211,153,.12); color: #34d399; border: 1px solid rgba(52,211,153,.25); }
    .badge-lost      { background: rgba(248,113,113,.1); color: #f87171; border: 1px solid rgba(248,113,113,.25); }

    .card-meta { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #64748b; margin-bottom: 12px; flex-wrap: wrap; }
    .meta-dot { opacity: .35; }

    /* ── Probability Bar ── */
    .prob-row { margin-bottom: 12px; }
    .prob-track { height: 5px; background: #1a1f2e; border-radius: 3px; overflow: hidden; margin-bottom: 5px; }
    .prob-fill { height: 100%; border-radius: 3px; transition: width .3s; }
    .prob-label { font-size: 11px; color: #64748b; }

    /* ── Status Segmented Control ── */
    .status-seg {
      display: flex; background: #0c0f17; border: 1px solid #1e2433;
      border-radius: 8px; padding: 3px; margin-bottom: 12px;
    }
    .seg-btn {
      flex: 1; padding: 5px 6px; border-radius: 6px; border: none;
      font-size: 11px; font-weight: 500; cursor: pointer;
      background: transparent; color: #4a5568; font-family: inherit;
      transition: all .15s; white-space: nowrap; text-transform: capitalize;
    }
    .seg-btn:hover { color: #94a3b8; }
    .seg-btn.active { background: #1e2433; color: #e2e8f0; }

    .reason-note {
      font-size: 11px; color: #94a3b8; font-style: italic;
      padding: 8px 12px; background: #0c0f17; border-radius: 6px;
      margin-bottom: 12px; border-left: 2px solid #2d3548;
    }

    .btn-convert {
      width: 100%; padding: 9px; border-radius: 8px;
      border: 1px dashed rgba(52,211,153,.3); background: rgba(52,211,153,.05);
      color: #34d399; font-size: 12px; font-weight: 500;
      cursor: pointer; font-family: inherit; margin-bottom: 12px;
      transition: background .15s;
    }
    .btn-convert:hover { background: rgba(52,211,153,.1); }
    .converted-tag { text-align: center; font-size: 12px; color: #34d399; margin-bottom: 12px; }

    /* ── Assignments ── */
    .assigns { border-top: 1px solid #1e2433; padding-top: 12px; }
    .assigns-label { font-size: 10px; font-weight: 600; color: #4a5568; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 8px; }
    .assign-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 5px 10px; background: #0c0f17; border-radius: 6px; margin-bottom: 3px;
    }
    .assign-name { font-size: 12px; color: #94a3b8; }
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
    .modal.small { max-width: 420px; }
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
export class BidsComponent implements OnInit {
  bids: Bid[] = [];
  months = MONTHS;
  bidStatuses: string[] = ['pending', 'submitted', 'won', 'lost'];
  activeFilter = 'all';
  showModal = false;
  showReasonModal = false;
  editingId: string | null = null;
  pendingBid: Bid | null = null;
  pendingStatus = '';
  statusReason = '';
  form: any = { name: '', status: 'pending', startMonth: 0, endMonth: 5, probability: 50 };

  // Confirm modal
  showConfirmModal = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmType: 'danger' | 'warning' = 'danger';
  confirmAction = 'Confirm';
  private confirmCallback: (() => void) | null = null;

  filters = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Submitted', value: 'submitted' },
    { label: 'Won', value: 'won' },
    { label: 'Lost', value: 'lost' },
  ];

  constructor(private bidService: BidService, private projectService: ProjectService) {}
  ngOnInit() { this.load(); }

  load() { this.bidService.getAll().subscribe({ next: d => this.bids = d, error: e => console.error(e) }); }

  get filteredBids(): Bid[] {
    return this.activeFilter === 'all' ? this.bids : this.bids.filter(b => b.status === this.activeFilter);
  }

  getCount(filter: string): number {
    return filter === 'all' ? this.bids.length : this.bids.filter(b => b.status === filter).length;
  }

  resetForm() {
    this.editingId = null;
    this.form = { name: '', status: 'pending', startMonth: 0, endMonth: 5, probability: 50, client: '', description: '', estimatedValue: null, winLossReason: '' };
  }

  editBid(b: Bid) {
    this.editingId = b.id;
    this.form = { name: b.name, status: b.status, startMonth: b.startMonth, endMonth: b.endMonth, probability: b.probability ?? 50, client: b.client || '', description: b.description || '', estimatedValue: b.estimatedValue, winLossReason: b.winLossReason || '' };
    this.showModal = true;
  }

  saveBid() {
    if (!this.form.name) return;
    const req: BidRequest = { name: this.form.name, status: this.form.status, startMonth: +this.form.startMonth, endMonth: +this.form.endMonth, probability: +this.form.probability, client: this.form.client, description: this.form.description, estimatedValue: this.form.estimatedValue, winLossReason: this.form.winLossReason };
    const obs = this.editingId ? this.bidService.update(this.editingId, req) : this.bidService.create(req);
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

  deleteBid(id: string) {
    this.openConfirm('Delete Bid', 'Are you sure you want to delete this bid? This cannot be undone.', 'danger', 'Yes, Delete', () => {
      this.bidService.delete(id).subscribe({ next: () => this.load() });
    });
  }

  changeStatus(b: Bid, status: string) {
    if (b.status === status) return;
    if (status === 'won' || status === 'lost') {
      this.pendingBid = b;
      this.pendingStatus = status;
      this.statusReason = '';
      this.showReasonModal = true;
    } else {
      this.bidService.updateStatus(b.id, status).subscribe({ next: () => this.load() });
    }
  }

  confirmStatusChange() {
    if (!this.pendingBid) return;
    this.bidService.updateStatus(this.pendingBid.id, this.pendingStatus, this.statusReason || undefined)
      .subscribe({ next: () => { this.showReasonModal = false; this.load(); } });
  }

  convertToProject(b: Bid) {
    this.openConfirm(
      'Convert to Project',
      `Convert <strong>${b.name}</strong> to a project? All assigned resources will be transferred.`,
      'warning', 'Yes, Convert', () => {
        this.projectService.convertFromBid(b.id).subscribe({ next: () => this.load() });
      }
    );
  }

  formatValue(val: any): string {
    if (!val) return '$0';
    const n = Number(val);
    if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1000) return '$' + (n / 1000).toFixed(0) + 'k';
    return '$' + n;
  }

  getProbColor(p: number): string {
    if (p >= 70) return '#34d399';
    if (p >= 40) return '#fbbf24';
    return '#f87171';
  }
}
