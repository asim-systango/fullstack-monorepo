export interface Grade {
  id: string;
  submissionId: string;
  graderId: string;
  score: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
  submission?: {
    quiz: {
      id: string;
      title: string;
      course: {
        id: string;
        title: string;
      };
    };
  };
}
