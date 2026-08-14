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
