import dataSource from '../data-source';
import { Category } from '../../modules/categories/category.entity';
import { SlaPolicy, SlaPriority } from '../../modules/categories/sla-policy.entity';
import { Ticket, TicketStatus } from '../../modules/tickets/ticket.entity';
import { TicketEvent } from '../../modules/tickets/ticket-event.entity';
import { Message, MessageType } from '../../modules/tickets/message.entity';
import { Attachment } from '../../modules/tickets/attachment.entity';
import { Tag } from '../../modules/tickets/tag.entity';
import { TicketTag } from '../../modules/tickets/ticket-tag.entity';
import { OutboxEvent } from '../../modules/events/outbox-event.entity';
import { Notification } from '../../modules/notifications/notification.entity';

interface UserRecord {
  id: string;
  email: string;
  role: string;
}

async function seed() {
  console.log('🌱 Starting Support Desk Domain Seed...');
  await dataSource.initialize();

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 0. Query gateway user IDs or use default seeded gateway user IDs
    const usersResult: UserRecord[] = await queryRunner.query(
      `SELECT id, email, role FROM users`,
    );
    const adminUser = usersResult.find((u) => u.role === 'admin') || {
      id: '1ae0dd62-4880-46fa-80b2-2174987644ac',
    };
    const customerUser = usersResult.find((u) => u.role === 'user') || {
      id: '9c248501-c258-47fc-80dd-7bb6b5a1c97c',
    };
    const staffUser = usersResult.find((u) => u.role === 'staff') || {
      id: '31579f19-58e8-4a87-b6cb-715fc9fb616b',
    };

    console.log(
      `Using gateway users: Customer=${customerUser.id}, Staff=${staffUser.id}, Admin=${adminUser.id}`,
    );

    // Clean domain tables
    await queryRunner.query(
      `TRUNCATE TABLE outbox_events, notifications, ticket_tags, tags, attachments, messages, ticket_events, tickets, sla_policies, categories CASCADE;`,
    );

    // 1. Categories
    const categoryRepo = queryRunner.manager.getRepository(Category);
    const billingCat = await categoryRepo.save({
      name: 'Billing & Invoicing',
      slug: 'billing-invoicing',
      description:
        'Payment failures, invoices, refund requests, and subscription queries',
      isActive: true,
    });

    const techCat = await categoryRepo.save({
      name: 'Technical Support',
      slug: 'technical-support',
      description: 'System bugs, API integration failures, and service outages',
      isActive: true,
    });

    const accountCat = await categoryRepo.save({
      name: 'Account Access',
      slug: 'account-access',
      description: 'Password resets, 2FA recovery, and role permissions',
      isActive: true,
    });

    const featureCat = await categoryRepo.save({
      name: 'Feature Request',
      slug: 'feature-request',
      description: 'Product suggestions and enhancement requests',
      isActive: true,
    });

    console.log('✅ Categories seeded');

    // 2. SLA Policies
    const slaRepo = queryRunner.manager.getRepository(SlaPolicy);
    await slaRepo.save([
      {
        categoryId: billingCat.id,
        priority: SlaPriority.URGENT,
        firstResponseHours: 4,
        resolutionHours: 12,
      },
      {
        categoryId: billingCat.id,
        priority: SlaPriority.MEDIUM,
        firstResponseHours: 24,
        resolutionHours: 72,
      },
      {
        categoryId: techCat.id,
        priority: SlaPriority.URGENT,
        firstResponseHours: 2,
        resolutionHours: 8,
      },
      {
        categoryId: techCat.id,
        priority: SlaPriority.MEDIUM,
        firstResponseHours: 12,
        resolutionHours: 48,
      },
      {
        categoryId: accountCat.id,
        priority: SlaPriority.URGENT,
        firstResponseHours: 1,
        resolutionHours: 4,
      },
      {
        categoryId: accountCat.id,
        priority: SlaPriority.MEDIUM,
        firstResponseHours: 8,
        resolutionHours: 24,
      },
      {
        categoryId: featureCat.id,
        priority: SlaPriority.LOW,
        firstResponseHours: 72,
        resolutionHours: 240,
      },
      {
        categoryId: featureCat.id,
        priority: SlaPriority.MEDIUM,
        firstResponseHours: 48,
        resolutionHours: 120,
      },
    ]);

    console.log('✅ SLA Policies seeded');

    // 3. Tags
    const tagRepo = queryRunner.manager.getRepository(Tag);
    const urgentTag = await tagRepo.save({ name: 'Urgent', colorHex: '#EF4444' });
    const bugTag = await tagRepo.save({ name: 'Bug', colorHex: '#F59E0B' });
    const vipTag = await tagRepo.save({ name: 'VIP', colorHex: '#8B5CF6' });

    console.log('✅ Tags seeded');

    // 4. Tickets
    const ticketRepo = queryRunner.manager.getRepository(Ticket);
    const now = new Date();

    const t1 = await ticketRepo.save({
      subject: 'Payment failed for invoice #INV-9042',
      status: TicketStatus.OPEN,
      priority: SlaPriority.URGENT,
      categoryId: billingCat.id,
      userId: customerUser.id,
      assigneeId: null,
      version: 1,
      firstResponseDueAt: new Date(now.getTime() + 4 * 3600 * 1000),
      resolutionDueAt: new Date(now.getTime() + 12 * 3600 * 1000),
      metadata: { source: 'web_form', customerTier: 'enterprise' },
    });

    const t2 = await ticketRepo.save({
      subject: '500 Internal Server Error on API /v1/checkout',
      status: TicketStatus.PENDING,
      priority: SlaPriority.URGENT,
      categoryId: techCat.id,
      userId: customerUser.id,
      assigneeId: staffUser.id,
      version: 2,
      firstResponseDueAt: new Date(now.getTime() - 1 * 3600 * 1000),
      firstResponseAt: new Date(now.getTime() - 2 * 3600 * 1000),
      resolutionDueAt: new Date(now.getTime() + 6 * 3600 * 1000),
      metadata: { environment: 'production', affectedEndpoints: ['/v1/checkout'] },
    });

    const t3 = await ticketRepo.save({
      subject: 'Unable to reset 2FA security key',
      status: TicketStatus.OPEN,
      priority: SlaPriority.MEDIUM,
      categoryId: accountCat.id,
      userId: customerUser.id,
      assigneeId: staffUser.id,
      version: 1,
      firstResponseDueAt: new Date(now.getTime() + 8 * 3600 * 1000),
      resolutionDueAt: new Date(now.getTime() + 24 * 3600 * 1000),
      metadata: { device: 'iOS Safari' },
    });

    await ticketRepo.save([
      {
        subject: 'Requesting webhook support for subscription renewals',
        status: TicketStatus.RESOLVED,
        priority: SlaPriority.LOW,
        categoryId: featureCat.id,
        userId: customerUser.id,
        assigneeId: staffUser.id,
        version: 3,
        firstResponseDueAt: new Date(now.getTime() - 48 * 3600 * 1000),
        firstResponseAt: new Date(now.getTime() - 50 * 3600 * 1000),
        resolutionDueAt: new Date(now.getTime() - 10 * 3600 * 1000),
        resolvedAt: new Date(now.getTime() - 12 * 3600 * 1000),
        metadata: { trackingId: 'FEAT-8821' },
      },
      {
        subject: 'Duplicate billing charge on card ending in 4242',
        status: TicketStatus.CLOSED,
        priority: SlaPriority.MEDIUM,
        categoryId: billingCat.id,
        userId: customerUser.id,
        assigneeId: staffUser.id,
        version: 4,
        firstResponseDueAt: new Date(now.getTime() - 100 * 3600 * 1000),
        firstResponseAt: new Date(now.getTime() - 102 * 3600 * 1000),
        resolutionDueAt: new Date(now.getTime() - 48 * 3600 * 1000),
        resolvedAt: new Date(now.getTime() - 50 * 3600 * 1000),
        closedAt: new Date(now.getTime() - 24 * 3600 * 1000),
        metadata: { refundId: 're_3Mv9882' },
      },
    ]);

    console.log('✅ Tickets seeded');

    // 5. TicketTags
    const ticketTagRepo = queryRunner.manager.getRepository(TicketTag);
    await ticketTagRepo.save([
      { ticketId: t1.id, tagId: urgentTag.id },
      { ticketId: t1.id, tagId: vipTag.id },
      { ticketId: t2.id, tagId: bugTag.id },
      { ticketId: t2.id, tagId: urgentTag.id },
    ]);

    // 6. Messages
    const messageRepo = queryRunner.manager.getRepository(Message);
    const m1 = await messageRepo.save({
      ticketId: t1.id,
      userId: customerUser.id,
      messageType: MessageType.PUBLIC,
      body: 'Hi support team, my credit card payment failed for invoice #INV-9042. Can you please check why?',
    });

    const m2 = await messageRepo.save({
      ticketId: t2.id,
      userId: customerUser.id,
      messageType: MessageType.PUBLIC,
      body: 'We are receiving 500 status codes on checkout since 10:00 AM UTC.',
    });

    await messageRepo.save([
      {
        ticketId: t1.id,
        userId: staffUser.id,
        messageType: MessageType.PUBLIC,
        body: 'Thanks for reaching out! It looks like your payment method was declined. Please check your billing details.',
      },
      {
        ticketId: t1.id,
        userId: customerUser.id,
        messageType: MessageType.PUBLIC,
        body: 'I updated my payment method. Could you please retry processing the invoice?',
      },
      {
        ticketId: t2.id,
        userId: staffUser.id,
        messageType: MessageType.INTERNAL_NOTE,
        body: 'Investigating payment gateway timeout logs. Escalating to infrastructure team.',
      },
      {
        ticketId: t2.id,
        userId: staffUser.id,
        messageType: MessageType.PUBLIC,
        body: 'Hello, we have identified the issue with the payment gateway partner and are deploying a fix.',
      },
      {
        ticketId: t3.id,
        userId: customerUser.id,
        messageType: MessageType.PUBLIC,
        body: 'I lost access to my authenticator app and need help resetting 2FA.',
      },
      {
        ticketId: t3.id,
        userId: staffUser.id,
        messageType: MessageType.PUBLIC,
        body: 'Hello, for account security, please verify your identity by confirming your registration email.',
      },
      {
        ticketId: t3.id,
        userId: customerUser.id,
        messageType: MessageType.PUBLIC,
        body: 'Thanks, I have replied to the verification email with the required documents.',
      },
    ]);

    console.log('✅ Messages seeded');

    // 7. Attachments
    const attachmentRepo = queryRunner.manager.getRepository(Attachment);
    await attachmentRepo.save([
      {
        messageId: m1.id,
        url: 'https://storage.demo.local/invoices/inv-9042-receipt.pdf',
        filename: 'inv-9042-receipt.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 148200,
      },
      {
        messageId: m2.id,
        url: 'https://storage.demo.local/screenshots/error-500.png',
        filename: 'error-500.png',
        mimeType: 'image/png',
        sizeBytes: 420100,
      },
    ]);

    // 8. Ticket Events (Audit Ledger)
    const eventRepo = queryRunner.manager.getRepository(TicketEvent);
    await eventRepo.save([
      {
        ticketId: t1.id,
        actorId: customerUser.id,
        eventType: 'TICKET_CREATED',
        newValue: { status: 'open', priority: 'urgent' },
        reason: 'Initial ticket submission',
      },
      {
        ticketId: t2.id,
        actorId: customerUser.id,
        eventType: 'TICKET_CREATED',
        newValue: { status: 'open', priority: 'urgent' },
        reason: 'System alert submission',
      },
      {
        ticketId: t2.id,
        actorId: staffUser.id,
        eventType: 'ASSIGNED',
        oldValue: { assigneeId: null },
        newValue: { assigneeId: staffUser.id },
        reason: 'Assigned to tech duty agent',
      },
      {
        ticketId: t2.id,
        actorId: staffUser.id,
        eventType: 'STATUS_CHANGED',
        oldValue: { status: 'open' },
        newValue: { status: 'pending' },
        reason: 'Awaiting upstream vendor patch',
      },
    ]);

    console.log('✅ Ticket Audit Events seeded');

    // 9. Outbox Events
    const outboxRepo = queryRunner.manager.getRepository(OutboxEvent);
    await outboxRepo.save([
      {
        aggregateType: 'TICKET',
        aggregateId: t1.id,
        eventType: 'ticket.created',
        payload: { ticketId: t1.id, ticketNumber: 1, userId: customerUser.id },
      },
      {
        aggregateType: 'TICKET',
        aggregateId: t2.id,
        eventType: 'ticket.assigned',
        payload: { ticketId: t2.id, assigneeId: staffUser.id },
      },
    ]);

    console.log('✅ Outbox Events seeded');

    // 10. Notifications
    const notificationRepo = queryRunner.manager.getRepository(Notification);
    await notificationRepo.save([
      {
        userId: customerUser.id,
        ticketId: t2.id,
        type: 'TICKET_REPLIED',
        title: 'New Reply on 500 Internal Server Error',
        body: 'Hello, we have identified the issue with the payment gateway partner and are deploying a fix.',
        readAt: null,
      },
      {
        userId: staffUser.id,
        ticketId: t2.id,
        type: 'TICKET_ASSIGNED',
        title: 'Assigned to Ticket #500 Internal Server Error',
        body: 'You have been assigned to handle this urgent technical support request.',
        readAt: null,
      },
      {
        userId: customerUser.id,
        ticketId: t1.id,
        type: 'STATUS_CHANGE',
        title: 'Ticket Status Updated',
        body: 'Your ticket status has been updated to PENDING.',
        readAt: null,
      },
    ]);

    console.log('✅ Notifications seeded');

    await queryRunner.commitTransaction();
    console.log('🎉 Support Desk Domain Seed Completed Successfully!');
  } catch (err) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Seed Failed:', err);
    process.exit(1);
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

seed();
