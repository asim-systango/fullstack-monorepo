'use client';

import React, { useState } from 'react';
import {
  Page,
  PageHeader,
  EmptyState,
  Spinner,
  Button,
  Select,
  Pagination,
} from '@shared/ui/components';
import { useDoctors } from '@/features/doctor/hooks';
import { DoctorCard } from '@/components/doctor/doctor-card';
import { DoctorTable } from '@/components/doctor/doctor-table';
import { LayoutGrid, List, Search, Filter, RotateCcw } from 'lucide-react';
import { TextInput } from '@shared/ui/components';

const SPECIALIZATIONS = [
  'ALL',
  'Cardiology',
  'Dermatology',
  'Orthopedics',
  'Neurology',
  'Pediatrics',
  'General Medicine',
];

export default function DoctorsPage() {
  const [specialization, setSpecialization] = useState('ALL');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: doctors = [],
    isLoading,
    isError,
    refetch,
  } = useDoctors({
    specialization: specialization === 'ALL' ? undefined : specialization,
    search: search || undefined,
  });

  const handleReset = () => {
    setSpecialization('ALL');
    setSearch('');
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleSpecializationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSpecialization(e.target.value);
    setCurrentPage(1);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" className="text-primary" />
          <p className="text-sm text-muted-foreground">Loading doctor directory...</p>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="py-12">
          <EmptyState
            title="Failed to Load Doctors"
            description="An error occurred while fetching the doctor directory."
            action={
              <Button variant="outline" size="sm" onClick={() => void refetch()}>
                Try Again
              </Button>
            }
          />
        </div>
      );
    }

    if (doctors.length === 0) {
      return (
        <div className="py-12">
          <EmptyState
            title="No Doctors Found"
            description="No medical specialists match your current search filters."
            action={
              <Button variant="outline" size="sm" onClick={handleReset}>
                Clear Filters
              </Button>
            }
          />
        </div>
      );
    }

    if (viewMode === 'grid') {
      const pageSize = 10;
      const totalPages = Math.max(1, Math.ceil(doctors.length / pageSize));
      const safePage = Math.min(Math.max(1, currentPage), totalPages);
      const paginatedDoctors = doctors.slice(
        (safePage - 1) * pageSize,
        safePage * pageSize,
      );

      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>

          <Pagination
            currentPage={safePage}
            totalItems={doctors.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      );
    }

    return <DoctorTable doctors={doctors} />;
  };

  return (
    <Page>
      <PageHeader
        title="Find a Specialist Doctor"
        description="Browse board-certified medical specialists, review credentials, and view available consultation schedules."
      />

      {/* Filter and View Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <TextInput
              placeholder="Search by doctor name or specialty..."
              value={search}
              onChange={handleSearchChange}
              className="pl-9 text-sm w-full"
            />
          </div>

          {/* Specialization Filter Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-muted-foreground hidden sm:block" />
            <Select
              value={specialization}
              onChange={handleSpecializationChange}
              className="text-sm w-full sm:w-48"
            >
              {SPECIALIZATIONS.map((spec) => (
                <option key={spec} value={spec}>
                  {spec === 'ALL' ? 'All Specializations' : spec}
                </option>
              ))}
            </Select>
          </div>

          {(specialization !== 'ALL' || search !== '') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs text-muted-foreground gap-1 hover:text-foreground"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </Button>
          )}
        </div>

        {/* View Mode Toggle (Grid / Table) */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/50 self-end md:self-auto">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="h-8 px-2.5 text-xs gap-1.5"
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Grid</span>
          </Button>
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="h-8 px-2.5 text-xs gap-1.5"
            title="Table View"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Table</span>
          </Button>
        </div>
      </div>

      {/* Content Rendering */}
      {renderContent()}
    </Page>
  );
}
