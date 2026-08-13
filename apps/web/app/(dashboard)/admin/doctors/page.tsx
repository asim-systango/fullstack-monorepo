'use client';

import React, { useState } from 'react';
import { RoleRoute } from '@/components/auth';
import { useDoctors, useUpdateDoctor } from '@/features/doctor/hooks';
import type { DoctorProfile, DoctorDocument } from '@/features/doctor/types';
import {
  Page,
  PageHeader,
  Button,
  Badge,
  Card,
  CardBody,
  Modal,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  Field,
  TextInput,
  Pagination,
} from '@shared/ui/components';
import { viewDocument, downloadDocument } from '@/lib/document-utils';
import { apiClient } from '@/lib/api';
import {
  Search,
  Filter,
  Edit,
  RefreshCw,
  Award,
  Stethoscope,
  Clock,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Loader2,
  Check,
  X,
  LayoutGrid,
  List,
  AlertCircle,
  Power,
  FileText,
  Eye,
  Download,
} from 'lucide-react';

function parseDocItem(docItem: unknown, idx: number) {
  if (!docItem) return null;
  if (Array.isArray(docItem) && docItem.length === 0) return null;

  let item: Record<string, unknown> = {};
  let rawStringUrl = '';

  if (typeof docItem === 'string') {
    const trimmed = docItem.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed) as Record<string, unknown>;
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          item = parsed;
        } else {
          rawStringUrl = trimmed;
        }
      } catch {
        rawStringUrl = trimmed;
      }
    } else {
      rawStringUrl = trimmed;
    }
  } else if (docItem && typeof docItem === 'object' && !Array.isArray(docItem)) {
    item = docItem as Record<string, unknown>;
  } else {
    return null;
  }

  let docUrl =
    (typeof item.url === 'string' && item.url) ||
    (typeof item.objectPath === 'string' && item.objectPath) ||
    (typeof item.fileUrl === 'string' && item.fileUrl) ||
    (typeof item.path === 'string' && item.path) ||
    (typeof item.link === 'string' && item.link) ||
    (typeof item.documentUrl === 'string' && item.documentUrl) ||
    (typeof item.uri === 'string' && item.uri) ||
    (typeof item.src === 'string' && item.src) ||
    (typeof item.href === 'string' && item.href) ||
    (typeof item.location === 'string' && item.location) ||
    rawStringUrl ||
    '';

  if (!docUrl && item) {
    for (const v of Object.values(item)) {
      if (typeof v === 'string') {
        const str = v.trim();
        if (
          str.startsWith('http://') ||
          str.startsWith('https://') ||
          str.startsWith('/objects/') ||
          str.startsWith('objects/') ||
          str.startsWith('/uploads/') ||
          str.startsWith('uploads/') ||
          str.includes('cloudinary.com') ||
          /\.(pdf|png|jpg|jpeg|webp|doc|docx)$/i.test(str)
        ) {
          docUrl = str;
          break;
        }
      }
    }
  }

  const hasName = Boolean(item.name || item.fileName || item.title || item.documentName);
  const hasType = Boolean(item.type || item.category || item.documentType);
  if (!docUrl && !hasName && !hasType && !rawStringUrl) {
    return null;
  }

  if (docUrl && (docUrl.startsWith('objects/') || docUrl.startsWith('uploads/'))) {
    docUrl = `/${docUrl}`;
  }

  const docName =
    (typeof item.name === 'string' && item.name) ||
    (typeof item.fileName === 'string' && item.fileName) ||
    (typeof item.title === 'string' && item.title) ||
    (typeof item.documentName === 'string' && item.documentName) ||
    (docUrl ? docUrl.split('/').pop()?.split('?')[0] : '') ||
    `Document #${idx + 1}`;

  const docType =
    (typeof item.type === 'string' && item.type) ||
    (typeof item.category === 'string' && item.category) ||
    (typeof item.documentType === 'string' && item.documentType) ||
    'Medical Credential';

  const docDate =
    (typeof item.uploadedAt === 'string' && item.uploadedAt) ||
    (typeof item.createdAt === 'string' && item.createdAt) ||
    (typeof item.date === 'string' && item.date) ||
    'Recently';

  const docStatus = (typeof item.status === 'string' && item.status) || 'PENDING';

  const docId =
    (typeof item.id === 'string' && item.id) ||
    (typeof item.key === 'string' && item.key) ||
    `doc-${idx}`;

  return { docUrl, docName, docType, docDate, docStatus, docId };
}

