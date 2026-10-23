import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger, OnModuleDestroy } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Server, Socket } from 'socket.io';
import { AUTH_COOKIE_NAME } from '@shared/env/constants';
import type { JwtUser, UserRole } from '../../common/auth';
import { ProjectsService } from '../projects/projects.service';
import { IssuesEvents, type IssueUpdatedEvent } from './issues-events';

type JwtPayload = { sub: string; email: string; role: string };

const ROLES: readonly UserRole[] = ['admin', 'user', 'staff'];

function parseCookieHeader(header: string | undefined): Record<string, string> {
  if (!header) return {};
  const out: Record<string, string> = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx <= 0) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    out[key] = decodeURIComponent(value);
  }
  return out;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/issues',
})
export class IssuesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleDestroy
{
  private readonly logger = new Logger(IssuesGateway.name);
  private unsubscribe?: () => void;

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly issuesEvents: IssuesEvents,
    private readonly jwtService: JwtService,
    private readonly projectsService: ProjectsService,
  ) {}

  afterInit() {
    this.unsubscribe = this.issuesEvents.onIssueUpdated((event: IssueUpdatedEvent) => {
      this.server.to(`project:${event.projectId}`).emit('issue.updated', event);
      this.logger.debug(`emit issue.updated ${event.issueId} (${event.type})`);
    });
  }

  async handleConnection(client: Socket) {
    try {
      const user = await this.authenticateSocket(client);
      client.data.user = user;
      this.logger.debug(`socket connected ${client.id} user=${user.id}`);
    } catch (err) {
      this.logger.warn(
        `rejecting socket ${client.id}: ${err instanceof Error ? err.message : 'auth failed'}`,
      );
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`socket disconnected ${client.id}`);
  }

  @SubscribeMessage('joinProject')
  async joinProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { projectId?: string },
  ) {
    const user = client.data.user as JwtUser | undefined;
    const projectId = body?.projectId;
    if (!user || !projectId) {
      return { ok: false, error: 'Unauthorized' };
    }
    try {
      await this.projectsService.assertCanView(user, projectId);
      await client.join(`project:${projectId}`);
      return { ok: true, projectId };
    } catch {
      return { ok: false, error: 'Forbidden' };
    }
  }

  onModuleDestroy() {
    this.unsubscribe?.();
  }

  private async authenticateSocket(client: Socket): Promise<JwtUser> {
    const authToken =
      typeof client.handshake.auth?.token === 'string'
        ? client.handshake.auth.token
        : undefined;
    const cookies = parseCookieHeader(client.handshake.headers.cookie);
    const cookieToken = cookies[AUTH_COOKIE_NAME];
    const token = authToken || cookieToken;
    if (!token) {
      throw new Error('Missing token');
    }

    const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    if (!payload.sub || !payload.email || !ROLES.includes(payload.role as UserRole)) {
      throw new Error('Invalid token claims');
    }
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role as UserRole,
    };
  }
}
