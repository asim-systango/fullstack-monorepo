'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { RoleRoute } from '@/components/auth';
import { useDoctors, useUpdateDoctor, useDeleteDoctor } from '@/features/doctor/hooks';
import type { DoctorProfile } from '@/features/doctor/types';
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
import {
  Search,
  Filter,
  UserPlus,
  Edit,
  Power,
  RefreshCw,
  Award,
  Stethoscope,
  Clock,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';

export default function AdminDoctorsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [specFilter, setSpecFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Edit Doctor Modal state
  const [editingDoctor, setEditingDoctor] = useState<DoctorProfile | null>(null);
  const [editForm, setEditForm] = useState({
    specialization: '',
    qualification: '',
    experienceYears: 0,
    consultationFee: 0,
    biography: '',
  });

  const { data: doctors = [], isLoading, isError, refetch } = useDoctors();
  const updateMutation = useUpdateDoctor();
  const deleteMutation = useDeleteDoctor();

  const handleEditClick = (doc: DoctorProfile) => {
    setEditingDoctor(doc);
    setEditForm({
      specialization: doc.specialization || '',
      qualification: doc.qualification || '',
      experienceYears: doc.experienceYears || 0,
      consultationFee: doc.consultationFee || 0,
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

  const handleToggleStatus = (doc: DoctorProfile) => {
    const actionName = doc.isActive ? 'deactivate' : 'reactivate';
    if (
      confirm(
        `Are you sure you want to ${actionName} Dr. ${doc.firstName} ${doc.lastName}?`,
      )
    ) {
      if (doc.isActive) {
        deleteMutation.mutate(doc.id);
      } else {
        updateMutation.mutate({
          id: doc.id,
          payload: { isActive: true },
        });
      }
    }
  };

  // Filtered doctors logic
  const specializations = Array.from(new Set(doctors.map((d) => d.specialization)));

  const filteredDoctors = doctors.filter((doc) => {
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

  return (
    <RoleRoute roles={['ADMIN', 'admin']}>
      <Page>
        <PageHeader
          title="Doctor & Practitioner Management"
          description="Manage practitioner profiles, assign medical specializations, toggle active status, and update consultation fees."
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void refetch()}
                className="text-xs h-8 gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </Button>
              <Link href="/register?role=doctor">
                <Button variant="primary" size="sm" className="text-xs gap-1.5">
                  <UserPlus className="w-3.5 h-3.5" /> Onboard Doctor
                </Button>
              </Link>
            </div>
          }
        />

        {/* Filter & Search Bar */}
        <div className="mt-6 bg-card p-4 rounded-xl border border-border/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by doctor name, specialization, or qualification..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearch(e.target.value)
                }
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="font-semibold text-foreground">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')
                  }
                  className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active Only</option>
                  <option value="INACTIVE">Deactivated Only</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-foreground">Specialization:</span>
                <select
                  value={specFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setSpecFilter(e.target.value)
                  }
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
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
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
                No doctor profiles matched your search or filter parameters.
              </p>
            </div>
          )}

          {!isLoading && !isError && filteredDoctors.length > 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(() => {
                  const pageSize = 10;
                  const totalPages = Math.max(
                    1,
                    Math.ceil(filteredDoctors.length / pageSize),
                  );
                  const safePage = Math.min(Math.max(1, currentPage), totalPages);
                  const paginatedDocs = filteredDoctors.slice(
                    (safePage - 1) * pageSize,
                    safePage * pageSize,
                  );

                  return paginatedDocs.map((doc) => (
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

                          <Badge
                            tone={doc.isActive ? 'success' : 'neutral'}
                            className="text-[10px] shrink-0"
                          >
                            {doc.isActive ? (
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />{' '}
                                Active
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <XCircle className="w-3 h-3 text-muted-foreground" />{' '}
                                Inactive
                              </span>
                            )}
                          </Badge>
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

                        <div className="pt-2 flex items-center justify-end gap-2 border-t border-border/40">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(doc)}
                            className="text-xs h-7 gap-1"
                          >
                            <Edit className="w-3 h-3" /> Edit
                          </Button>

                          <Button
                            variant={doc.isActive ? 'outline' : 'primary'}
                            size="sm"
                            onClick={() => handleToggleStatus(doc)}
                            className={`text-xs h-7 gap-1 ${
                              doc.isActive
                                ? 'text-destructive hover:bg-destructive/10'
                                : ''
                            }`}
                            disabled={
                              deleteMutation.isPending || updateMutation.isPending
                            }
                          >
                            <Power className="w-3 h-3" />
                            {doc.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ));
                })()}
              </div>

              <Pagination
                currentPage={currentPage}
                totalItems={filteredDoctors.length}
                pageSize={10}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>

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

            <div className="grid grid-cols-2 gap-3">
              <Field label="Experience (Years)">
                <TextInput
                  type="number"
                  value={editForm.experienceYears}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditForm({ ...editForm, experienceYears: Number(e.target.value) })
                  }
                />
              </Field>

              <Field label="Consultation Fee (₹)">
                <TextInput
                  type="number"
                  value={editForm.consultationFee}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditForm({ ...editForm, consultationFee: Number(e.target.value) })
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
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </Modal>
      </Page>
    </RoleRoute>
  );
}
