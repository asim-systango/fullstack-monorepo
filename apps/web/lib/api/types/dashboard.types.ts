import type { Lead } from './leads.types';
import type { Deal } from './deals.types';
import type { Activity } from './activities.types';

export interface OverallKpis {
  organizations: {
    total: number;
    active: number;
  };
  platformUsers: {
    total: number;
    pendingInvites: number;
  };
  organizationRequests: {
    total: number;
    pending: number;
    inReview: number;
    approved: number;
    rejected: number;
  };
}

export interface WorkspaceKpis {
  openLeadsCount: number;
  totalLeadsCount: number;
  openPipelineAmount: number;
  activeDealsCount: number;
  wonAmount: number;
  wonDealsCount: number;
  contactsCount: number;
  lostDealsCount: number;
}

export interface WorkspaceDashboardData {
  kpis: WorkspaceKpis;
  recentLeads: Lead[];
  recentDeals: Deal[];
  upcomingTasks: Activity[];
}
