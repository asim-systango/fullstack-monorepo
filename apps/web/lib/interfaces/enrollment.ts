export interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  enrolledAt: string;
  course?: {
    id: string;
    title: string;
    description: string;
  };
}
