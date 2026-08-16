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

/**
 * Domain seed targets (must stay in sync with the project brief):
 *   Company      2  — one per gateway staff demo user (lookup by email)
 *   Job          5  — 4 open, 1 closed; ≥2 distinct locations
 *   Application  4  — ≥3 statuses; same candidate on two different jobs
 *   Bookmark      2  — candidate bookmarks on two different jobs
 *   ResumeMeta  ≥1  — ≥1 Application.resumeUrl matches ResumeMeta.url
 *   Total       ≥12
 */
async function seed() {
  await dataSource.initialize();

  // Same Postgres DB as the gateway — resolve cross-service userIds by email.
  const gatewayUsers = (await dataSource.query(
    `SELECT id, email FROM users WHERE email = ANY($1)`,
    [['staff@demo.local', 'staff2@demo.local', 'user@demo.local', 'user2@demo.local']],
  )) as SeedUser[];

  const byEmail = Object.fromEntries(gatewayUsers.map((u) => [u.email, u.id]));
  const required = [
    'staff@demo.local',
    'staff2@demo.local',
    'user@demo.local',
    'user2@demo.local',
  ];
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

  let companyA = await companies.findOne({
    where: { userId: byEmail['staff@demo.local'] },
  });
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

  let companyB = await companies.findOne({
    where: { userId: byEmail['staff2@demo.local'] },
  });
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
    let job = await jobs.findOne({
      where: { companyId: spec.companyId, title: spec.title },
    });
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

  // Four applications across ≥3 statuses. candidateA applies to two DIFFERENT jobs
  // (duplicate-candidate pair — not the same job twice). jobBackend gets 2+ apps for inbox demo.
  // resumeUrl on candidateA's apps snapshots ResumeMeta.url.
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

  // Count from the DB so the log reflects actual rows, not the intended specs.
  const companyCount = await companies.count();
  const jobCount = await jobs.count();
  const openJobCount = await jobs.count({ where: { status: JobStatus.OPEN } });
  const closedJobCount = await jobs.count({ where: { status: JobStatus.CLOSED } });
  const applicationCount = await applications.count();
  const bookmarkCount = await bookmarks.count();
  const resumeCount = await resumes.count();
  const total = companyCount + jobCount + applicationCount + bookmarkCount + resumeCount;

  const locations = [...new Set((await jobs.find()).map((j) => j.location))];
  const statuses = [...new Set((await applications.find()).map((a) => a.status))];
  const snapshotMatches = await applications.count({ where: { resumeUrl: resume.url } });
  const appsOnBackend = await applications.count({ where: { jobId: jobBackend.id } });

  if (companyCount < 2) throw new Error(`Expected ≥2 companies, got ${companyCount}`);
  if (jobCount < 5) throw new Error(`Expected ≥5 jobs, got ${jobCount}`);
  if (openJobCount < 4 || closedJobCount < 1) {
    throw new Error(
      `Expected ≥4 open + ≥1 closed jobs, got open=${openJobCount} closed=${closedJobCount}`,
    );
  }
  if (locations.length < 2)
    throw new Error(`Expected ≥2 locations, got ${locations.join(',')}`);
  if (applicationCount < 4)
    throw new Error(`Expected ≥4 applications, got ${applicationCount}`);
  if (statuses.length < 3)
    throw new Error(`Expected ≥3 application statuses, got ${statuses.join(',')}`);
  if (appsOnBackend < 2)
    throw new Error(`Expected ≥2 apps on inbox job, got ${appsOnBackend}`);
  if (bookmarkCount < 2) throw new Error(`Expected ≥2 bookmarks, got ${bookmarkCount}`);
  if (resumeCount < 1) throw new Error(`Expected ≥1 ResumeMeta, got ${resumeCount}`);
  if (snapshotMatches < 1) {
    throw new Error('Expected ≥1 Application.resumeUrl matching ResumeMeta.url');
  }
  if (total < 12) throw new Error(`Expected ≥12 domain rows, got ${total}`);

  console.log('Domain seed complete', {
    companies: companyCount,
    jobs: jobCount,
    jobsOpen: openJobCount,
    jobsClosed: closedJobCount,
    locations,
    applications: applicationCount,
    applicationStatuses: statuses,
    appsOnInboxJob: appsOnBackend,
    bookmarks: bookmarkCount,
    resumeMetas: resumeCount,
    snapshotResumeUrlMatches: snapshotMatches,
    totalDomainRows: total,
    companyNames: [companyA.name, companyB.name],
  });

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
