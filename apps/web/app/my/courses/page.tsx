'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { unwrapData } from '@shared/api-client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  LoadingState,
  Button,
} from '@shared/ui/components';
import Link from 'next/link';

interface Enrollment {
  id: string;
  courseId: string;
  enrolledAt: string;
  course?: {
    title: string;
  };
}

export default function MyCoursesPage() {
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    setLoading(true);
    apiClient
      .get('/enrollments')
      .then((res) => setEnrollments(unwrapData<Enrollment[]>(res.data)))
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">My Courses</h1>
        <LoadingState label="Loading…" />
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">My Courses</h1>
        <div className="text-center text-muted-foreground py-12">
          <p className="mb-4">You are not enrolled in any courses.</p>
          <Link href="/courses">
            <Button>Browse Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Courses</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {enrollments.map((e) => (
          <Card key={e.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>
                <Link href={`/learn/${e.courseId}`} className="hover:underline">
                  {e.course?.title ?? 'Course'}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-muted-foreground mb-4">
                Enrolled {new Date(e.enrolledAt).toLocaleDateString()}
              </p>
              <Link href={`/learn/${e.courseId}`}>
                <Button className="w-full">Continue Learning</Button>
              </Link>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
