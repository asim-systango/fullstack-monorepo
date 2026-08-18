export interface Submission {
  id: string;
  quizId: string;
  studentId: string;
  answers: Answer[];
  submittedAt: string;
  quiz?: {
    id: string;
    title: string;
    course: {
      id: string;
      title: string;
    };
  };
}

export interface Answer {
  questionId: string;
  answer: string;
}
