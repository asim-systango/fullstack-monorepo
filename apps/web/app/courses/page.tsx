'use client';

import Link from 'next/link';
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

interface Course {
  id: string;
  title: string;
  description: string;
}

export default function CoursesPage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    setLoading(true);
    apiClient
      .get('/courses')
      .then((res) => setCourses(unwrapData<Course[]>(res.data)))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Courses</h1>
        <LoadingState label="Loading courses…" />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Courses</h1>
        <div className="text-center text-muted-foreground py-12">
          No published courses available.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Courses</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => (
          <Card key={c.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>
                <Link href={`/courses/${c.id}`} className="hover:underline">
                  {c.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {c.description}
              </p>
              <Link href={`/courses/${c.id}`}>
                <Button className="w-full">View Course</Button>
              </Link>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
