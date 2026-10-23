'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, type Socket } from 'socket.io-client';
import { apiClient } from '@/lib/api';

type IssueUpdatedPayload = {
  issueId: string;
  projectId: string;
  type: string;
  status?: string;
};

/**
 * Live updates from the domain API Socket.io namespace `/issues`.
 * Requires a JWT (via `/auth/ws-ticket`) and `joinProject` for the active project.
 */
export function useIssueSocket(enabled = true, projectId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const url = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3002';
    let socket: Socket | null = null;
    let cancelled = false;

    async function connect() {
      try {
        const { data } = await apiClient.get<{ token: string }>('/auth/ws-ticket');
        if (cancelled || !data?.token) {
          return;
        }

        socket = io(`${url}/issues`, {
          transports: ['websocket', 'polling'],
          withCredentials: true,
          auth: { token: data.token },
        });

        const onUpdated = (payload: IssueUpdatedPayload) => {
          void queryClient.invalidateQueries({ queryKey: ['issues'] });
          void queryClient.invalidateQueries({ queryKey: ['issue', payload.issueId] });
          void queryClient.invalidateQueries({ queryKey: ['my-issues'] });
          void queryClient.invalidateQueries({
            queryKey: ['project-issues', payload.projectId],
          });
        };

        socket.on('issue.updated', onUpdated);
        socket.on('connect', () => {
          if (projectId) {
            socket?.emit('joinProject', { projectId });
          }
        });
      } catch {
        /* unauthenticated or gateway down — skip live updates */
      }
    }

    void connect();

    return () => {
      cancelled = true;
      socket?.disconnect();
      socket = null;
    };
  }, [enabled, projectId, queryClient]);
}
