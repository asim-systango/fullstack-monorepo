export type ProjectMemberRole = 'lead' | 'member';
export type IssueStatus = 'todo' | 'in_progress' | 'done';

export type Project = {
  id: string;
  name: string;
  key: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  members?: ProjectMember[];
};

export type ProjectMember = {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectMemberRole;
  createdAt: string;
};

export type Label = {
  id: string;
  projectId: string;
  name: string;
  color: string;
};

export type Issue = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: IssueStatus;
  assigneeId: string | null;
  reporterId: string;
  createdAt: string;
  updatedAt: string;
  labels: Label[];
  comments?: Comment[];
  activity?: ActivityLog[];
};

export type Comment = {
  id: string;
  issueId: string;
  authorUserId: string;
  body: string;
  createdAt: string;
};

export type ActivityLog = {
  id: string;
  issueId: string;
  actorUserId: string;
  type: string;
  message: string;
  createdAt: string;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};
