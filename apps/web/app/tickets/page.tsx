'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShellHeader } from '@/components/auth';
import {
  Alert,
  Button,
  EmptyState,
  LoadingState,
  PageHeader,
} from '@shared/ui/components';
import { RotateCw } from 'lucide-react';
import { TicketCard } from '@/components/TicketCard';
import { WaitlistCard } from '@/components/WaitlistCard';
import { useMyTickets, useMyWaitlist } from '@/hooks/useTickets';
import { useAuth } from '@/components/auth/auth-provider';

export default function TicketsPage() {
  const { user, loading: isAuthLoading } = useAuth();
  const {
    data: tickets,
    isLoading: isTicketsLoading,
    isError: isTicketsError,
    refetch: refetchTickets,
    isFetching: isTicketsFetching,
  } = useMyTickets();

  const {
    data: waitlists,
    isLoading: isWaitlistLoading,
    isError: isWaitlistError,
    refetch: refetchWaitlist,
    isFetching: isWaitlistFetching,
  } = useMyWaitlist();

  const [filter, setFilter] = useState<'ALL' | 'ISSUED' | 'WAITLIST' | 'USED' | 'CANCELLED'>('ALL');

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <ShellHeader />
        <main className="mx-auto max-w-4xl px-4 py-12">
          <LoadingState label="Authenticating session..." />
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <ShellHeader />
        <main className="mx-auto max-w-4xl px-4 py-12 text-center space-y-4">
          <Alert tone="info" title="Login Required">
            Please <Link href="/login" className="font-bold underline">log in</Link> to access your ticket wallet.
          </Alert>
        </main>
      </div>
    );
  }

  const handleSyncAll = () => {
    refetchTickets();
    refetchWaitlist();
  };

  const handleTabChange = (status: 'ALL' | 'ISSUED' | 'WAITLIST' | 'USED' | 'CANCELLED') => {
    setFilter(status);
  };

  const ticketList = tickets || [];
  const waitlistList = waitlists || [];

  const issuedCount = ticketList.filter((t) => t.status === 'ISSUED').length;
  const usedCount = ticketList.filter((t) => t.status === 'USED').length;
  const cancelledCount = ticketList.filter((t) => t.status === 'CANCELLED').length;
  const waitlistCount = waitlistList.length;
  const totalPasses = ticketList.length + waitlistList.length;

  const showWaitlists = filter === 'ALL' || filter === 'WAITLIST';
  const showTickets = filter !== 'WAITLIST';

  const filteredTickets = ticketList.filter((t) => {
    if (filter === 'ALL') return true;
    return t.status === filter;
  });

  const isLoading = isTicketsLoading || isWaitlistLoading;
  const isError = isTicketsError || isWaitlistError;
  const isSyncing = (isTicketsFetching && !isTicketsLoading) || (isWaitlistFetching && !isWaitlistLoading);
  const isEmpty = (showTickets ? filteredTickets.length : 0) + (showWaitlists ? waitlistList.length : 0) === 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ShellHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <PageHeader
            title="My Ticket & Waitlist Wallet"
            description="Access your admission passes, check-in QR codes, waitlist queue status, and event history"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSyncAll}
            loading={isSyncing}
            loadingText="Syncing..."
            className="self-start sm:self-auto text-xs"
          >
            <RotateCw className="mr-1.5 h-3.5 w-3.5" />
            <span>Sync Passes</span>
          </Button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 border-b border-border/60 pb-3 text-xs flex-wrap">
          <span className="font-semibold text-muted-foreground">Filter Pass Type:</span>

          <button
            type="button"
            onClick={() => handleTabChange('ALL')}
            className={`rounded-full px-3 py-1 font-medium transition-all ${
              filter === 'ALL'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            All Passes ({totalPasses})
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('ISSUED')}
            className={`rounded-full px-3 py-1 font-medium transition-all ${
              filter === 'ISSUED'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
            }`}
          >
            Confirmed ({issuedCount})
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('WAITLIST')}
            className={`rounded-full px-3 py-1 font-medium transition-all ${
              filter === 'WAITLIST'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
            }`}
          >
            Waitlist Queue ({waitlistCount})
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('USED')}
            className={`rounded-full px-3 py-1 font-medium transition-all ${
              filter === 'USED'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            Checked-In ({usedCount})
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('CANCELLED')}
            className={`rounded-full px-3 py-1 font-medium transition-all ${
              filter === 'CANCELLED'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20'
            }`}
          >
            Cancelled ({cancelledCount})
          </button>

          {isSyncing && (
            <span className="ml-auto text-[11px] font-mono text-muted-foreground animate-pulse">
              Syncing live status...
            </span>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingState label="Fetching your ticket wallet & waitlists..." />
        ) : isError ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-center text-xs text-rose-600 flex flex-col items-center gap-3">
            <span>Failed to load wallet items. Please try again.</span>
            <Button variant="secondary" size="sm" onClick={handleSyncAll}>
              Retry
            </Button>
          </div>
        ) : isEmpty ? (
          <EmptyState
            title="No passes found"
            description="You haven't registered or joined any event waitlists under this filter."
            action={
              <Link href="/events">
                <Button variant="primary" size="sm" className="font-semibold">
                  Browse Events
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Show Waitlist Cards first if applicable */}
            {showWaitlists &&
              waitlistList.map((entry) => (
                <WaitlistCard key={`waitlist-${entry.id}`} entry={entry} />
              ))}

            {/* Show Ticket Cards */}
            {showTickets &&
              filteredTickets.map((ticket) => (
                <TicketCard key={`ticket-${ticket.id}`} ticket={ticket} />
              ))}
          </div>
        )}
      </main>
    </div>
  );
}
