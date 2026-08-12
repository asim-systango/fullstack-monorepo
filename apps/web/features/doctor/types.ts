/** Doctor profile shape matching the backend DoctorProfile entity. */
export type DoctorProfile = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  consultationFee: number;
  hospitalCharge?: number;
  biography: string | null;
  profileImage: string | null;
  isActive: boolean;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

/** Filters for the doctor directory. */
export type DoctorFilters = {
  specialization?: string;
  search?: string;
  approvalStatus?: string;
  isActive?: boolean;
};
