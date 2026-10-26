'use client';

import { useState, type SyntheticEvent } from 'react';
import { Button, Card, CardBody, Field, Form, TextInput } from '@shared/ui/components';
import { useToast } from '@/components/feedback';
import { isWeekend, isYmd } from '@/lib/leave/dates';
import { errorMessage, errorStatus, fieldErrors } from '@/lib/leave/errors';
import { useCreateHoliday } from '@/lib/leave/queries';

export function HolidayForm() {
  const toast = useToast();
  const create = useCreateHoliday();
  const [date, setDate] = useState('');
  const [name, setName] = useState('');

  const fields = fieldErrors(create.error);
  // 409 = there is already a holiday on that date
  const dateError =
    errorStatus(create.error) === 409 ? errorMessage(create.error) : fields.date;
  const weekendHint =
    isYmd(date) && isWeekend(date)
      ? "It's a weekend, so it won't change any day counts"
      : undefined;

  function submit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const holiday = { date, name: name.trim() };
    create.mutate(holiday, {
      onSuccess: () => {
        toast(`Added ${holiday.name}`);
        setDate('');
        setName('');
      },
    });
  }

  return (
    <Card>
      <CardBody>
        <Form pending={create.isPending} onSubmit={submit}>
          <div className="grid items-start gap-3 sm:grid-cols-3">
            <Field
              label="Date"
              htmlFor="holiday-date"
              required
              hint={weekendHint}
              error={dateError}
              disabled={create.isPending}
            >
              <TextInput
                id="holiday-date"
                type="date"
                value={date}
                onChange={(e) => {
                  create.reset();
                  setDate(e.target.value);
                }}
              />
            </Field>
            <Field
              label="Name"
              htmlFor="holiday-name"
              required
              error={fields.name}
              disabled={create.isPending}
            >
              <TextInput
                id="holiday-name"
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <div className="sm:pt-6">
              <Button type="submit" loading={create.isPending} loadingText="Adding…">
                Add holiday
              </Button>
            </div>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
}