function getDoctorDocuments(doc: DoctorProfile | null): DoctorDocument[] {
  if (!doc) return [];

  const flattenDocs = (docsInput: unknown): unknown[] => {
    if (typeof docsInput === 'string') {
      try {
        const parsed = JSON.parse(docsInput);
        return flattenDocs(parsed);
      } catch {
        return [docsInput];
      }
    }
    if (!Array.isArray(docsInput)) return [];
    const acc: unknown[] = [];
    for (const d of docsInput) {
      if (Array.isArray(d)) {
        acc.push(...flattenDocs(d));
      } else if (d) {
        acc.push(d);
      }
    }
    return acc;
  };

  const rawDocs = flattenDocs(doc.documents);
  const parsedDocs: DoctorDocument[] = [];

  rawDocs.forEach((item, idx) => {
    const p = parseDocItem(item, idx);
    if (p) {
      parsedDocs.push({
        id: p.docId,
        name: p.docName,
        type: p.docType,
        url: p.docUrl,
        status: (p.docStatus === 'VERIFIED' || p.docStatus === 'REJECTED'
          ? p.docStatus
          : 'PENDING') as 'PENDING' | 'VERIFIED' | 'REJECTED',
        uploadedAt: p.docDate,
      });
    }
  });

  if (doc.medicalLicense) {
    const hasLicenseDoc = parsedDocs.some(
      (d) => d.name.includes(doc.medicalLicense!) || d.url.includes(doc.medicalLicense!),
    );
    if (!hasLicenseDoc) {
      parsedDocs.unshift({
        id: `med-license-${doc.id}`,
        name: `Medical License (${doc.medicalLicense})`,
        type: 'Medical Council License',
        url: doc.medicalLicense,
        status: doc.approvalStatus === 'APPROVED' ? 'VERIFIED' : 'PENDING',
        uploadedAt: 'On Registration',
      });
    }
  }

  return parsedDocs;
}

const getAdminDocBadgeTone = (status: string): 'success' | 'danger' | 'warning' => {
  if (status === 'VERIFIED') return 'success';
  if (status === 'REJECTED') return 'danger';
  return 'warning';
};

