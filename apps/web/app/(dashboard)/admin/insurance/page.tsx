'use client';

import React, { useState, useEffect } from 'react';
import { RoleRoute } from '@/components/auth';
import {
  Page,
  PageHeader,
  Button,
  Badge,
  Card,
  CardBody,
  Spinner,
} from '@shared/ui/components';
import {
  ShieldCheck,
  IndianRupee,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
} from 'lucide-react';

interface Claim {
  id: string;
  providerName: string;
  policyNumber: string;
  claimAmount: number;
  coveredAmount: number;
  copayAmount: number;
  status: string;
  createdAt: string;
  appointment?: {
    reason?: string;
  };
  patient?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export default function AdminInsurancePage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchClaims = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/insurance-claims');
      if (res.ok) {
        const json = await res.json();
        setClaims(json.data || json);
      }
    } catch {
      // ignore error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/insurance-claims/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchClaims();
      }
    } catch {
      // ignore
    }
  };

  const filteredClaims = claims.filter(
    (c) => statusFilter === 'ALL' || c.status === statusFilter,
  );

  const getBadgeTone = (status: string): 'success' | 'danger' | 'accent' => {
    if (status === 'APPROVED') return 'success';
    if (status === 'REJECTED') return 'danger';
    return 'accent';
  };

  const renderStatusBadge = (status: string) => {
    if (status === 'APPROVED') {
      return (
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Approved
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <span className="flex items-center gap-1">
          <XCircle className="w-3 h-3" /> Rejected
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1">
        <Clock className="w-3 h-3" /> Submitted
      </span>
    );
  };

  const renderClaimsContent = () => {
    if (isLoading) {
      return (
        <div className="py-16 flex flex-col items-center justify-center gap-2">
          <Spinner size="md" className="text-primary" />
          <p className="text-xs text-muted-foreground">Loading insurance claims...</p>
        </div>
      );
    }

    if (filteredClaims.length === 0) {
      return (
        <div className="py-16 text-center bg-card border border-dashed border-border rounded-xl space-y-2">
          <ShieldCheck className="w-10 h-10 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-semibold text-foreground">
            No Insurance Claims Found
          </h3>
          <p className="text-xs text-muted-foreground">
            No patient insurance claims have been submitted yet matching your criteria.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredClaims.map((claim) => (
          <Card key={claim.id} className="border border-border bg-card p-4 space-y-3">
            <CardBody className="p-0 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    {claim.providerName}
                  </h4>
                  <p className="text-xs text-muted-foreground font-mono">
                    Policy: {claim.policyNumber}
                  </p>
                </div>
                <Badge tone={getBadgeTone(claim.status)} className="text-[10px]">
                  {renderStatusBadge(claim.status)}
                </Badge>
              </div>

              <div className="bg-muted/30 p-3 rounded-lg border border-border/50 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Claimed Amount:</span>
                  <span className="font-semibold text-foreground flex items-center">
                    <IndianRupee className="w-3 h-3" /> {claim.claimAmount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Covered (80%):</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
                    <IndianRupee className="w-3 h-3" /> {claim.coveredAmount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patient Co-pay:</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center">
                    <IndianRupee className="w-3 h-3" /> {claim.copayAmount}
                  </span>
                </div>
              </div>

              {claim.status === 'SUBMITTED' && (
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus(claim.id, 'REJECTED')}
                    className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                  >
                    Reject Claim
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleUpdateStatus(claim.id, 'APPROVED')}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Approve Claim
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <RoleRoute roles={['ADMIN', 'admin']}>
      <Page>
        <PageHeader
          title="Insurance Claim Processing & Coverage Governance"
          description="Review patient consultation claims, verify provider coverage, and process reimbursement approvals."
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchClaims}
              className="text-xs h-8 gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
          }
        />

        {/* Filter bar */}
        <div className="mt-6 bg-card p-4 rounded-xl border border-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            Total Claims: {filteredClaims.length}
          </span>
        </div>

        {/* Content */}
        <div className="mt-6">{renderClaimsContent()}</div>
      </Page>
    </RoleRoute>
  );
}
