import '../load-env';
import 'reflect-metadata';
import dataSource from './data-source';
import { Event, EventStatus } from '../modules/events/entities/event.entity';
import { Rsvp, RsvpStatus } from '../modules/rsvps/entities/rsvp.entity';
import { Ticket, TicketStatus } from '../modules/tickets/entities/ticket.entity';
import {
  WaitlistEntry,
  WaitlistStatus,
} from '../modules/waitlist/entities/waitlist-entry.entity';

async function seedDomain() {
  await dataSource.initialize();
  const eventRepo = dataSource.getRepository(Event);
  const rsvpRepo = dataSource.getRepository(Rsvp);
  const ticketRepo = dataSource.getRepository(Ticket);
  const waitlistRepo = dataSource.getRepository(WaitlistEntry);

  // Query gateway users from users table if accessible or use seeded UUIDs
  const adminUser = await dataSource.query(
    `SELECT id FROM users WHERE email = 'admin@demo.local'`,
  );
  const staffUser = await dataSource.query(
    `SELECT id FROM users WHERE email = 'staff@demo.local'`,
  );
  const demoUser = await dataSource.query(
    `SELECT id FROM users WHERE email = 'user@demo.local'`,
  );

  const adminId = adminUser[0]?.id || '10000000-0000-0000-0000-000000000001';
  const staffId = staffUser[0]?.id || '10000000-0000-0000-0000-000000000002';
  const userId = demoUser[0]?.id || '10000000-0000-0000-0000-000000000003';

  console.log('Seeding domain data with user IDs:', { adminId, staffId, userId });

  const eventsData = [
    {
      title: 'Global Tech & AI Summit 2026',
      description:
        'Explore the future of agentic AI systems, web development, and cloud-native architecture with industry leaders.',
      location: 'Convention Center Hall A, San Francisco / Hybrid',
      startDate: new Date(Date.now() + 86400000 * 3), // +3 days
      endDate: new Date(Date.now() + 86400000 * 3 + 14400000), // +4 hours
      capacity: 100,
      organizerId: staffId,
      status: EventStatus.PUBLISHED,
      category: 'Technology',
    },
    {
      title: 'Fullstack Monorepo Workshop',
      description:
        'Hands-on intensive masterclass on building enterprise NestJS microservices and Next.js design systems.',
      location: 'Innovation Hub Room 402',
      startDate: new Date(Date.now() + 86400000 * 7),
      endDate: new Date(Date.now() + 86400000 * 7 + 10800000),
      capacity: 2, // Low capacity to easily test capacity limit & waitlist!
      organizerId: staffId,
      status: EventStatus.PUBLISHED,
      category: 'Workshop',
    },
    {
      title: 'Design System & UI Component Masterclass',
      description:
        'Deep dive into accessible web components, Tailwind CSS theme tokens, glassmorphism, and dynamic animations.',
      location: 'Design Studio & Live Stream',
      startDate: new Date(Date.now() + 86400000 * 12),
      endDate: new Date(Date.now() + 86400000 * 12 + 7200000),
      capacity: 50,
      organizerId: adminId,
      status: EventStatus.PUBLISHED,
      category: 'Design',
    },
    {
      title: 'Cybersecurity & Zero Trust Architecture',
      description:
        'Keynote and panel discussion on JWT cookie security, API gateway design, and zero-trust backend infrastructure.',
      location: 'Grand Ballroom B',
      startDate: new Date(Date.now() + 86400000 * 15),
      endDate: new Date(Date.now() + 86400000 * 15 + 18000000),
      capacity: 200,
      organizerId: staffId,
      status: EventStatus.PUBLISHED,
      category: 'Security',
    },
    {
      title: 'Product Management & Agile Leadership',
      description:
        'Learn how modern engineering teams balance velocity, quality bars, and cross-functional collaboration.',
      location: 'Executive Conference Center',
      startDate: new Date(Date.now() + 86400000 * 20),
      endDate: new Date(Date.now() + 86400000 * 20 + 14400000),
      capacity: 75,
      organizerId: adminId,
      status: EventStatus.PUBLISHED,
      category: 'Business',
    },
  ];

  for (const eventDto of eventsData) {
    const existing = await eventRepo.findOne({ where: { title: eventDto.title } });
    if (!existing) {
      const savedEvent = await eventRepo.save(eventRepo.create(eventDto));
      console.log(`Created event: "${savedEvent.title}" (ID: ${savedEvent.id})`);

      // Seed RSVPs for Fullstack Monorepo Workshop to demonstrate capacity & waitlist!
      if (savedEvent.capacity === 2) {
        // RSVP 1: Staff User (YES) -> Ticket 1
        const rsvp1 = await rsvpRepo.save(
          rsvpRepo.create({
            eventId: savedEvent.id,
            userId: staffId,
            status: RsvpStatus.YES,
          }),
        );
        await ticketRepo.save(
          ticketRepo.create({
            rsvpId: rsvp1.id,
            eventId: savedEvent.id,
            userId: staffId,
            qrPayload: `TKT-${savedEvent.id.slice(0, 8)}-${staffId.slice(0, 8)}-1001`,
            status: TicketStatus.ISSUED,
          }),
        );

        // RSVP 2: Admin User (YES) -> Ticket 2
        const rsvp2 = await rsvpRepo.save(
          rsvpRepo.create({
            eventId: savedEvent.id,
            userId: adminId,
            status: RsvpStatus.YES,
          }),
        );
        await ticketRepo.save(
          ticketRepo.create({
            rsvpId: rsvp2.id,
            eventId: savedEvent.id,
            userId: adminId,
            qrPayload: `TKT-${savedEvent.id.slice(0, 8)}-${adminId.slice(0, 8)}-1002`,
            status: TicketStatus.ISSUED,
          }),
        );

        // Waitlist Entry 1: Demo User (WAITING at position 1 because capacity=2 is reached!)
        await waitlistRepo.save(
          waitlistRepo.create({
            eventId: savedEvent.id,
            userId: userId,
            position: 1,
            status: WaitlistStatus.WAITING,
          }),
        );
      } else {
        // Seed standard RSVP for demo user
        const rsvp = await rsvpRepo.save(
          rsvpRepo.create({
            eventId: savedEvent.id,
            userId: userId,
            status: RsvpStatus.YES,
          }),
        );
        await ticketRepo.save(
          ticketRepo.create({
            rsvpId: rsvp.id,
            eventId: savedEvent.id,
            userId: userId,
            qrPayload: `TKT-${savedEvent.id.slice(0, 8)}-${userId.slice(0, 8)}-${Date.now()}`,
            status: TicketStatus.ISSUED,
          }),
        );
      }
    }
  }

  console.log('Domain seed complete!');
  await dataSource.destroy();
}

seedDomain().catch((err) => {
  console.error(err);
  process.exit(1);
});
