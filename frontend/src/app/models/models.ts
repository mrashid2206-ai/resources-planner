// ============================================================
// Resource Planner Pro — TypeScript Models
// Maps to Spring Boot DTOs
// ============================================================

// ─── Enums ──────────────────────────────────────────────────

export type ProjectStatus = 'active' | 'on_hold' | 'completed';
export type BidStatus = 'pending' | 'submitted' | 'won' | 'lost';
export type AssignmentType = 'project' | 'bid';
export type ResourceAvailability = 'full_time' | 'part_time'; // full_time = SITA Full Time, part_time = Contractor

// ─── Core Models ────────────────────────────────────────────

export interface Resource {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  availability: ResourceAvailability;
  monthlyCapacity: number;
  hourlyRate?: number;
  avatarUrl?: string;
  companyName?: string;
  joinDate?: string;
  isArchived: boolean;
  assignments: Assignment[];
  leaves: Leave[];
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  startMonth: number;
  endMonth: number;
  startYear: number;
  endYear: number;
  budget?: number;
  budgetSpent?: number;
  client?: string;
  description?: string;
  sourceBidId?: string;
  isArchived: boolean;
  assignments: Assignment[];
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  id: string;
  name: string;
  status: BidStatus;
  startMonth: number;
  endMonth: number;
  startYear: number;
  endYear: number;
  estimatedValue?: number;
  probability?: number;
  client?: string;
  description?: string;
  winLossReason?: string;
  convertedProjectId?: string;
  isArchived: boolean;
  assignments: Assignment[];
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  resourceId: string;
  resourceName?: string;
  projectId?: string;
  bidId?: string;
  name: string;
  type: AssignmentType;
  startMonth: number;
  endMonth: number;
  startYear: number;
  endYear: number;
  allocation: number;
  createdAt: string;
}

export interface Leave {
  id: string;
  resourceId: string;
  month: number;
  year: number;
  days: number;
  reason: string;
}

export interface Tag {
  id: string;
  name: string;
}

// ─── Request Models ─────────────────────────────────────────

export interface ResourceRequest {
  name: string;
  role: string;
  email?: string;
  phone?: string;
  availability?: ResourceAvailability;
  monthlyCapacity?: number;
  hourlyRate?: number;
  avatarUrl?: string;
  companyName?: string;
  joinDate?: string;
  tagIds?: string[];
}

export interface ProjectRequest {
  name: string;
  status?: ProjectStatus;
  startMonth: number;
  endMonth: number;
  startYear?: number;
  endYear?: number;
  budget?: number;
  client?: string;
  description?: string;
}

export interface BidRequest {
  name: string;
  status?: BidStatus;
  startMonth: number;
  endMonth: number;
  startYear?: number;
  endYear?: number;
  estimatedValue?: number;
  probability?: number;
  client?: string;
  description?: string;
  winLossReason?: string;
}

export interface AssignmentRequest {
  resourceId: string;
  projectId?: string;
  bidId?: string;
  name: string;
  type: AssignmentType;
  startMonth: number;
  endMonth: number;
  startYear?: number;
  endYear?: number;
  allocation: number;
}

export interface LeaveRequest {
  resourceId: string;
  month: number;
  year?: number;
  days: number;
  reason: string;
}

export interface ReassignmentRequest {
  assignmentId: string;
  targetProjectId?: string;
  targetBidId?: string;
  newStartMonth?: number;
  newEndMonth?: number;
  newAllocation?: number;
}

// ─── Dashboard Models ───────────────────────────────────────

export interface DashboardData {
  totalResources: number;
  activeProjects: number;
  activeBids: number;
  avgUtilization: number;
  totalBudget: number;
  weightedPipeline: number;
  utilizationHeatmap: UtilizationEntry[];
  projectsByStatus: Record<string, number>;
  bidsByStatus: Record<string, number>;
  capacityForecast: MonthlyCapacityForecast[];
}

export interface UtilizationEntry {
  resourceName: string;
  role: string;
  monthlyUtilization: number[];
}

export interface MonthlyCapacityForecast {
  monthIndex: number;
  monthName: string;
  totalCapacity: number;
  totalAllocated: number;
  availableCapacity: number;
}

// ─── Utility Types ──────────────────────────────────────────

export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export interface UtilizationColor {
  bg: string;
  text: string;
  border: string;
}

export function getUtilizationColor(util: number): UtilizationColor {
  if (util === 0) return { bg: '#1a1f2e', text: '#4a5568', border: '#2d3548' };
  if (util < 50) return { bg: '#0d2818', text: '#34d399', border: '#065f27' };
  if (util < 80) return { bg: '#1a2c10', text: '#a3e635', border: '#3d6b1e' };
  if (util < 100) return { bg: '#2c1f0a', text: '#fbbf24', border: '#7c5a12' };
  return { bg: '#2c0a0a', text: '#f87171', border: '#7c1212' };
}