export default function AdminDoctorsPage() {
  const [search, setSearch] = useState('');
  const [approvalFilter, setApprovalFilter] = useState<
    'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  >('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [specFilter, setSpecFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [currentPage, setCurrentPage] = useState(1);

  // Edit Doctor Modal state
  const [editingDoctor, setEditingDoctor] = useState<DoctorProfile | null>(null);
  const [editForm, setEditForm] = useState({
    specialization: '',
    qualification: '',
    experienceYears: 0,
    consultationFee: 0,
    hospitalCharge: 10,
    biography: '',
  });

  // Action Confirmation state (Approve, Reject, Deactivate)
  const [actionConfirm, setActionConfirm] = useState<{
    doc: DoctorProfile;
    type: 'APPROVE' | 'REJECT' | 'DEACTIVATE' | 'ACTIVATE';
  } | null>(null);

  // View & Verify Doctor Documents Modal state
  const [viewingDocsDoctor, setViewingDocsDoctor] = useState<DoctorProfile | null>(null);

  const { data: doctors = [], isLoading, isError, refetch } = useDoctors();
  const updateMutation = useUpdateDoctor();

  const handleEditClick = (doc: DoctorProfile) => {
    setEditingDoctor(doc);
    setEditForm({
      specialization: doc.specialization || '',
      qualification: doc.qualification || '',
      experienceYears: doc.experienceYears || 0,
      consultationFee: doc.consultationFee || 0,
      hospitalCharge: doc.hospitalCharge ?? 10,
      biography: doc.biography || '',
    });
  };

  const handleSaveEdit = () => {
    if (!editingDoctor) return;
    updateMutation.mutate(
      {
        id: editingDoctor.id,
        payload: {
          specialization: editForm.specialization,
          qualification: editForm.qualification,
          experienceYears: Number(editForm.experienceYears),
          consultationFee: Number(editForm.consultationFee),
          hospitalCharge: Number(editForm.hospitalCharge),
          biography: editForm.biography,
        },
      },
      {
        onSuccess: () => {
          setEditingDoctor(null);
        },
      },
    );
  };

  const handleExecuteAction = () => {
    if (!actionConfirm) return;
    const { doc, type } = actionConfirm;

    let payload: Partial<DoctorProfile> = {};
    if (type === 'APPROVE') {
      payload = { approvalStatus: 'APPROVED', isActive: true };
    } else if (type === 'REJECT') {
      payload = { approvalStatus: 'REJECTED', isActive: false };
    } else if (type === 'DEACTIVATE') {
      payload = { isActive: false };
    } else if (type === 'ACTIVATE') {
      payload = { isActive: true };
    }

    updateMutation.mutate(
      { id: doc.id, payload },
      {
        onSuccess: () => setActionConfirm(null),
      },
    );
  };

  const handleUpdateDocumentStatus = (
    docId: string,
    newStatus: 'VERIFIED' | 'REJECTED',
  ) => {
    if (!viewingDocsDoctor) return;
    const effectiveDocs = getDoctorDocuments(viewingDocsDoctor);
    const updatedDocs: DoctorDocument[] = effectiveDocs.map((d) =>
      d.id === docId ? { ...d, status: newStatus } : d,
    );

    updateMutation.mutate(
      { id: viewingDocsDoctor.id, payload: { documents: updatedDocs } },
      {
        onSuccess: () => {
          setViewingDocsDoctor({
            ...viewingDocsDoctor,
            documents: updatedDocs,
          });
        },
      },
    );
  };

  const handleVerifyAllDocuments = () => {
    if (!viewingDocsDoctor) return;
    const effectiveDocs = getDoctorDocuments(viewingDocsDoctor);
    const updatedDocs: DoctorDocument[] = effectiveDocs.map((d) => ({
      ...d,
      status: 'VERIFIED',
    }));

    updateMutation.mutate(
      { id: viewingDocsDoctor.id, payload: { documents: updatedDocs } },
      {
        onSuccess: () => {
          setViewingDocsDoctor({
            ...viewingDocsDoctor,
            documents: updatedDocs,
          });
        },
      },
    );
  };

  // Filtered doctors logic
  const specializations = Array.from(
    new Set(doctors.map((d) => d.specialization).filter(Boolean)),
  );

  const filteredDoctors = doctors.filter((doc) => {
    const appStatus = doc.approvalStatus || 'APPROVED';
    if (approvalFilter !== 'ALL' && appStatus !== approvalFilter) return false;
    if (statusFilter === 'ACTIVE' && !doc.isActive) return false;
    if (statusFilter === 'INACTIVE' && doc.isActive) return false;
    if (specFilter !== 'ALL' && doc.specialization !== specFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const nameMatch = `${doc.firstName} ${doc.lastName}`.toLowerCase().includes(q);
      const specMatch = doc.specialization.toLowerCase().includes(q);
      const qualMatch = doc.qualification.toLowerCase().includes(q);
      if (!nameMatch && !specMatch && !qualMatch) return false;
    }
    return true;
  });

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredDoctors.length / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedDocs = filteredDoctors.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const getApprovalBadge = (doc: DoctorProfile) => {
    const status = doc.approvalStatus || 'APPROVED';
    if (status === 'PENDING') {
      return (
        <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-semibold flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Pending Approval
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <span className="px-2 py-0.5 rounded-full bg-destructive/15 text-destructive border border-destructive/20 text-[10px] font-semibold flex items-center gap-1">
          <XCircle className="w-3 h-3" /> Rejected
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3" /> Approved
      </span>
    );
  };

  const handleOpenDocsModal = async (doc: DoctorProfile) => {
    setViewingDocsDoctor(doc);
    try {
      const res = await apiClient.get(`/doctors/${doc.id}`);
      const freshDoc = res.data?.data || res.data;
      if (freshDoc && freshDoc.id) {
        setViewingDocsDoctor(freshDoc);
      }
    } catch (err) {
      console.error('Failed to fetch fresh doctor documents:', err);
    }
  };

  const renderActionButtons = (doc: DoctorProfile) => {
    const appStatus = doc.approvalStatus || 'APPROVED';
    const isDocUpdating =
      updateMutation.isPending && updateMutation.variables?.id === doc.id;
    const docCount = getDoctorDocuments(doc).length;

    return (
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => void handleOpenDocsModal(doc)}
          className="text-xs h-7 px-2 gap-1 text-muted-foreground hover:text-foreground"
          title="View Doctor Credentials & Verification Documents"
        >
          <FileText className="w-3.5 h-3.5 text-primary" /> Docs ({docCount})
        </Button>

        {appStatus === 'PENDING' && (
          <>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setActionConfirm({ doc, type: 'APPROVE' })}
              loading={
                isDocUpdating &&
                updateMutation.variables?.payload?.approvalStatus === 'APPROVED'
              }
              className="text-xs h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
            >
              <Check className="w-3.5 h-3.5" /> Approve
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setActionConfirm({ doc, type: 'REJECT' })}
              loading={
                isDocUpdating &&
                updateMutation.variables?.payload?.approvalStatus === 'REJECTED'
              }
              className="text-xs h-7 px-2.5 gap-1"
            >
              <X className="w-3.5 h-3.5" /> Reject
            </Button>
          </>
        )}

        {appStatus === 'REJECTED' && (
          <Badge tone="danger" className="text-[10px]">
            Rejected
          </Badge>
        )}

        {appStatus === 'APPROVED' && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditClick(doc)}
              className="text-xs h-7 px-2 gap-1"
            >
              <Edit className="w-3 h-3" /> Edit
            </Button>
            {doc.isActive ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActionConfirm({ doc, type: 'DEACTIVATE' })}
                loading={
                  isDocUpdating && updateMutation.variables?.payload?.isActive === false
                }
                className="text-xs h-7 px-2 text-destructive hover:bg-destructive/10 border-destructive/30 gap-1"
              >
                <Power className="w-3 h-3" /> Deactivate
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActionConfirm({ doc, type: 'ACTIVATE' })}
                loading={
                  isDocUpdating && updateMutation.variables?.payload?.isActive === true
                }
                className="text-xs h-7 px-2 gap-1"
              >
                <Power className="w-3 h-3" /> Activate
              </Button>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <RoleRoute roles={['ADMIN', 'admin']}>
      <Page>
        <PageHeader
          title="Doctor & Practitioner Management"
          description="Review doctor registrations, manage approval status, toggle active profiles, and update consultation credentials."
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void refetch()}
              className="text-xs h-8 gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
            </Button>
          }
        />

        {/* Filter & View Mode Controls Bar */}
        <div className="mt-6 bg-card p-4 rounded-xl border border-border/80 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by doctor name, specialization, or qualification..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="font-semibold text-foreground">Approval Status:</span>
                <select
                  value={approvalFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setApprovalFilter(
                      e.target.value as 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED',
                    );
                    setCurrentPage(1);
                  }}
                  className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="ALL">All Approvals</option>
                  <option value="PENDING">Pending Approval</option>
                  <option value="APPROVED">Approved Only</option>
                  <option value="REJECTED">Rejected Only</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-foreground">Active Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE');
                    setCurrentPage(1);
                  }}
                  className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active Profiles</option>
                  <option value="INACTIVE">Deactivated Profiles</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-foreground">Specialization:</span>
                <select
                  value={specFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setSpecFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="ALL">All Specializations</option>
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/50">
                <Button
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="h-7 px-2 text-xs gap-1"
                  title="Table View"
                >
                  <List className="w-3.5 h-3.5" /> Table
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-7 px-2 text-xs gap-1"
                  title="Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" /> Grid
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="mt-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 space-y-2">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground">Loading doctor profiles...</p>
            </div>
          )}

          {isError && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-center text-xs space-y-2">
              <p>Failed to load doctors. Please try again.</p>
              <Button variant="outline" size="sm" onClick={() => void refetch()}>
                Retry
              </Button>
            </div>
          )}

          {!isLoading && !isError && filteredDoctors.length === 0 && (
            <div className="text-center py-16 bg-muted/20 border border-dashed border-border rounded-xl space-y-2">
              <Stethoscope className="w-10 h-10 text-muted-foreground mx-auto" />
              <h3 className="text-sm font-semibold text-foreground">
                No doctor profiles found
              </h3>
              <p className="text-xs text-muted-foreground">
                No doctor records match the selected approval or status filters.
              </p>
            </div>
          )}

          {!isLoading && !isError && filteredDoctors.length > 0 && (
            <div className="space-y-6">
              {viewMode === 'table' ? (
                <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                          <th className="py-3 px-4">Doctor Name</th>
                          <th className="py-3 px-4">Specialization</th>
                          <th className="py-3 px-4">Qualifications</th>
                          <th className="py-3 px-4">Experience</th>
                          <th className="py-3 px-4">Doctor Fee</th>
                          <th className="py-3 px-4">Hospital Fee</th>
                          <th className="py-3 px-4">Approval Status</th>
                          <th className="py-3 px-4">Active State</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {paginatedDocs.map((doc) => (
                          <tr
                            key={doc.id}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 border border-primary/20">
                                  {doc.firstName[0]}
                                  {doc.lastName[0]}
                                </div>
                                <div>
                                  <div className="font-semibold text-foreground">
                                    Dr. {doc.firstName} {doc.lastName}
                                  </div>
                                  <div className="text-[10px] text-muted-foreground">
                                    ID: {doc.id.slice(0, 8)}...
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded bg-primary/15 text-primary text-[11px] font-medium">
                                {doc.specialization}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground font-medium">
                              {doc.qualification}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {doc.experienceYears} Years
                            </td>
                            <td className="py-3 px-4 font-semibold text-foreground">
                              ₹{doc.consultationFee}
                            </td>
                            <td className="py-3 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                              ₹{doc.hospitalCharge ?? 10}
                            </td>
                            <td className="py-3 px-4">{getApprovalBadge(doc)}</td>
                            <td className="py-3 px-4">
                              <Badge
                                tone={doc.isActive ? 'success' : 'neutral'}
                                className="text-[10px]"
                              >
                                {doc.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              {renderActionButtons(doc)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {paginatedDocs.map((doc) => (
                    <Card
                      key={doc.id}
                      className={`transition-all duration-200 ${
                        !doc.isActive
                          ? 'opacity-70 bg-muted/20 border-dashed'
                          : 'hover:border-primary/40'
                      }`}
                    >
                      <CardBody className="p-5 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-base font-bold shrink-0 border border-primary/20">
                              {doc.firstName[0]}
                              {doc.lastName[0]}
                            </div>
                            <div>
                              <h3 className="font-semibold text-sm text-foreground">
                                Dr. {doc.firstName} {doc.lastName}
                              </h3>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="px-2 py-0.5 rounded bg-primary/15 text-primary text-[10px] font-semibold">
                                  {doc.specialization}
                                </span>
                              </div>
                            </div>
                          </div>

                          {getApprovalBadge(doc)}
                        </div>

                        <div className="bg-muted/30 p-3 rounded-lg border border-border/40 space-y-2 text-xs">
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Award className="w-3.5 h-3.5 text-primary" />{' '}
                              Qualification:
                            </span>
                            <span className="font-medium text-foreground">
                              {doc.qualification}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-emerald-500" />{' '}
                              Experience:
                            </span>
                            <span className="font-medium text-foreground">
                              {doc.experienceYears} Years
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <IndianRupee className="w-3.5 h-3.5 text-blue-500" />{' '}
                              Consultation Fee:
                            </span>
                            <span className="font-semibold text-foreground">
                              ₹{doc.consultationFee}
                            </span>
                          </div>
                        </div>

                        {doc.biography && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2 italic">
                            &quot;{doc.biography}&quot;
                          </p>
                        )}

                        <div className="pt-2 flex items-center justify-end border-t border-border/40">
                          {renderActionButtons(doc)}
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}

              <Pagination
                currentPage={safePage}
                totalItems={filteredDoctors.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>

        {/* Action Confirmation Modal */}
        <Modal
          open={Boolean(actionConfirm)}
          onOpenChange={(open) => !open && setActionConfirm(null)}
        >
          <DialogHeader>
            <DialogTitle>
              Confirm Doctor Action - Dr. {actionConfirm?.doc.firstName}{' '}
              {actionConfirm?.doc.lastName}
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-3 text-xs text-muted-foreground">
            {actionConfirm?.type === 'APPROVE' && (
              <p>
                Are you sure you want to <strong>APPROVE</strong> this doctor? Approved
                doctors will be activated and displayed in the patient public directory.
              </p>
            )}
            {actionConfirm?.type === 'REJECT' && (
              <p>
                Are you sure you want to <strong>REJECT</strong> this doctor registration?
                The profile will be marked as REJECTED and hidden from patients.
              </p>
            )}
            {actionConfirm?.type === 'DEACTIVATE' && (
              <p>
                Are you sure you want to <strong>DEACTIVATE</strong> Dr.{' '}
                {actionConfirm.doc.firstName} {actionConfirm.doc.lastName}? Future
                available slots will be unpublished.
              </p>
            )}
            {actionConfirm?.type === 'ACTIVATE' && (
              <p>
                Are you sure you want to <strong>REACTIVATE</strong> Dr.{' '}
                {actionConfirm.doc.firstName} {actionConfirm.doc.lastName}?
              </p>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setActionConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant={
                actionConfirm?.type === 'REJECT' || actionConfirm?.type === 'DEACTIVATE'
                  ? 'danger'
                  : 'primary'
              }
              size="sm"
              onClick={handleExecuteAction}
              loading={updateMutation.isPending}
            >
              Confirm Action
            </Button>
          </DialogFooter>
        </Modal>

        {/* Edit Doctor Details Modal */}
        <Modal
          open={Boolean(editingDoctor)}
          onOpenChange={(open) => !open && setEditingDoctor(null)}
        >
          <DialogHeader>
            <DialogTitle>
              Edit Doctor Profile - Dr. {editingDoctor?.firstName}{' '}
              {editingDoctor?.lastName}
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4 text-xs">
            <Field label="Specialization">
              <TextInput
                type="text"
                value={editForm.specialization}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditForm({ ...editForm, specialization: e.target.value })
                }
                placeholder="e.g. Cardiology, Dermatology"
              />
            </Field>

            <Field label="Qualification">
              <TextInput
                type="text"
                value={editForm.qualification}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditForm({ ...editForm, qualification: e.target.value })
                }
                placeholder="e.g. MD, FACC"
              />
            </Field>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Experience (Yrs)">
                <TextInput
                  type="number"
                  value={editForm.experienceYears}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditForm({ ...editForm, experienceYears: Number(e.target.value) })
                  }
                />
              </Field>

              <Field label="Doctor Fee (₹)">
                <TextInput
                  type="number"
                  value={editForm.consultationFee}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditForm({ ...editForm, consultationFee: Number(e.target.value) })
                  }
                />
              </Field>

              <Field label="Hospital Fee (₹)">
                <TextInput
                  type="number"
                  value={editForm.hospitalCharge}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditForm({ ...editForm, hospitalCharge: Number(e.target.value) })
                  }
                />
              </Field>
            </div>

            <Field label="Biography / Professional Bio">
              <textarea
                value={editForm.biography}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setEditForm({ ...editForm, biography: e.target.value })
                }
                rows={3}
                className="w-full rounded-md border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Brief clinical biography..."
              />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setEditingDoctor(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveEdit}
              loading={updateMutation.isPending}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </Modal>

        {/* View & Verify Doctor Documents Modal */}
        <Modal
          open={Boolean(viewingDocsDoctor)}
          onOpenChange={(open) => !open && setViewingDocsDoctor(null)}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Verification Documents - Dr. {viewingDocsDoctor?.firstName}{' '}
              {viewingDocsDoctor?.lastName}
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4 text-xs">
            <p className="text-muted-foreground">
              Review credential documents submitted by Dr. {viewingDocsDoctor?.firstName}{' '}
              {viewingDocsDoctor?.lastName}. You can open files directly or verify/reject
              individual credentials.
            </p>

            {(() => {
              const effectiveDocs = getDoctorDocuments(viewingDocsDoctor);
              if (effectiveDocs.length === 0) {
                return (
                  <div className="text-center py-8 bg-muted/20 border border-dashed border-border/80 rounded-xl space-y-1">
                    <FileText className="w-8 h-8 mx-auto text-muted-foreground/60" />
                    <p className="font-semibold text-foreground">
                      No documents submitted
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      This doctor has not uploaded any credentials yet.
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {effectiveDocs.map((docItem, idx) => {
                    const docUrl = docItem.url;
                    const docName = docItem.name;
                    const docType = docItem.type;
                    const docDate = docItem.uploadedAt;
                    const docStatus = docItem.status;
                    const docId = docItem.id;

                    return (
                      <div
                        key={docId || `admin-doc-${idx}`}
                        className="p-3 rounded-xl bg-card border border-border/70 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-xs">
                              {docName}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Category:{' '}
                              <span className="font-medium text-foreground">
                                {docType}
                              </span>{' '}
                              &bull; Uploaded: {docDate}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              tone={getAdminDocBadgeTone(docStatus)}
                              className="text-[10px]"
                            >
                              {docStatus === 'VERIFIED' && (
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />{' '}
                                  Verified
                                </span>
                              )}
                              {docStatus === 'REJECTED' && (
                                <span className="flex items-center gap-1">
                                  <XCircle className="w-3 h-3 text-destructive" />{' '}
                                  Rejected
                                </span>
                              )}
                              {docStatus !== 'VERIFIED' && docStatus !== 'REJECTED' && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-500" /> Pending
                                  Review
                                </span>
                              )}
                            </Badge>

                            {(docUrl || docName) && (
                              <>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => viewDocument(docUrl || docName)}
                                  className="h-7 px-2 text-[11px] gap-1"
                                  title="View Document"
                                >
                                  <Eye className="w-3.5 h-3.5 text-primary" /> View
                                </Button>

                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    void downloadDocument(docName, docUrl || docName)
                                  }
                                  className="h-7 px-2 text-[11px] gap-1"
                                  title="Download Document"
                                >
                                  <Download className="w-3.5 h-3.5 text-foreground" />{' '}
                                  Download
                                </Button>
                              </>
                            )}

                            {docStatus !== 'VERIFIED' && (
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                  handleUpdateDocumentStatus(docId, 'VERIFIED')
                                }
                                className="h-7 px-2 text-[11px] gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                title="Approve Document"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                              </Button>
                            )}

                            {docStatus !== 'REJECTED' && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleUpdateDocumentStatus(docId, 'REJECTED')
                                }
                                className="h-7 px-2 text-[11px] gap-1 text-destructive hover:bg-destructive/10"
                                title="Reject Document"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Reject
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </DialogBody>
          <DialogFooter className="flex items-center justify-between sm:justify-between">
            {getDoctorDocuments(viewingDocsDoctor).length > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleVerifyAllDocuments}
                loading={updateMutation.isPending}
                className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-300 gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verify All
                Documents
              </Button>
            ) : (
              <div />
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setViewingDocsDoctor(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </Modal>
      </Page>
    </RoleRoute>
  );
}
