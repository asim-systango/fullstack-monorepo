import '../load-env';
import 'reflect-metadata';
import * as bcrypt from 'bcryptjs';
import dataSource from './data-source';
import { User } from '../modules/users';

// const instructorA = '11111111-1111-1111-1111-111111111111';
// const studentA = '22222222-2222-2222-2222-222222222222';
// const studentB = '33333333-3333-3333-3333-333333333333';
// const studentC = '44444444-4444-4444-4444-444444444444';

// const seeds: Array<{ email: string; name: string; role: User['role']; id: string }> = [
//   { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', email: 'admin@demo.local', name: 'Demo Admin', role: 'admin' },
//   { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', email: 'user@demo.local', name: 'Demo User', role: 'user' },
//   { id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', email: 'staff@demo.local', name: 'Demo Staff', role: 'staff' },
// ];

async function seed() {
  await dataSource.initialize();
  const users = dataSource.getRepository(User);
  const passwordHash = await bcrypt.hash('password123', 12);

  const seeds: Array<{ email: string; name: string; role: User['role'] }> = [
    { email: 'admin@demo.local', name: 'Demo Admin', role: 'admin' },
    { email: 'user@demo.local', name: 'Demo User', role: 'user' },
    { email: 'staff@demo.local', name: 'Demo Staff', role: 'staff' },
  ];

  for (const row of seeds) {
    const existing = await users.findOne({ where: { email: row.email } });
    if (!existing) {
      await users.save(
        users.create({
          email: row.email,
          name: row.name,
          passwordHash,
          role: row.role,
        }),
      );
    }
  }

  console.log('Seed complete — password for all: password123', {
    emails: seeds.map((s) => s.email),
  });

  // await dataSource.query(
  //   `INSERT INTO "courses" ("id", "title", "slug", "description", "instructor_id", "published_at", "created_at", "updated_at")
  //    VALUES ($1, $2, $3, $4, $5, $6, $7, $8), ($9, $10, $11, $12, $13, $14, $15, $16)
  //    ON CONFLICT ("slug") DO NOTHING;`,
  //   [
  //     '11111111-0000-0000-0000-000000000001',
  //     'Intro to LMS',
  //     'intro-to-lms',
  //     'A published course for learners to enroll and complete.',
  //     instructorA,
  //     now,
  //     now,
  //     now,
  //     '11111111-0000-0000-0000-000000000002',
  //     'Draft Course Example',
  //     'lms-draft-course',
  //     'A draft course visible only to instructors.',
  //     instructorA,
  //     null,
  //     now,
  //     now,
  //   ],
  // );

  // await dataSource.query(
  //   `INSERT INTO "lessons" ("id", "course_id", "title", "content", "position", "created_at", "updated_at")
  //    VALUES
  //      ($1, $2, $3, $4, $5, $6, $7),
  //      ($8, $9, $10, $11, $12, $13, $14),
  //      ($15, $16, $17, $18, $19, $20, $21),
  //      ($22, $23, $24, $25, $26, $27, $28),
  //      ($29, $30, $31, $32, $33, $34, $35)
  //    ON CONFLICT ("course_id", "position") DO NOTHING;`,
  //   [
  //     '11111111-1000-1000-1000-000000000001', '11111111-0000-0000-0000-000000000001', 'Welcome', 'Welcome to the LMS course.', 1, now, now,
  //     '11111111-1000-1000-1000-000000000002', '11111111-0000-0000-0000-000000000001', 'Lesson 1: Overview', 'This lesson covers the basics.', 2, now, now,
  //     '11111111-1000-1000-1000-000000000003', '11111111-0000-0000-0000-000000000001', 'Lesson 2: Practice', 'This lesson includes practical examples.', 3, now, now,
  //     '11111111-1000-1000-1000-000000000004', '11111111-0000-0000-0000-000000000002', 'Draft Lesson 1', 'Draft course content.', 1, now, now,
  //     '11111111-1000-1000-1000-000000000005', '11111111-0000-0000-0000-000000000002', 'Draft Lesson 2', 'More draft material.', 2, now, now,
  //   ],
  // );

  // await dataSource.query(
  //   `INSERT INTO "quizzes" ("id", "course_id", "title", "due_at", "created_at", "updated_at")
  //    VALUES
  //      ($1, $2, $3, $4, $5, $6),
  //      ($7, $8, $9, $10, $11, $12)
  //    ON CONFLICT ("course_id", "title") DO NOTHING;`,
  //   [
  //     '11111111-2000-2000-2000-000000000001', '11111111-0000-0000-0000-000000000001', 'Intro Quiz', now, now, now,
  //     '11111111-2000-2000-2000-000000000002', '11111111-0000-0000-0000-000000000001', 'Final Assessment', now, now, now,
  //   ],
  // );

  // await dataSource.query(
  //   `INSERT INTO "questions" ("id", "quiz_id", "type", "prompt", "correct_answer", "choices", "position", "created_at", "updated_at")
  //    VALUES
  //      ($1, $2, $3, $4, $5, $6, $7, $8, $9),
  //      ($10, $11, $12, $13, $14, $15, $16, $17, $18),
  //      ($19, $20, $21, $22, $23, $24, $25, $26, $27),
  //      ($28, $29, $30, $31, $32, $33, $34, $35, $36),
  //      ($37, $38, $39, $40, $41, $42, $43, $44, $45),
  //      ($46, $47, $48, $49, $50, $51, $52, $53, $54)
  //    ON CONFLICT ("quiz_id", "position") DO NOTHING;`,
  //   [
  //     '11111111-3000-3000-3000-000000000001', '11111111-2000-2000-2000-000000000001', 'mcq', 'What is a course?', 'A structured learning unit', JSON.stringify(['A structured learning unit', 'A single video', 'A payment method']), 1, now, now,
  //     '11111111-3000-3000-3000-000000000002', '11111111-2000-2000-2000-000000000001', 'short_answer', 'Why is enrollment important?', 'It tracks student participation', null, 2, now, now,
  //     '11111111-3000-3000-3000-000000000003', '11111111-2000-2000-2000-000000000001', 'mcq', 'Which role can publish courses?', 'staff', JSON.stringify(['user', 'staff', 'admin']), 3, now, now,
  //     '11111111-3000-3000-3000-000000000004', '11111111-2000-2000-2000-000000000002', 'mcq', 'What indicates a published course?', 'publishedAt is set', JSON.stringify(['title exists', 'publishedAt is set', 'deletedAt is null']), 1, now, now,
  //     '11111111-3000-3000-3000-000000000005', '11111111-2000-2000-2000-000000000002', 'short_answer', 'What should students not do after due date?', 'Submit the quiz', null, 2, now, now,
  //     '11111111-3000-3000-3000-000000000006', '11111111-2000-2000-2000-000000000002', 'mcq', 'Who can grade submissions?', 'staff', JSON.stringify(['admin', 'user', 'staff']), 3, now, now,
  //   ],
  // );

  // await dataSource.query(
  //   `INSERT INTO "enrollments" ("id", "course_id", "student_id", "enrolled_at")
  //    VALUES
  //      ($1, $2, $3, $4),
  //      ($5, $6, $7, $8),
  //      ($9, $10, $11, $12)
  //    ON CONFLICT ("course_id", "student_id") DO NOTHING;`,
  //   [
  //     '11111111-4000-4000-4000-000000000001', '11111111-0000-0000-0000-000000000001', studentA, now,
  //     '11111111-4000-4000-4000-000000000002', '11111111-0000-0000-0000-000000000001', studentB, now,
  //     '11111111-4000-4000-4000-000000000003', '11111111-0000-0000-0000-000000000001', studentC, now,
  //   ],
  // );

  // await dataSource.query(
  //   `INSERT INTO "submissions" ("id", "quiz_id", "student_id", "answers", "submitted_at")
  //    VALUES
  //      ($1, $2, $3, $4, $5),
  //      ($6, $7, $8, $9, $10)
  //    ON CONFLICT ("quiz_id", "student_id") DO NOTHING;`,
  //   [
  //     '11111111-5000-5000-5000-000000000001', '11111111-2000-2000-2000-000000000001', studentA,
  //     JSON.stringify([
  //       { questionId: '11111111-3000-3000-3000-000000000001', answer: 'A structured learning unit' },
  //       { questionId: '11111111-3000-3000-3000-000000000002', answer: 'It tracks student participation' },
  //       { questionId: '11111111-3000-3000-3000-000000000003', answer: 'staff' },
  //     ]),
  //     now,
  //     '11111111-5000-5000-5000-000000000002', '11111111-2000-2000-2000-000000000002', studentB,
  //     JSON.stringify([
  //       { questionId: '11111111-3000-3000-3000-000000000004', answer: 'publishedAt is set' },
  //       { questionId: '11111111-3000-3000-3000-000000000005', answer: 'Submit the quiz' },
  //       { questionId: '11111111-3000-3000-3000-000000000006', answer: 'staff' },
  //     ]),
  //     now,
  //   ],
  // );

  // await dataSource.query(
  //   `INSERT INTO "grades" ("id", "submission_id", "grader_id", "score", "feedback", "created_at", "updated_at")
  //    VALUES ($1, $2, $3, $4, $5, $6, $7)
  //    ON CONFLICT ("submission_id") DO NOTHING;`,
  //   ['11111111-6000-6000-6000-000000000001', '11111111-5000-5000-5000-000000000001', instructorA, 88, 'Well done.', now, now],
  // );

  // await dataSource.query(
  //   `INSERT INTO "certificates" ("id", "enrollment_id", "issued_at", "created_at", "updated_at")
  //    VALUES ($1, $2, $3, $4, $5)
  //    ON CONFLICT ("enrollment_id") DO NOTHING;`,
  //   ['11111111-7000-7000-7000-000000000001', '11111111-4000-4000-4000-000000000001', now, now, now],
  // );

  // console.log('Seed complete — password for all: password123');

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
