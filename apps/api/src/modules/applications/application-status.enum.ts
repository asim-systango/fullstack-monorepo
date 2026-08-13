export enum ApplicationStatus {
  SUBMITTED = 'submitted',
  REVIEWING = 'reviewing',
  REJECTED = 'rejected',
  HIRED = 'hired',
}

export const ALLOWED_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  [ApplicationStatus.SUBMITTED]: [ApplicationStatus.REVIEWING, ApplicationStatus.REJECTED],
  [ApplicationStatus.REVIEWING]: [ApplicationStatus.REJECTED, ApplicationStatus.HIRED],
  [ApplicationStatus.REJECTED]: [],
  [ApplicationStatus.HIRED]: [],
};