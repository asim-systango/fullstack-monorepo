'use client';

import { TextInput, Select, Button, Card } from '@shared/ui/components';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { useUiStore } from '@/lib/store';

type DoctorFilterProps = {
  selectedSpecialty: string;
  onSpecialtyChange: (val: string) => void;
  onReset: () => void;
};

export function DoctorFilter({
  selectedSpecialty,
  onSpecialtyChange,
  onReset,
}: Readonly<DoctorFilterProps>) {
  const searchQuery = useUiStore((state) => state.searchQuery);
  const setSearchQuery = useUiStore((state) => state.setSearchQuery);

  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <TextInput
            placeholder="Search doctor name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        </div>

        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground whitespace-nowrap">
            <Filter className="size-3.5" /> Filter by:
          </div>

          <Select
            value={selectedSpecialty}
            onChange={(e) => onSpecialtyChange(e.target.value)}
            className="w-full sm:w-48 text-xs"
          >
            <option value="ALL">All Specializations</option>
            <option value="CARDIOLOGY">Cardiology</option>
            <option value="DERMATOLOGY">Dermatology</option>
            <option value="NEUROLOGY">Neurology</option>
            <option value="PEDIATRICS">Pediatrics</option>
            <option value="ORTHOPEDICS">Orthopedics</option>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="gap-1.5 text-xs h-9"
          >
            <RotateCcw className="size-3.5" /> Reset
          </Button>
        </div>
      </div>
    </Card>
  );
}
