import './../load-env';
import 'reflect-metadata';
import dataSource from './data-source';
import { Template } from '../modules/templates/template.entity';
import { Resume } from '../modules/resumes/resume.entity';
import { Section } from '../modules/resumes/section.entity';
import { SectionItem } from '../modules/resumes/section-item.entity';

type GatewayUser = { id: string; email: string };

async function seed() {
  await dataSource.initialize();

  const templates = dataSource.getRepository(Template);
  const resumes = dataSource.getRepository(Resume);
  const sections = dataSource.getRepository(Section);
  const items = dataSource.getRepository(SectionItem);

  const users: GatewayUser[] = await dataSource.query(
    `SELECT id, email FROM users WHERE email IN ($1, $2, $3)`,
    ['user@demo.local', 'admin@demo.local', 'staff@demo.local'],
  );
  const byEmail = Object.fromEntries(users.map((u) => [u.email, u.id]));
  const candidateId = byEmail['user@demo.local'];
  if (!candidateId) {
    throw new Error(
      'Gateway demo user user@demo.local not found. Run `pnpm seed` (gateway) first.',
    );
  }

  const templateSeeds = [
    { name: 'Classic', key: 'classic', isActive: true },
    { name: 'Modern', key: 'modern', isActive: true },
    { name: 'Compact', key: 'compact', isActive: true },
  ] as const;

  const templateByKey = {} as Record<'classic' | 'modern' | 'compact', Template>;
  for (const row of templateSeeds) {
    let template = await templates.findOne({ where: { key: row.key } });
    if (!template) {
      template = await templates.save(templates.create(row));
    }
    templateByKey[row.key] = template;
  }

  const classic = templateByKey.classic;
  const modern = templateByKey.modern;
  const compact = templateByKey.compact;

  const existingCount = await resumes.count({ withDeleted: true });
  if (existingCount === 0) {
    // Draft 1 — incomplete
    const draftA = await resumes.save(
      resumes.create({
        ownerId: candidateId,
        title: 'Product design draft',
        templateId: classic.id,
        fullName: 'Asha Sharma',
        email: '',
        phone: '+91 98765 43210',
        location: 'Bengaluru',
        summary: 'Product designer exploring fintech UX.',
        status: 'draft',
        slug: null,
      }),
    );
    const expA = await sections.save(
      sections.create({
        resumeId: draftA.id,
        type: 'experience',
        title: 'Experience',
        position: 0,
      }),
    );
    await items.save(
      items.create({
        sectionId: expA.id,
        heading: 'UX Designer',
        subheading: 'Fintech Co',
        startDate: '2022',
        endDate: 'Present',
        description: 'Designed onboarding flows for retail banking.',
        position: 0,
      }),
    );

    // Draft 2 — ready but unpublished
    const draftB = await resumes.save(
      resumes.create({
        ownerId: candidateId,
        title: 'Backend engineer draft',
        templateId: modern.id,
        fullName: 'Rohan Mehta',
        email: 'rohan@example.com',
        phone: '+91 90000 11111',
        location: 'Pune',
        summary: 'Backend engineer focused on APIs and data.',
        status: 'draft',
        slug: null,
      }),
    );
    const eduB = await sections.save(
      sections.create({
        resumeId: draftB.id,
        type: 'education',
        title: 'Education',
        position: 0,
      }),
    );
    await items.save(
      items.create({
        sectionId: eduB.id,
        heading: 'B.Tech Computer Science',
        subheading: 'IIT Example',
        startDate: '2016',
        endDate: '2020',
        description: 'Distributed systems elective.',
        position: 0,
      }),
    );

    // Published resume
    const published = await resumes.save(
      resumes.create({
        ownerId: candidateId,
        title: 'Full-stack portfolio',
        templateId: compact.id,
        fullName: 'Asha Sharma',
        email: 'asha.sharma@example.com',
        phone: '+91 98765 43210',
        location: 'Bengaluru, India',
        summary: 'Full-stack engineer building product-minded web apps with TypeScript.',
        status: 'published',
        slug: 'asha-sharma',
      }),
    );
    const expP = await sections.save(
      sections.create({
        resumeId: published.id,
        type: 'experience',
        title: 'Experience',
        position: 0,
      }),
    );
    await items.save([
      items.create({
        sectionId: expP.id,
        heading: 'Senior Engineer',
        subheading: 'Systango',
        startDate: '2021',
        endDate: 'Present',
        description: 'Led Nest + Next monorepo features and mentoring.',
        position: 0,
      }),
      items.create({
        sectionId: expP.id,
        heading: 'Software Engineer',
        subheading: 'Startup Labs',
        startDate: '2018',
        endDate: '2021',
        description: 'Shipped CRUD domains and shared UI kits.',
        position: 1,
      }),
    ]);
    const eduP = await sections.save(
      sections.create({
        resumeId: published.id,
        type: 'education',
        title: 'Education',
        position: 1,
      }),
    );
    await items.save(
      items.create({
        sectionId: eduP.id,
        heading: 'B.E. Information Technology',
        subheading: 'University of Example',
        startDate: '2014',
        endDate: '2018',
        description: '',
        position: 0,
      }),
    );
    const skillsP = await sections.save(
      sections.create({
        resumeId: published.id,
        type: 'skills',
        title: 'Skills',
        position: 2,
      }),
    );
    await items.save(
      items.create({
        sectionId: skillsP.id,
        heading: 'TypeScript, NestJS, Next.js, PostgreSQL',
        subheading: '',
        startDate: '',
        endDate: '',
        description: '',
        position: 0,
      }),
    );
  }

  console.log('Domain seed complete', {
    templates: Object.keys(templateByKey),
    candidateId,
  });

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
