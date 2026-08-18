export interface Certificate {
  id: string;
  enrollmentId: string;
  issuedAt: string;
  createdAt: string;
  updatedAt: string;
  enrollment?: {
    id: string;
    courseId: string;
    studentId: string;
    course: {
      id: string;
      title: string;
    };
  };
}
