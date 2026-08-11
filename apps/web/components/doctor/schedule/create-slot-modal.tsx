'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Button, Card, CardHeader, CardTitle, CardBody } from '@shared/ui/components';
import { useCreateSlot, useCreateBulkSlots } from '@/features/slot/hooks';
import type { ShiftInput } from '@/features/slot/types';
import {
  Calendar,
  Clock,
  Sparkles,
  X,
  PlusCircle,
  Layers,
  CalendarDays,
  Check,
  Plus,
  Trash2,
  Tag,
} from 'lucide-react';

interface CreateSlotModalProps {
  doctorId: string;
  isOpen: boolean;
  onClose: () => void;
}

type FrequencyMode = 'single_day' | 'date_range' | 'weekly';

interface LocalShiftItem {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

const WEEKDAYS = [
  { id: 1, label: 'Mon' },
  { id: 2, label: 'Tue' },
  { id: 3, label: 'Wed' },
  { id: 4, label: 'Thu' },
  { id: 5, label: 'Fri' },
  { id: 6, label: 'Sat' },
  { id: 0, label: 'Sun' },
];

export function CreateSlotModal({
  doctorId,
  isOpen,
  onClose,
}: Readonly<CreateSlotModalProps>) {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0] ?? '', []);

  const [mode, setMode] = useState<'bulk' | 'single'>('bulk');
  const [frequency, setFrequency] = useState<FrequencyMode>('single_day');

  // Dates
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]);

  // Single slot form fields
  const [singleStartTime, setSingleStartTime] = useState('09:00');
  const [singleEndTime, setSingleEndTime] = useState('09:30');
  const [singleDuration, setSingleDuration] = useState<number>(30);

  // Dynamic Shifts
  const [shifts, setShifts] = useState<LocalShiftItem[]>([
    { id: '1', name: 'Morning Shift', startTime: '09:00', endTime: '13:00' },
    { id: '2', name: 'Afternoon Shift', startTime: '14:00', endTime: '17:00' },
  ]);

  // Duration for bulk generator
  const [durationMinutes, setDurationMinutes] = useState(30);

  // Custom API mutation hooks (called unconditionally at top-level)
  const createSingle = useCreateSlot();
  const createBulk = useCreateBulkSlots();

  // Keep Single Slot End Time in sync with Start Time & Duration
  useEffect(() => {
    if (!singleStartTime) return;
    const [h, m] = singleStartTime.split(':').map(Number);
    if (h === undefined || m === undefined) return;

    const totalMins = h * 60 + m + singleDuration;
    const endH = Math.floor(totalMins / 60) % 24;
    const endM = totalMins % 60;
    const formattedEnd = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    setSingleEndTime(formattedEnd);
  }, [singleStartTime, singleDuration]);

  // Estimate total slots for bulk mode (called unconditionally at top-level)
  const estimatedSlots = useMemo(() => {
    if (mode === 'single') return 1;

    const sDate = new Date(`${startDate}T00:00:00`);
    const eDate = new Date(
      `${frequency === 'single_day' ? startDate : endDate}T00:00:00`,
    );

    if (isNaN(sDate.getTime()) || isNaN(eDate.getTime()) || sDate > eDate) return 0;

    let activeDaysCount = 0;
    const curr = new Date(sDate);
    while (curr <= eDate) {
      const day = curr.getDay();
      if (frequency !== 'weekly' || daysOfWeek.includes(day)) {
        activeDaysCount++;
      }
      curr.setDate(curr.getDate() + 1);
    }

    const calcWindowSlots = (s: string, e: string) => {
      const startMs = new Date(`2000-01-01T${s}:00`).getTime();
      const endMs = new Date(`2000-01-01T${e}:00`).getTime();
      if (isNaN(startMs) || isNaN(endMs) || startMs >= endMs) return 0;
      return Math.floor((endMs - startMs) / (durationMinutes * 60 * 1000));
    };

    let slotsPerDay = 0;
    for (const shift of shifts) {
      slotsPerDay += calcWindowSlots(shift.startTime, shift.endTime);
    }

    return activeDaysCount * slotsPerDay;
  }, [mode, startDate, endDate, frequency, daysOfWeek, shifts, durationMinutes]);

  // Early return check ONLY AFTER all hooks have been declared
  if (!isOpen) return null;

  // Preset Handlers
  const applyPreset = (preset: 'today' | '7days' | '30days') => {
    const start = new Date();
    setStartDate(start.toISOString().split('T')[0] ?? '');

    if (preset === 'today') {
      setEndDate(start.toISOString().split('T')[0] ?? '');
      setFrequency('single_day');
    } else if (preset === '7days') {
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      setEndDate(end.toISOString().split('T')[0] ?? '');
      setFrequency('date_range');
    } else if (preset === '30days') {
      const end = new Date(start);
      end.setDate(end.getDate() + 29);
      setEndDate(end.toISOString().split('T')[0] ?? '');
      setFrequency('date_range');
    }
  };

  const toggleDayOfWeek = (dayId: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId],
    );
  };

  // Dynamic Shift Handlers
  const handleAddShift = () => {
    const newId = String(Date.now());
    const nextNum = shifts.length + 1;
    setShifts((prev) => [
      ...prev,
      {
        id: newId,
        name: `Shift ${nextNum}`,
        startTime: '18:00',
        endTime: '20:00',
      },
    ]);
  };

  const handleUpdateShift = (id: string, field: keyof LocalShiftItem, value: string) => {
    setShifts((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const handleRemoveShift = (id: string) => {
    if (shifts.length <= 1) return;
    setShifts((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSingleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      const startsAt = new Date(`${startDate}T${singleStartTime}:00`).toISOString();
      const endsAt = new Date(`${startDate}T${singleEndTime}:00`).toISOString();
      await createSingle.mutateAsync({
        doctorId,
        startsAt,
        endsAt,
      });
      onClose();
    } catch {
      // Error state handled by query
    }
  };

  const handleBulkSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      const formattedShifts: ShiftInput[] = shifts.map((s) => ({
        name: s.name.trim() || 'Consultation Shift',
        startTime: s.startTime,
        endTime: s.endTime,
      }));

      await createBulk.mutateAsync({
        doctorId,
        date: startDate,
        endDate: frequency === 'single_day' ? startDate : endDate,
        daysOfWeek: frequency === 'weekly' ? daysOfWeek : undefined,
        shifts: formattedShifts,
        slotDurationMinutes: durationMinutes,
      });
      onClose();
    } catch {
      // Error state handled by query
    }
  };

  const isLoading = createSingle.isPending || createBulk.isPending;
  const errorMsg =
    (createSingle.error as Error | null)?.message ||
    (createBulk.error as Error | null)?.message;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <Card className="w-full max-w-xl shadow-2xl border-border bg-card my-8">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Configure Consultation Slots</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure single slots with end time & duration or multi-shift generators
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        <CardBody className="pt-4 space-y-5">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-muted/60 text-xs font-medium">
            <button
              type="button"
              onClick={() => setMode('bulk')}
              className={`flex items-center justify-center gap-2 py-2 rounded-md transition-all ${
                mode === 'bulk'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Layers className="w-4 h-4" /> Bulk / Recurring Generator
            </button>
            <button
              type="button"
              onClick={() => setMode('single')}
              className={`flex items-center justify-center gap-2 py-2 rounded-md transition-all ${
                mode === 'single'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <PlusCircle className="w-4 h-4" /> Single Custom Slot
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/20 font-medium">
              {errorMsg}
            </div>
          )}

          {mode === 'bulk' ? (
            <form onSubmit={handleBulkSubmit} className="space-y-4">
              {/* Frequency / Range Options */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                  Schedule Range & Frequency
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFrequency('single_day')}
                    className={`py-2 px-3 text-xs rounded-lg border font-medium transition-all ${
                      frequency === 'single_day'
                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                        : 'border-border bg-background text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Single Day
                  </button>
                  <button
                    type="button"
                    onClick={() => setFrequency('date_range')}
                    className={`py-2 px-3 text-xs rounded-lg border font-medium transition-all ${
                      frequency === 'date_range'
                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                        : 'border-border bg-background text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Date Range
                  </button>
                  <button
                    type="button"
                    onClick={() => setFrequency('weekly')}
                    className={`py-2 px-3 text-xs rounded-lg border font-medium transition-all ${
                      frequency === 'weekly'
                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                        : 'border-border bg-background text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Weekly Recurring
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Quick Presets:
                  </span>
                  <button
                    type="button"
                    onClick={() => applyPreset('today')}
                    className="text-[11px] px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground hover:text-foreground"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('7days')}
                    className="text-[11px] px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground hover:text-foreground"
                  >
                    Next 7 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('30days')}
                    className="text-[11px] px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground hover:text-foreground"
                  >
                    Next 30 Days
                  </button>
                </div>
              </div>

              {/* Date Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    {frequency === 'single_day' ? 'Target Date' : 'Start Date'}
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        if (frequency === 'single_day') setEndDate(e.target.value);
                      }}
                      min={todayStr}
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                  </div>
                </div>

                {frequency !== 'single_day' && (
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      End Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || todayStr}
                        required
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      <CalendarDays className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>

              {/* Weekday Selector (Weekly Mode) */}
              {frequency === 'weekly' && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Active Days of the Week
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {WEEKDAYS.map((day) => {
                      const isSelected = daysOfWeek.includes(day.id);
                      return (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => toggleDayOfWeek(day.id)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground font-semibold'
                              : 'border-border bg-background text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dynamic Working Shifts */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                    Working Shifts / Consultation Windows
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddShift}
                    className="h-7 text-xs gap-1 border-dashed"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Shift
                  </Button>
                </div>

                <div className="space-y-3">
                  {shifts.map((shift, idx) => (
                    <div
                      key={shift.id}
                      className="p-3.5 rounded-xl border border-border/80 bg-card space-y-3 shadow-2xs relative"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2">
                        <div className="flex items-center gap-2 flex-1">
                          <Tag className="w-3.5 h-3.5 text-primary shrink-0" />
                          <input
                            type="text"
                            value={shift.name}
                            placeholder={`Shift ${idx + 1} Name...`}
                            onChange={(e) =>
                              handleUpdateShift(shift.id, 'name', e.target.value)
                            }
                            className="bg-transparent text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 rounded px-1.5 py-0.5 w-full max-w-[200px]"
                          />
                        </div>

                        {shifts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveShift(shift.id)}
                            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Remove Shift"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-muted-foreground mb-1">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={shift.startTime}
                            onChange={(e) =>
                              handleUpdateShift(shift.id, 'startTime', e.target.value)
                            }
                            required
                            className="w-full px-3 py-1.5 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-muted-foreground mb-1">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={shift.endTime}
                            onChange={(e) =>
                              handleUpdateShift(shift.id, 'endTime', e.target.value)
                            }
                            required
                            className="w-full px-3 py-1.5 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slot Duration */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Consultation Duration Per Slot
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value={15}>15 Minutes (Express Visit)</option>
                  <option value={20}>20 Minutes</option>
                  <option value={30}>30 Minutes (Standard Consultation)</option>
                  <option value={45}>45 Minutes (Extended Checkup)</option>
                  <option value={60}>60 Minutes (1 Hour Comprehensive)</option>
                </select>
              </div>

              {/* Live Slot Estimate */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs">
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-primary" /> Schedule Summary
                </span>
                <span className="font-bold text-primary">
                  ~{estimatedSlots} Slots Across {shifts.length} Custom Shift(s)
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={isLoading}>
                  Generate All Slots
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSingleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Slot Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={todayStr}
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Start Time
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={singleStartTime}
                      onChange={(e) => setSingleStartTime(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <Clock className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    End Time
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={singleEndTime}
                      onChange={(e) => setSingleEndTime(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <Clock className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Slot Duration Preset
                </label>
                <select
                  value={singleDuration}
                  onChange={(e) => setSingleDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value={15}>15 Minutes (Express Visit)</option>
                  <option value={20}>20 Minutes</option>
                  <option value={30}>30 Minutes (Standard Consultation)</option>
                  <option value={45}>45 Minutes (Extended Checkup)</option>
                  <option value={60}>60 Minutes (1 Hour Comprehensive)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs">
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-primary" /> Single Slot Summary
                </span>
                <span className="font-bold text-primary">
                  {startDate} | {singleStartTime} - {singleEndTime} ({singleDuration}{' '}
                  mins)
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={isLoading}>
                  Create Single Slot
                </Button>
              </div>
            </form>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
