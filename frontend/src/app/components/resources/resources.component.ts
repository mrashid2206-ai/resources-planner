import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Resource, ResourceRequest, Project, Bid, Leave, Assignment, AssignmentRequest, LeaveRequest, MONTHS, getUtilizationColor } from '../../models/models';
import { ResourceService } from '../../services/resource.service';
import { AssignmentService } from '../../services/assignment.service';
import { ProjectService } from '../../services/project.service';
import { BidService } from '../../services/bid.service';
import { LeaveService } from '../../services/leave.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="resources-page">

      <!-- ═══ LEFT PANEL: Resource List ═══ -->
      <div class="left-panel">
        <div class="left-header">
          <h1>Resources</h1>
          <button class="btn-primary" (click)="openAddResourceModal()">+ Add Resource</button>
        </div>

        <div class="resource-list">
          <div *ngFor="let r of resources" class="resource-card"
               [class.selected]="selectedResource?.id === r.id"
               (click)="selectResource(r)">
            <div class="rc-row1">
              <span class="rc-name">{{ r.name }}</span>
              <span class="rc-util" [style.color]="getAvgUtilColor(r)">{{ getAvgUtil(r) }}%</span>
              <button class="rc-del" (click)="archiveResource(r); $event.stopPropagation()" title="Archive">×</button>
            </div>
            <div class="rc-role">{{ r.role }}</div>
            <div class="rc-bars">
              <div *ngFor="let m of monthIndices" class="rc-dash"
                   [style.background]="getDashColor(r, m)"></div>
            </div>
          </div>
          <div *ngIf="!resources.length" class="empty-list">No resources yet. Click + Add Resource.</div>
        </div>
      </div>

      <!-- ═══ RIGHT PANEL: Detail View ═══ -->
      <div class="right-panel">

        <!-- Placeholder -->
        <div *ngIf="!selectedResource" class="placeholder">
          <span class="placeholder-text">Select a resource to view details</span>
        </div>

        <!-- Detail -->
        <div *ngIf="selectedResource" class="detail-view">

          <!-- Detail Header -->
          <div class="detail-header">
            <div class="detail-identity">
              <h2 class="detail-name">{{ selectedResource.name }}</h2>
              <div class="detail-role">{{ selectedResource.role }}</div>
            </div>
            <div class="detail-btns">
              <button class="btn-edit" (click)="openEditResourceModal()">✎ Edit</button>
              <button class="btn-assign" (click)="openAssignmentModal()">+ Assignment</button>
              <button class="btn-leave" (click)="openLeaveModal()">+ Leave</button>
            </div>
          </div>

          <!-- Year Selector + Monthly Capacity Grid -->
          <div class="grid-year-row">
            <span class="grid-year-label">Year</span>
            <select class="grid-year-select" [(ngModel)]="viewYear">
              <option *ngFor="let y of yearOptions" [ngValue]="y">{{ y }}</option>
            </select>
          </div>
          <div class="capacity-grid">
            <div *ngFor="let m of months; let i = index" class="month-card"
                 [style.background]="getUtilColor(selectedResource, i).bg"
                 [style.border-color]="getUtilColor(selectedResource, i).border"
                 [style.color]="getUtilColor(selectedResource, i).text">
              <div class="mc-month">{{ m }}</div>
              <div class="mc-util">{{ getUtil(selectedResource, i) }}%</div>
              <div class="mc-cap">{{ getCapacity(selectedResource, i) }}d</div>
              <div *ngIf="getLeaveForMonth(selectedResource, i) as lv" class="mc-leave">
                {{ lv.days }}d off
                <button class="mc-leave-del" (click)="deleteLeave(lv.id); $event.stopPropagation()">×</button>
              </div>
            </div>
          </div>

          <!-- Assignments Section -->
          <div class="section">
            <div class="section-title">Assignments</div>
            <div *ngFor="let a of selectedResource.assignments" class="assignment-card"
                 [style.border-left-color]="a.type === 'project' ? '#6366f1' : '#fbbf24'">
              <div class="ac-content">
                <div class="ac-name">{{ a.name }}</div>
                <div class="ac-meta">
                  {{ a.type === 'project' ? '🚀 Project' : '📋 Bid' }} · {{ months[a.startMonth] }} {{ a.startYear }}–{{ months[a.endMonth] }} {{ a.endYear }} · {{ a.allocation }}%
                </div>
              </div>
              <div class="ac-actions">
                <button class="btn-edit-sm" (click)="openEditAssignmentModal(a)" title="Edit">✎</button>
                <button class="btn-del" (click)="deleteAssignment(a.id)" title="Remove">×</button>
              </div>
            </div>
            <div *ngIf="!selectedResource.assignments.length" class="empty-section">No assignments yet</div>
          </div>

          <!-- Leaves Section -->
          <div class="section">
            <div class="section-title">Leaves</div>
            <div *ngFor="let l of selectedResource.leaves" class="leave-card">
              <div class="lc-info">
                <span class="lc-month">{{ months[l.month] }} {{ l.year }}</span>
                <span class="lc-days">{{ l.days }} days</span>
                <span class="lc-reason">{{ l.reason }}</span>
              </div>
              <div class="ac-actions">
                <button class="btn-edit-sm" (click)="openEditLeaveModal(l)" title="Edit">✎</button>
                <button class="btn-del" (click)="deleteLeave(l.id)" title="Remove">×</button>
              </div>
            </div>
            <div *ngIf="!selectedResource.leaves.length" class="empty-section">No leaves recorded</div>
          </div>

        </div>
      </div>

      <!-- ═══ MODALS ═══ -->

      <!-- Add / Edit Resource Modal -->
      <div *ngIf="showResourceModal" class="modal-backdrop" (click)="showResourceModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingResourceId ? 'Edit Resource' : 'Add Resource' }}</h2>
            <button class="btn-close" (click)="showResourceModal = false">✕</button>
          </div>
          <div class="fg">
            <label>Name *</label>
            <input [(ngModel)]="resourceForm.name" placeholder="Jane Smith" />
          </div>
          <div class="fg">
            <label>Role *</label>
            <input [(ngModel)]="resourceForm.role" placeholder="Senior Developer" />
          </div>
          <div class="fg">
            <label>Email</label>
            <input [(ngModel)]="resourceForm.email" placeholder="jane@company.com" />
          </div>
          <div class="fg">
            <label>Join Date</label>
            <input type="date" [(ngModel)]="resourceForm.joinDate" />
          </div>
          <div class="fg">
            <label>Monthly Capacity (days)</label>
            <input type="number" [(ngModel)]="resourceForm.monthlyCapacity" placeholder="22" min="1" max="31" />
          </div>
          <div class="fg">
            <label>Resource Type</label>
            <div class="type-toggle">
              <button [class.active]="resourceForm.availability === 'full_time'"
                      (click)="resourceForm.availability = 'full_time'; resourceForm.companyName = ''">SITA Full Time</button>
              <button [class.active]="resourceForm.availability === 'part_time'"
                      (click)="resourceForm.availability = 'part_time'">Contractor</button>
            </div>
          </div>
          <div class="fg" *ngIf="resourceForm.availability === 'part_time'">
            <label>Company Name *</label>
            <input [(ngModel)]="resourceForm.companyName" placeholder="Company name for contractor" />
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" (click)="showResourceModal = false">Cancel</button>
            <button class="btn-primary" (click)="saveResource()" [disabled]="!resourceForm.name || !resourceForm.role">
              {{ editingResourceId ? 'Save Changes' : 'Add' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Add / Edit Assignment Modal -->
      <div *ngIf="showAssignmentModal" class="modal-backdrop" (click)="showAssignmentModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingAssignmentId ? 'Edit Assignment' : 'Assign ' + selectedResource?.name }}</h2>
            <button class="btn-close" (click)="showAssignmentModal = false">✕</button>
          </div>
          <div *ngIf="assignError" class="form-error">{{ assignError }}</div>
          <div class="fg" *ngIf="!editingAssignmentId">
            <label>Type</label>
            <div class="type-toggle">
              <button [class.active]="assignForm.type === 'project'"
                      (click)="assignForm.type = 'project'; assignForm.projectId = ''; assignForm.bidId = ''">Project</button>
              <button [class.active]="assignForm.type === 'bid'"
                      (click)="assignForm.type = 'bid'; assignForm.projectId = ''; assignForm.bidId = ''">Bid</button>
            </div>
          </div>
          <div class="fg" *ngIf="assignForm.type === 'project' && !editingAssignmentId">
            <label>Project *</label>
            <select [(ngModel)]="assignForm.projectId">
              <option value="">— select project —</option>
              <option *ngFor="let p of projects" [value]="p.id">{{ p.name }}{{ p.client ? ' (' + p.client + ')' : '' }}</option>
            </select>
          </div>
          <div class="fg" *ngIf="assignForm.type === 'bid' && !editingAssignmentId">
            <label>Bid *</label>
            <select [(ngModel)]="assignForm.bidId">
              <option value="">— select bid —</option>
              <option *ngFor="let b of bids" [value]="b.id">{{ b.name }}{{ b.client ? ' (' + b.client + ')' : '' }}</option>
            </select>
          </div>
          <div *ngIf="editingAssignmentId" class="fg">
            <label>Target</label>
            <input [value]="assignForm.name" readonly class="readonly-input" />
          </div>
          <div class="form-row">
            <div class="fg">
              <label>Start Month</label>
              <select [(ngModel)]="assignForm.startMonth">
                <option *ngFor="let m of months; let i = index" [ngValue]="i">{{ m }}</option>
              </select>
            </div>
            <div class="fg">
              <label>Start Year</label>
              <select [(ngModel)]="assignForm.startYear">
                <option *ngFor="let y of yearOptions" [ngValue]="y">{{ y }}</option>
              </select>
            </div>
            <div class="fg">
              <label>End Month</label>
              <select [(ngModel)]="assignForm.endMonth">
                <option *ngFor="let m of months; let i = index" [ngValue]="i">{{ m }}</option>
              </select>
            </div>
            <div class="fg">
              <label>End Year</label>
              <select [(ngModel)]="assignForm.endYear">
                <option *ngFor="let y of yearOptions" [ngValue]="y">{{ y }}</option>
              </select>
            </div>
          </div>
          <div class="fg">
            <label>Allocation % (1–100)</label>
            <input type="number" [(ngModel)]="assignForm.allocation" min="1" max="100" placeholder="100" />
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" (click)="showAssignmentModal = false">Cancel</button>
            <button class="btn-primary" (click)="saveAssignment()" [disabled]="!canSaveAssignment()">
              {{ editingAssignmentId ? 'Save Changes' : 'Assign' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Add / Edit Leave Modal -->
      <div *ngIf="showLeaveModal" class="modal-backdrop" (click)="showLeaveModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingLeaveId ? 'Edit Leave' : 'Add Leave' }} — {{ selectedResource?.name }}</h2>
            <button class="btn-close" (click)="showLeaveModal = false">✕</button>
          </div>
          <div *ngIf="leaveError" class="form-error">{{ leaveError }}</div>
          <div class="form-row">
            <div class="fg">
              <label>Month</label>
              <select [(ngModel)]="leaveForm.month">
                <option *ngFor="let m of months; let i = index" [ngValue]="i">{{ m }}</option>
              </select>
            </div>
            <div class="fg">
              <label>Year</label>
              <select [(ngModel)]="leaveForm.year">
                <option *ngFor="let y of yearOptions" [ngValue]="y">{{ y }}</option>
              </select>
            </div>
          </div>
          <div class="fg">
            <label>Days off (1–22)</label>
            <input type="number" [(ngModel)]="leaveForm.days" min="1" max="22" placeholder="5" />
          </div>
          <div class="fg">
            <label>Reason</label>
            <input [(ngModel)]="leaveForm.reason" placeholder="Vacation, Sick leave, Public holiday…" />
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" (click)="showLeaveModal = false">Cancel</button>
            <button class="btn-primary" (click)="saveLeave()"
                    [disabled]="leaveForm.days < 1 || leaveForm.days > 22">
              {{ editingLeaveId ? 'Save Changes' : 'Save' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Confirm / Warning Modal -->
      <div *ngIf="showConfirmModal" class="modal-backdrop" (click)="showConfirmModal = false">
        <div class="confirm-modal" (click)="$event.stopPropagation()">
          <div class="confirm-icon" [class.warn]="confirmType === 'warning'">
            {{ confirmType === 'warning' ? '⚠' : '🗑' }}
          </div>
          <h3 class="confirm-title">{{ confirmTitle }}</h3>
          <div class="confirm-message" [innerHTML]="confirmMessage"></div>
          <div class="confirm-actions">
            <button class="btn-secondary" (click)="showConfirmModal = false">Cancel</button>
            <button class="confirm-btn"
                    [class.warn]="confirmType === 'warning'"
                    [class.danger]="confirmType === 'danger'"
                    (click)="onConfirmYes()">
              {{ confirmAction }}
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    /* ── Layout ── */
    .resources-page {
      display: grid;
      grid-template-columns: 380px 1fr;
      gap: 16px;
      min-height: calc(100vh - 56px - 56px);
      align-items: start;
    }

    /* ── Left Panel ── */
    .left-panel { display: flex; flex-direction: column; gap: 12px; }
    .left-header { display: flex; justify-content: space-between; align-items: center; }
    .left-header h1 { font-size: 22px; font-weight: 700; margin: 0; }

    .resource-list {
      display: flex; flex-direction: column; gap: 8px;
      max-height: calc(100vh - 160px); overflow-y: auto; padding-right: 4px;
    }
    .resource-list::-webkit-scrollbar { width: 4px; }
    .resource-list::-webkit-scrollbar-thumb { background: #2d3548; border-radius: 2px; }

    .resource-card {
      background: #141820; border: 1px solid #1e2433; border-radius: 12px;
      padding: 16px; cursor: pointer; transition: border-color 0.15s;
    }
    .resource-card:hover { border-color: #3d4760; }
    .resource-card.selected { border-color: #6366f1; background: #181d2c; }

    .rc-row1 { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .rc-name { font-size: 14px; font-weight: 600; color: #e2e8f0; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .rc-util { font-size: 13px; font-weight: 700; font-family: 'JetBrains Mono', monospace; flex-shrink: 0; }
    .rc-del {
      background: none; border: none; color: #4a5568; font-size: 16px; cursor: pointer;
      padding: 0 2px; line-height: 1; flex-shrink: 0; transition: color 0.15s;
    }
    .rc-del:hover { color: #f87171; }
    .rc-role { font-size: 12px; color: #64748b; margin-bottom: 8px; }
    .rc-bars { display: flex; gap: 2px; }
    .rc-dash { flex: 1; height: 4px; border-radius: 2px; min-width: 0; }
    .empty-list { text-align: center; padding: 32px 16px; color: #4a5568; font-size: 13px; }

    /* ── Right Panel ── */
    .right-panel { min-height: 400px; }
    .placeholder {
      background: #141820; border: 1px solid #1e2433; border-radius: 14px;
      display: flex; align-items: center; justify-content: center; min-height: 400px;
    }
    .placeholder-text { color: #4a5568; font-size: 15px; }
    .detail-view { display: flex; flex-direction: column; gap: 20px; }

    /* ── Detail Header ── */
    .detail-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
    .detail-name { font-size: 24px; font-weight: 700; margin: 0; }
    .detail-role { font-size: 16px; color: #94a3b8; margin-top: 2px; }
    .detail-btns { display: flex; gap: 8px; flex-shrink: 0; }

    .btn-edit {
      background: transparent; border: 1px solid #2d3548; color: #94a3b8;
      padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 500;
      cursor: pointer; font-family: inherit; transition: all 0.15s;
    }
    .btn-edit:hover { background: rgba(148,163,184,.08); color: #e2e8f0; border-color: #4a5568; }

    .btn-assign {
      background: transparent; border: 2px solid #6366f1; color: #a5b4fc;
      padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 500;
      cursor: pointer; font-family: inherit; transition: all 0.15s;
    }
    .btn-assign:hover { background: rgba(99,102,241,.1); }

    .btn-leave {
      background: transparent; border: 1px solid #2d3548; color: #94a3b8;
      padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 500;
      cursor: pointer; font-family: inherit; transition: all 0.15s;
    }
    .btn-leave:hover { background: rgba(148,163,184,.08); color: #e2e8f0; }

    /* ── Monthly Capacity Grid ── */
    .grid-year-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
    .grid-year-label { font-size: 12px; color: #64748b; }
    .grid-year-select {
      background: #0c0f17; border: 1px solid #2d3548; color: #e2e8f0;
      padding: 5px 10px; border-radius: 6px; font-size: 12px; font-family: inherit;
    }
    .grid-year-select:focus { outline: none; border-color: #6366f1; }
    .capacity-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 8px; }
    .month-card {
      border: 1px solid; border-radius: 10px; padding: 12px; text-align: center;
      display: flex; flex-direction: column; align-items: center; gap: 2px; min-height: 90px;
    }
    .mc-month { font-size: 12px; opacity: 0.8; }
    .mc-util { font-size: 28px; font-weight: 700; font-family: 'JetBrains Mono', monospace; line-height: 1.1; }
    .mc-cap { font-size: 12px; opacity: 0.7; }
    .mc-leave { font-size: 10px; color: #f87171; display: flex; align-items: center; gap: 4px; margin-top: 2px; }
    .mc-leave-del { background: none; border: none; color: #f87171; font-size: 12px; cursor: pointer; padding: 0; line-height: 1; opacity: 0.7; }
    .mc-leave-del:hover { opacity: 1; }

    /* ── Sections ── */
    .section-title {
      font-size: 16px; font-weight: 600; color: #94a3b8;
      padding-bottom: 10px; margin-bottom: 10px; border-bottom: 1px solid #1e2433;
    }

    .assignment-card {
      background: #0c0f17; border: 1px solid #1e2433; border-left: 4px solid;
      border-radius: 10px; padding: 14px 16px; margin-bottom: 8px;
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
    }
    .ac-content { min-width: 0; }
    .ac-name { font-size: 14px; font-weight: 600; color: #e2e8f0; margin-bottom: 2px; }
    .ac-meta { font-size: 12px; color: #64748b; }
    .ac-actions { display: flex; gap: 4px; align-items: center; flex-shrink: 0; }

    .leave-card {
      background: #0c0f17; border: 1px solid #1e2433; border-radius: 10px;
      padding: 14px 16px; margin-bottom: 8px;
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
    }
    .lc-info { display: flex; align-items: center; gap: 16px; font-size: 13px; }
    .lc-month { font-weight: 600; color: #e2e8f0; white-space: nowrap; }
    .lc-days { font-family: 'JetBrains Mono', monospace; color: #a5b4fc; white-space: nowrap; }
    .lc-reason { color: #64748b; }

    .btn-edit-sm {
      background: none; border: none; color: #4a5568; font-size: 14px; cursor: pointer;
      padding: 2px 4px; line-height: 1; transition: color 0.15s;
    }
    .btn-edit-sm:hover { color: #a5b4fc; }

    .btn-del {
      background: none; border: none; color: #4a5568; font-size: 18px; cursor: pointer;
      padding: 2px 4px; line-height: 1; flex-shrink: 0; transition: color 0.15s;
    }
    .btn-del:hover { color: #f87171; }
    .empty-section { text-align: center; padding: 20px; color: #4a5568; font-size: 13px; }

    /* ── Shared Buttons ── */
    .btn-primary {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white; border: none; padding: 10px 18px; border-radius: 8px;
      font-size: 13px; font-weight: 500; cursor: pointer; font-family: inherit;
    }
    .btn-primary:disabled { opacity: .5; cursor: not-allowed; }
    .btn-secondary {
      background: #1a1f2e; color: #94a3b8; border: 1px solid #2d3548;
      padding: 9px 14px; border-radius: 8px; font-size: 13px; cursor: pointer; font-family: inherit;
    }

    /* ── Modal ── */
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
    }
    .modal {
      background: #141820; border: 1px solid #2d3548; border-radius: 16px;
      padding: 24px; width: 92%; max-width: 500px; max-height: 88vh; overflow-y: auto;
    }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .modal-header h2 { margin: 0; font-size: 18px; font-weight: 600; }
    .btn-close { background: none; border: none; color: #64748b; font-size: 18px; cursor: pointer; padding: 4px; }
    .btn-close:hover { color: #e2e8f0; }
    .modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px; }

    .fg { margin-bottom: 14px; }
    .fg label { display: block; font-size: 13px; color: #94a3b8; margin-bottom: 6px; }
    .fg input, .fg select {
      width: 100%; padding: 10px 14px; background: #1a1f2e; border: 1px solid #2d3548;
      border-radius: 8px; color: #e2e8f0; font-size: 14px; box-sizing: border-box;
      font-family: inherit; outline: none;
    }
    .fg input:focus, .fg select:focus { border-color: #6366f1; }
    .readonly-input { opacity: 0.6; cursor: not-allowed; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    .type-toggle { display: flex; gap: 6px; }
    .type-toggle button {
      flex: 1; padding: 9px; background: #1a1f2e; border: 1px solid #2d3548;
      border-radius: 8px; color: #64748b; font-size: 13px; font-weight: 500;
      cursor: pointer; font-family: inherit; transition: all .15s;
    }
    .type-toggle button.active {
      background: rgba(99,102,241,.2); border-color: rgba(99,102,241,.4); color: #a5b4fc;
    }

    .form-error {
      background: rgba(248,113,113,.1); border: 1px solid rgba(248,113,113,.3);
      border-radius: 8px; padding: 10px 14px; color: #f87171; font-size: 13px; margin-bottom: 16px;
    }

    /* ── Confirm Modal ── */
    .confirm-modal {
      background: #141820; border: 1px solid #2d3548; border-radius: 16px;
      padding: 32px 28px; width: 92%; max-width: 440px; text-align: center;
      animation: confirmSlideIn 0.2s ease-out;
    }
    @keyframes confirmSlideIn {
      from { opacity: 0; transform: scale(0.92) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .confirm-icon { font-size: 44px; margin-bottom: 14px; line-height: 1; }
    .confirm-icon.warn { filter: drop-shadow(0 0 12px rgba(251,191,36,.3)); }
    .confirm-title {
      font-size: 18px; font-weight: 700; color: #e2e8f0; margin: 0 0 12px 0;
    }
    .confirm-message {
      font-size: 14px; color: #94a3b8; line-height: 1.7; margin-bottom: 24px;
      text-align: left; padding: 0 4px;
    }
    .confirm-actions { display: flex; gap: 10px; justify-content: center; }
    .confirm-actions .btn-secondary { flex: 1; max-width: 140px; }
    .confirm-btn {
      flex: 1; max-width: 200px; border: none; padding: 11px 20px; border-radius: 8px;
      font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit;
      transition: all 0.15s;
    }
    .confirm-btn:hover { opacity: 0.85; transform: translateY(-1px); }
    .confirm-btn.danger { background: linear-gradient(135deg, #f87171, #dc2626); color: #fff; }
    .confirm-btn.warn { background: linear-gradient(135deg, #fbbf24, #d97706); color: #1a1f2e; }

    /* ── Responsive ── */
    @media (max-width: 960px) {
      .resources-page { grid-template-columns: 300px 1fr; }
    }
    @media (max-width: 768px) {
      .resources-page { grid-template-columns: 1fr; }
      .resource-list { max-height: 260px; }
      .detail-header { flex-direction: column; gap: 12px; }
      .detail-btns { width: 100%; }
      .btn-assign, .btn-leave, .btn-edit { flex: 1; text-align: center; justify-content: center; }
      .capacity-grid { grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 6px; }
      .mc-util { font-size: 22px; }
    }
  `]
})
export class ResourcesComponent implements OnInit {
  resources: Resource[] = [];
  projects: Project[] = [];
  bids: Bid[] = [];
  selectedResource: Resource | null = null;
  months = MONTHS;
  monthIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  yearOptions = Array.from({length: 10}, (_, i) => 2026 + i);
  viewYear = new Date().getFullYear();

  // Resource modal
  showResourceModal = false;
  editingResourceId: string | null = null;
  resourceForm: ResourceRequest = { name: '', role: '' };

  // Assignment modal
  showAssignmentModal = false;
  editingAssignmentId: string | null = null;
  assignError = '';
  assignForm = {
    type: 'project' as 'project' | 'bid',
    projectId: '',
    bidId: '',
    name: '',
    startMonth: 0,
    endMonth: 5,
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear(),
    allocation: 100
  };

  // Leave modal
  showLeaveModal = false;
  editingLeaveId: string | null = null;
  leaveError = '';
  leaveForm = { month: 0, year: 2026, days: 1, reason: '' };

  // Confirm modal
  showConfirmModal = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmType: 'danger' | 'warning' = 'danger';
  confirmAction = 'Confirm';
  private confirmCallback: (() => void) | null = null;

  constructor(
    private resourceService: ResourceService,
    private assignmentService: AssignmentService,
    private projectService: ProjectService,
    private bidService: BidService,
    private leaveService: LeaveService
  ) {}

  ngOnInit() {
    forkJoin({
      resources: this.resourceService.getAll(),
      projects: this.projectService.getAll(),
      bids: this.bidService.getAll()
    }).subscribe(({ resources, projects, bids }) => {
      this.resources = resources;
      this.projects = projects;
      this.bids = bids;
    });
  }

  loadResources() {
    this.resourceService.getAll().subscribe(data => {
      this.resources = data;
      if (this.selectedResource) {
        this.selectedResource = data.find(r => r.id === this.selectedResource!.id) ?? null;
      }
    });
  }

  selectResource(r: Resource) {
    this.selectedResource = r;
  }

  // ── Utilization helpers ──

  getUtil(r: Resource, monthIndex: number): number {
    const y = this.viewYear;
    const target = y * 12 + monthIndex;
    const alloc = r.assignments
      .filter(a => {
        const aStart = (a.startYear || y) * 12 + a.startMonth;
        const aEnd = (a.endYear || y) * 12 + a.endMonth;
        return target >= aStart && target <= aEnd;
      })
      .reduce((sum, a) => sum + a.allocation, 0);
    return Math.round(alloc);
  }

  getAvgUtil(r: Resource): number {
    let total = 0;
    for (let i = 0; i < 12; i++) total += this.getUtil(r, i);
    return Math.round(total / 12);
  }

  getUtilColor(r: Resource, monthIndex: number) {
    return getUtilizationColor(this.getUtil(r, monthIndex));
  }

  getAvgUtilColor(r: Resource): string {
    const avg = this.getAvgUtil(r);
    if (avg === 0) return '#4a5568';
    if (avg < 50) return '#34d399';
    if (avg < 80) return '#a3e635';
    if (avg < 100) return '#fbbf24';
    return '#f87171';
  }

  getDashColor(r: Resource, monthIndex: number): string {
    const util = this.getUtil(r, monthIndex);
    if (util === 0) return '#2d3548';
    if (util < 50) return '#34d399';
    if (util < 80) return '#a3e635';
    if (util < 100) return '#fbbf24';
    return '#f87171';
  }

  getCapacity(r: Resource, monthIndex: number): number {
    const cap = r.monthlyCapacity || 22;
    const leave = r.leaves.find(l => l.month === monthIndex && l.year === this.viewYear);
    return Math.max(0, cap - (leave ? leave.days : 0));
  }

  getLeaveForMonth(r: Resource, monthIndex: number): Leave | undefined {
    return r.leaves.find(l => l.month === monthIndex && l.year === this.viewYear);
  }

  // ── Resource CRUD ──

  openAddResourceModal() {
    this.editingResourceId = null;
    this.resourceForm = { name: '', role: '', email: '', monthlyCapacity: 22, availability: 'full_time', joinDate: '', companyName: '' };
    this.showResourceModal = true;
  }

  openEditResourceModal() {
    if (!this.selectedResource) return;
    this.editingResourceId = this.selectedResource.id;
    this.resourceForm = {
      name: this.selectedResource.name,
      role: this.selectedResource.role,
      email: this.selectedResource.email ?? '',
      monthlyCapacity: this.selectedResource.monthlyCapacity || 22,
      availability: this.selectedResource.availability ?? 'full_time',
      joinDate: this.selectedResource.joinDate ?? '',
      companyName: this.selectedResource.companyName ?? ''
    };
    this.showResourceModal = true;
  }

  saveResource() {
    if (!this.resourceForm.name || !this.resourceForm.role) return;
    if (this.editingResourceId) {
      this.resourceService.update(this.editingResourceId, this.resourceForm).subscribe({
        next: () => { this.showResourceModal = false; this.loadResources(); },
        error: () => {}
      });
    } else {
      this.resourceService.create(this.resourceForm).subscribe({
        next: () => { this.showResourceModal = false; this.resourceForm = { name: '', role: '' }; this.loadResources(); },
        error: () => {}
      });
    }
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

  archiveResource(r: Resource) {
    this.openConfirm('Archive Resource',
      `Are you sure you want to archive <strong>${r.name}</strong>? This action cannot be undone.`,
      'danger', 'Yes, Archive', () => {
        this.resourceService.archive(r.id).subscribe(() => {
          if (this.selectedResource?.id === r.id) this.selectedResource = null;
          this.loadResources();
        });
      });
  }

  // ── Assignment modal ──

  openAssignmentModal() {
    this.editingAssignmentId = null;
    this.assignError = '';
    this.assignForm = { type: 'project', projectId: '', bidId: '', name: '', startMonth: 0, endMonth: 5, startYear: new Date().getFullYear(), endYear: new Date().getFullYear(), allocation: 100 };
    this.showAssignmentModal = true;
  }

  openEditAssignmentModal(a: Assignment) {
    this.editingAssignmentId = a.id;
    this.assignError = '';
    this.assignForm = {
      type: a.type,
      projectId: a.projectId ?? '',
      bidId: a.bidId ?? '',
      name: a.name,
      startMonth: a.startMonth,
      endMonth: a.endMonth,
      startYear: a.startYear || new Date().getFullYear(),
      endYear: a.endYear || new Date().getFullYear(),
      allocation: a.allocation
    };
    this.showAssignmentModal = true;
  }

  canSaveAssignment(): boolean {
    const f = this.assignForm;
    if (this.editingAssignmentId) {
      return +f.allocation >= 1 && +f.allocation <= 100 && +f.startMonth <= +f.endMonth;
    }
    const hasTarget = f.type === 'project' ? !!f.projectId : !!f.bidId;
    return hasTarget && +f.allocation >= 1 && +f.allocation <= 100 && +f.startMonth <= +f.endMonth;
  }

  saveAssignment() {
    if (!this.selectedResource || !this.canSaveAssignment()) return;
    this.assignError = '';

    const f = this.assignForm;
    const newAlloc = +f.allocation;
    const start = +f.startMonth;
    const end = +f.endMonth;

    // Duplicate check (skip the assignment being edited)
    if (!this.editingAssignmentId) {
      const duplicate = this.selectedResource.assignments.find(a =>
        (f.type === 'project' && a.type === 'project' && a.projectId === f.projectId) ||
        (f.type === 'bid' && a.type === 'bid' && a.bidId === f.bidId)
      );
      if (duplicate) {
        this.assignError = `This resource is already assigned to "${duplicate.name}".`;
        return;
      }
    }

    // Per-month availability check (exclude the assignment being edited)
    let minFree = 100;
    const blocked: string[] = [];
    for (let m = start; m <= end; m++) {
      const used = this.selectedResource.assignments
        .filter(a => a.id !== this.editingAssignmentId && m >= a.startMonth && m <= a.endMonth)
        .reduce((sum, a) => sum + a.allocation, 0);
      const free = Math.max(0, 100 - used);
      if (free < minFree) minFree = free;
      if (free < newAlloc) {
        blocked.push(`${MONTHS[m]}: ${used}% used, ${free}% free`);
      }
    }
    if (blocked.length > 0) {
      const msg = `Allocating <strong>${newAlloc}%</strong> will over-allocate this resource:<br><br>` +
        blocked.map(b => `${b}<br>`).join('') +
        `<br>Max possible across <strong>${MONTHS[start]}–${MONTHS[end]}</strong>: <strong>${minFree}%</strong>`;
      this.openConfirm('Over-Allocation Warning', msg, 'warning', 'Continue Anyway', () => this.doSaveAssignment());
      return;
    }
    this.doSaveAssignment();
  }

  private doSaveAssignment() {
    if (!this.selectedResource) return;
    const f = this.assignForm;
    const start = +f.startMonth;
    const end = +f.endMonth;
    const newAlloc = +f.allocation;

    if (this.editingAssignmentId) {
      const req: AssignmentRequest = {
        resourceId: this.selectedResource.id,
        type: f.type,
        name: f.name,
        startMonth: start,
        endMonth: end,
        startYear: +f.startYear,
        endYear: +f.endYear,
        allocation: newAlloc,
        ...(f.type === 'project' ? { projectId: f.projectId } : { bidId: f.bidId })
      };
      this.assignmentService.update(this.editingAssignmentId, req).subscribe({
        next: () => { this.showAssignmentModal = false; this.loadResources(); },
        error: (err) => { this.assignError = err.message || 'Failed to update assignment'; }
      });
    } else {
      const targetName = f.type === 'project'
        ? this.projects.find(p => p.id === f.projectId)?.name ?? ''
        : this.bids.find(b => b.id === f.bidId)?.name ?? '';

      const req: AssignmentRequest = {
        resourceId: this.selectedResource.id,
        type: f.type,
        name: targetName,
        startMonth: start,
        endMonth: end,
        startYear: +f.startYear,
        endYear: +f.endYear,
        allocation: newAlloc,
        ...(f.type === 'project' ? { projectId: f.projectId } : { bidId: f.bidId })
      };
      this.assignmentService.create(req).subscribe({
        next: () => { this.showAssignmentModal = false; this.loadResources(); },
        error: (err) => { this.assignError = err.message || 'Failed to create assignment'; }
      });
    }
  }

  deleteAssignment(id: string) {
    this.openConfirm('Remove Assignment', 'Are you sure you want to remove this assignment?', 'danger', 'Yes, Remove', () => {
      this.assignmentService.delete(id).subscribe({ next: () => this.loadResources() });
    });
  }

  // ── Leave modal ──

  openLeaveModal() {
    this.editingLeaveId = null;
    this.leaveError = '';
    this.leaveForm = { month: 0, year: 2026, days: 1, reason: '' };
    this.showLeaveModal = true;
  }

  openEditLeaveModal(l: Leave) {
    this.editingLeaveId = l.id;
    this.leaveError = '';
    this.leaveForm = { month: l.month, year: l.year, days: l.days, reason: l.reason };
    this.showLeaveModal = true;
  }

  saveLeave() {
    if (!this.selectedResource) return;
    this.leaveError = '';
    const req: LeaveRequest = {
      resourceId: this.selectedResource.id,
      month: +this.leaveForm.month,
      year: +this.leaveForm.year,
      days: +this.leaveForm.days,
      reason: this.leaveForm.reason
    };
    if (this.editingLeaveId) {
      this.leaveService.update(this.editingLeaveId, req).subscribe({
        next: () => { this.showLeaveModal = false; this.loadResources(); },
        error: (err) => { this.leaveError = err.message || 'Failed to update leave'; }
      });
    } else {
      this.leaveService.create(req).subscribe({
        next: () => { this.showLeaveModal = false; this.loadResources(); },
        error: (err) => { this.leaveError = err.message || 'Failed to save leave'; }
      });
    }
  }

  deleteLeave(id: string) {
    this.openConfirm('Remove Leave', 'Are you sure you want to remove this leave record?', 'danger', 'Yes, Remove', () => {
      this.leaveService.delete(id).subscribe({ next: () => this.loadResources() });
    });
  }
}
