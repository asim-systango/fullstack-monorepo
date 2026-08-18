'use client';

import InstructorDashboard from '@/components/instructor/dashboard';
import GradingQueue from '@/components/instructor/grading';
import { Button } from '@shared/ui/components';
import Link from 'next/link';

export default function InstructorPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your courses and grade submissions
          </p>
        </div>
        <Link href="/instructor/courses/create">
          <Button>Create Course</Button>
        </Link>
      </div>

      <section className="space-y-6">
        <InstructorDashboard />
        <GradingQueue />
      </section>
    </div>
  );
}
