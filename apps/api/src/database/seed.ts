import '../load-env';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { resolve } from 'path';
import { Course } from '../modules/courses/course.entity';
import { Lesson } from '../modules/lessons/lesson.entity';
import { Quiz } from '../modules/quizzes/quiz.entity';
import { Question } from '../modules/quizzes/question.entity';
import { Enrollment } from '../modules/enrollments/enrollment.entity';
import { Submission } from '../modules/submissions/submission.entity';
import { Grade } from '../modules/grades/grade.entity';
import { Certificate } from '../modules/certificates/certificate.entity';

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL is required for seeding');
}

const dataSource = new DataSource({
  type: 'postgres',
  url,
  entities: [resolve(__dirname, '../**/*.entity.{ts,js}')],
  synchronize: false,
});

export async function seedDatabase() {
  await dataSource.initialize();

  const courseRepo = dataSource.getRepository(Course);
  const lessonRepo = dataSource.getRepository(Lesson);
  const quizRepo = dataSource.getRepository(Quiz);
  const questionRepo = dataSource.getRepository(Question);
  const enrollmentRepo = dataSource.getRepository(Enrollment);
  const submissionRepo = dataSource.getRepository(Submission);
  const gradeRepo = dataSource.getRepository(Grade);
  const certificateRepo = dataSource.getRepository(Certificate);

  // Clean existing data using raw SQL to handle foreign key constraints
  // Truncate in reverse dependency order, using CASCADE only when needed
  await dataSource.query('TRUNCATE TABLE "certificates" CASCADE');
  await dataSource.query('TRUNCATE TABLE "grades" CASCADE');
  await dataSource.query('TRUNCATE TABLE "submissions" CASCADE');
  await dataSource.query('TRUNCATE TABLE "lesson_progress" CASCADE');
  await dataSource.query('TRUNCATE TABLE "enrollments" CASCADE');
  await dataSource.query('TRUNCATE TABLE "questions" CASCADE');
  await dataSource.query('TRUNCATE TABLE "quizzes" CASCADE');
  await dataSource.query('TRUNCATE TABLE "lessons" CASCADE');
  await dataSource.query('TRUNCATE TABLE "courses" CASCADE');

  // Define user IDs (these should exist in the gateway users table)
  const instructorId = '00000000-0000-0000-0000-000000000001';
  const student1Id = '00000000-0000-0000-0000-000000000002';
  const student2Id = '00000000-0000-0000-0000-000000000003';
  const student3Id = '00000000-0000-0000-0000-000000000004';

  // Create 2 courses (1 published, 1 draft)
  const publishedCourse = courseRepo.create({
    title: 'Introduction to Web Development',
    slug: 'intro-web-dev',
    description: 'Learn the fundamentals of web development',
    instructorId,
    publishedAt: new Date(),
  });
  const savedPublishedCourse = await courseRepo.save(publishedCourse);

  const draftCourse = courseRepo.create({
    title: 'Advanced React Patterns',
    slug: 'advanced-react',
    description: 'Deep dive into React advanced concepts',
    instructorId,
    publishedAt: null,
  });
  const savedDraftCourse = await courseRepo.save(draftCourse);

  // Create 5 lessons distributed between courses
  const lessons = [
    { title: 'HTML Basics', position: 1, courseId: savedPublishedCourse.id },
    { title: 'CSS Fundamentals', position: 2, courseId: savedPublishedCourse.id },
    { title: 'JavaScript Introduction', position: 3, courseId: savedPublishedCourse.id },
    { title: 'React Components', position: 1, courseId: savedDraftCourse.id },
    { title: 'State Management', position: 2, courseId: savedDraftCourse.id },
  ];

  await lessonRepo.save(lessons.map((l) => lessonRepo.create(l)));

  // Create 2 quizzes with 3 questions each
  const quiz1 = quizRepo.create({
    courseId: savedPublishedCourse.id,
    title: 'HTML & CSS Quiz',
    dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  });
  const savedQuiz1 = await quizRepo.save(quiz1);

  const quiz2 = quizRepo.create({
    courseId: savedDraftCourse.id,
    title: 'React Concepts Quiz',
    dueAt: null,
  });
  const savedQuiz2 = await quizRepo.save(quiz2);

  // Create 3 questions for each quiz
  const questions1 = [
    {
      quizId: savedQuiz1.id,
      type: 'mcq' as const,
      prompt: 'What does HTML stand for?',
      correctAnswer: 'HyperText Markup Language',
      choices: [
        'HyperText Markup Language',
        'HighText Machine Language',
        'HyperTool Multi Language',
        'HomeTool Markup Language',
      ],
      position: 1,
    },
    {
      quizId: savedQuiz1.id,
      type: 'mcq' as const,
      prompt: 'Which CSS property changes text color?',
      correctAnswer: 'color',
      choices: ['text-color', 'font-color', 'color', 'text-style'],
      position: 2,
    },
    {
      quizId: savedQuiz1.id,
      type: 'short_answer' as const,
      prompt: 'What tag is used to create a paragraph in HTML?',
      correctAnswer: 'p',
      position: 3,
    },
  ];

  const questions2 = [
    {
      quizId: savedQuiz2.id,
      type: 'mcq' as const,
      prompt: 'What hook is used for state management in React?',
      correctAnswer: 'useState',
      choices: ['useState', 'useEffect', 'useContext', 'useReducer'],
      position: 1,
    },
    {
      quizId: savedQuiz2.id,
      type: 'mcq' as const,
      prompt: 'Which is NOT a React lifecycle method?',
      correctAnswer: 'componentDidUpdate',
      choices: [
        'componentDidMount',
        'componentWillUnmount',
        'componentDidUpdate',
        'render',
      ],
      position: 2,
    },
    {
      quizId: savedQuiz2.id,
      type: 'short_answer' as const,
      prompt: 'What hook is used for side effects in React?',
      correctAnswer: 'useEffect',
      position: 3,
    },
  ];

  const savedQuestions1 = await questionRepo.save(
    questions1.map((q) => questionRepo.create(q)),
  );
  await questionRepo.save(questions2.map((q) => questionRepo.create(q)));

  // Create 3 enrollments
  const enrollment1 = enrollmentRepo.create({
    courseId: savedPublishedCourse.id,
    studentId: student1Id,
  });
  const savedEnrollment1 = await enrollmentRepo.save(enrollment1);

  await enrollmentRepo.save([
    enrollmentRepo.create({
      courseId: savedPublishedCourse.id,
      studentId: student2Id,
    }),
    enrollmentRepo.create({
      courseId: savedPublishedCourse.id,
      studentId: student3Id,
    }),
  ]);

  // Create 2 submissions (1 graded)
  const submission1 = submissionRepo.create({
    quizId: savedQuiz1.id,
    studentId: student1Id,
    answers: [
      { questionId: savedQuestions1[0]?.id || '', answer: 'HyperText Markup Language' },
      { questionId: savedQuestions1[1]?.id || '', answer: 'color' },
      { questionId: savedQuestions1[2]?.id || '', answer: 'p' },
    ],
  });
  const savedSubmission1 = await submissionRepo.save(submission1);

  await submissionRepo.save(
    submissionRepo.create({
      quizId: savedQuiz1.id,
      studentId: student2Id,
      answers: [
        { questionId: savedQuestions1[0]?.id || '', answer: 'HighText Machine Language' },
        { questionId: savedQuestions1[1]?.id || '', answer: 'text-color' },
        { questionId: savedQuestions1[2]?.id || '', answer: 'paragraph' },
      ],
    }),
  );

  // Grade the first submission
  const grade1 = gradeRepo.create({
    submissionId: savedSubmission1.id,
    graderId: instructorId,
    score: 85,
    feedback: 'Good work! All answers were correct.',
  });
  await gradeRepo.save(grade1);

  // Create 1 certificate for the graded submission (score >= 70)
  const certificate1 = certificateRepo.create({
    enrollmentId: savedEnrollment1.id,
    issuedAt: new Date(),
  });
  await certificateRepo.save(certificate1);

  console.log('Seed data created successfully!');
  console.log(`- ${await courseRepo.count()} courses`);
  console.log(`- ${await lessonRepo.count()} lessons`);
  console.log(`- ${await quizRepo.count()} quizzes`);
  console.log(`- ${await questionRepo.count()} questions`);
  console.log(`- ${await enrollmentRepo.count()} enrollments`);
  console.log(`- ${await submissionRepo.count()} submissions`);
  console.log(`- ${await gradeRepo.count()} grades`);
  console.log(`- ${await certificateRepo.count()} certificates`);

  await dataSource.destroy();
}

seedDatabase().catch(console.error);
