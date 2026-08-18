export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  instructorId: string;
  publishedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lessons?: Lesson[];
  quizzes?: Quiz[];
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  dueAt: string | null;
  createdAt: string;
  updatedAt: string;
  questions?: Question[];
}

export interface Question {
  id?: string;
  quizId?: string;
  type: 'mcq' | 'short_answer';
  prompt: string;
  correctAnswer?: string;
  choices?: string[];
  position?: number;
  createdAt?: string;
  updatedAt?: string;
}
