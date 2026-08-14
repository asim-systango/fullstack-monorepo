import '../load-env';
import 'reflect-metadata';
import dataSource from './data-source';
import { Company } from '../modules/companies/company.entity';
import { Job } from '../modules/jobs/job.entity';
import { JobStatus } from '../modules/jobs/job-status.enum';
import { Application } from '../modules/applications/application.entity';
import { ApplicationStatus } from '../modules/applications/application-status.enum';
import { Bookmark } from '../modules/bookmarks/bookmark.entity';
import { ResumeMeta } from '../modules/resume-meta/resume-meta.entity';

type SeedUser = { id: string; email: string };

async function seed() {
  await dataSource.initialize();

  // Same Postgres DB as the gateway — resolve cross-service userIds by email.
  const gatewayUsers = (await dataSource.query(
    `SELECT id, email FROM users WHERE email = ANY($1)`,
    [
      [
        'staff@demo.local',
        'staff2@demo.local',
        'user@demo.local',
        'user2@demo.local',
      ],
    ],
  )) as SeedUser[];

  const byEmail = Object.fromEntries(gatewayUsers.map((u) => [u.email, u.id]));
  const required = ['staff@demo.local', 'staff2@demo.local', 'user@demo.local', 'user2@demo.local'];
  for (const email of required) {
    if (!byEmail[email]) {
      throw new Error(`Missing gateway user ${email} — run pnpm seed first`);
    }
  }

  const companies = dataSource.getRepository(Company);
  const jobs = dataSource.getRepository(Job);
  const applications = dataSource.getRepository(Application);
  const bookmarks = dataSource.getRepository(Bookmark);
  const resumes = dataSource.getRepository(ResumeMeta);

  let companyA = await companies.findOne({ where: { userId: byEmail['staff@demo.local'] } });
  if (!companyA) {
    companyA = await companies.save(
      companies.create({
        userId: byEmail['staff@demo.local'],
        name: 'Acme Robotics',
        website: 'https://acme.example',
        description: 'Builds warehouse automation.',
      }),
    );
  }

  let companyB = await companies.findOne({ where: { userId: byEmail['staff2@demo.local'] } });
  if (!companyB) {
    companyB = await companies.save(
      companies.create({
        userId: byEmail['staff2@demo.local'],
        name: 'Northwind Labs',
        website: 'https://northwind.example',
        description: 'Climate-tech research lab.',
      }),
    );
  }

  const jobSpecs: Array<{
    companyId: string;
    title: string;
    location: string;
    description: string;
    status: JobStatus;
  }> = [
    {
      companyId: companyA.id,
      title: 'Senior Backend Engineer',
      location: 'Remote',
      description: 'Own NestJS APIs and Postgres schema design.',
      status: JobStatus.OPEN,
    },
    {
      companyId: companyA.id,
      title: 'Frontend Engineer',
      location: 'Bengaluru',
      description: 'Ship Next.js hiring experiences.',
      status: JobStatus.OPEN,
    },
    {
      companyId: companyA.id,
      title: 'DevOps Engineer',
      location: 'Hyderabad',
      description: 'CI/CD and container orchestration.',
      status: JobStatus.CLOSED,
    },
    {
      companyId: companyB.id,
      title: 'Data Scientist',
      location: 'Remote',
      description: 'Model climate sensor streams.',
      status: JobStatus.OPEN,
    },
    {
      companyId: companyB.id,
      title: 'Product Designer',
      location: 'Pune',
      description: 'Design candidate-facing flows.',
      status: JobStatus.OPEN,
    },
  ];

  const savedJobs: Job[] = [];
  for (const spec of jobSpecs) {
    let job = await jobs.findOne({ where: { companyId: spec.companyId, title: spec.title } });
    if (!job) {
      job = await jobs.save(jobs.create(spec));
    }
    savedJobs.push(job);
  }

  if (savedJobs.length < 5) {
    throw new Error('Expected 5 seeded jobs');
  }
  const jobBackend = savedJobs[0]!;
  const jobFrontend = savedJobs[1]!;
  const jobData = savedJobs[3]!;
  const candidateA = byEmail['user@demo.local']!;
  const candidateB = byEmail['user2@demo.local']!;

  let resume = await resumes.findOne({ where: { candidateUserId: candidateA } });
  if (!resume) {
    resume = await resumes.save(
      resumes.create({
        candidateUserId: candidateA,
        url: 'https://files.example/resumes/user-a.pdf',
        label: 'Primary CV',
      }),
    );
  }

  const applicationSpecs: Array<{
    jobId: string;
    candidateUserId: string;
    status: ApplicationStatus;
    coverLetter: string;
    resumeUrl?: string;
  }> = [
    {
      jobId: jobBackend.id,
      candidateUserId: candidateA,
      status: ApplicationStatus.SUBMITTED,
      coverLetter: 'Excited to work on NestJS domain APIs.',
      resumeUrl: resume.url,
    },
    {
      jobId: jobBackend.id,
      candidateUserId: candidateB,
      status: ApplicationStatus.REVIEWING,
      coverLetter: 'I have shipped TypeORM migrations in production.',
    },
    {
      jobId: jobFrontend.id,
      candidateUserId: candidateA,
      status: ApplicationStatus.HIRED,
      coverLetter: 'Same candidate across jobs (duplicate-candidate case).',
      resumeUrl: resume.url,
    },
    {
      jobId: jobData.id,
      candidateUserId: candidateB,
      status: ApplicationStatus.REJECTED,
      coverLetter: 'Applied to Northwind data science role.',
    },
  ];

  for (const spec of applicationSpecs) {
    const existing = await applications.findOne({
      where: { jobId: spec.jobId, candidateUserId: spec.candidateUserId },
    });
    if (!existing) {
      await applications.save(applications.create(spec));
    }
  }

  for (const jobId of [jobBackend.id, jobData.id]) {
    const existing = await bookmarks.findOne({ where: { userId: candidateA, jobId } });
    if (!existing) {
      await bookmarks.save(bookmarks.create({ userId: candidateA, jobId }));
    }
  }

  console.log('Domain seed complete', {
    companies: [companyA.name, companyB.name],
    jobs: savedJobs.length,
    applications: applicationSpecs.length,
    bookmarks: 2,
  });

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
