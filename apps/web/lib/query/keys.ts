export const queryKeys = {
  me: ['auth', 'me'] as const,
  jobs: (params: object) => ['jobs', params] as const,
  job: (id: string) => ['jobs', id] as const,
  companyJobs: ['company', 'jobs'] as const,
  myApplications: ['my', 'applications'] as const,
  myApplicationsSummary: ['my', 'applications', 'summary'] as const,
  companyApplications: (status?: string) =>
    ['company', 'applications', status ?? 'all'] as const,
  companyApplication: (id: string) => ['company', 'applications', id] as const,
  bookmarks: ['bookmarks'] as const,
  resumes: ['resumes'] as const,
  companyMe: ['companies', 'me'] as const,
  staffDashboard: ['dashboard', 'staff'] as const,
  adminCompanies: ['admin', 'companies'] as const,
};
