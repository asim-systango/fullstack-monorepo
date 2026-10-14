/** Domain types mirrored from apps/api entities / service return shapes. */

export type JobStatus = 'open' | 'closed';

export type ApplicationStatus = 'submitted' | 'reviewing' | 'rejected' | 'hired';

/** UX aid only — server ALLOWED_TRANSITIONS is authoritative. */
export const APPLICATION_STATUS_TRANSITIONS: Record<
  ApplicationStatus,
  readonly ApplicationStatus[]
> = {
  submitted: ['reviewing', 'rejected'],
  reviewing: ['rejected', 'hired'],
  rejected: [],
  hired: [],
};

export type Company = {
  id: string;
  userId: string;
  name: string;
  website?: string;
  description?: string;
  suspended: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Job = {
  id: string;
  companyId: string;
  title: string;
  location: string;
  description: string;
  status: JobStatus;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  company?: Company;
};

export type PaginatedJobs = {
  data: Job[];
  page: number;
  limit: number;
  total: number;
};

export type Application = {
  id: string;
  jobId: string;
  candidateUserId: string;
  status: ApplicationStatus;
  coverLetter: string;
  resumeUrl?: string;
  createdAt: string;
  updatedAt: string;
  job?: Job;
};

export type Bookmark = {
  id: string;
  userId: string;
  jobId: string;
  createdAt: string;
  job?: Job;
};

export type ResumeMeta = {
  id: string;
  candidateUserId: string;
  url: string;
  label?: string;
  cloudinaryPublicId?: string;
  createdAt: string;
};

export type UploadSignaturePayload = {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
};

export type StaffDashboard = {
  openJobCount: number;
  applicationsByStatus: Partial<Record<ApplicationStatus, number>>;
};

export type CandidateSummary = {
  byStatus: Partial<Record<ApplicationStatus, number>>;
};
