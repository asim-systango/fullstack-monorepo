'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { apiClient } from '@/lib/api';
import { unwrapData } from '@shared/api-client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  LoadingState,
  Badge,
  Button,
} from '@shared/ui/components';
import Link from 'next/link';
import type { Course } from '@/lib/interfaces';

export default function InstructorCoursesPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (authLoading || !user) return;
    if (user.role !== 'staff' && user.role !== 'admin') return;

    setLoading(true);
    apiClient
      .get('/courses/mine')
      .then((res) => setCourses(unwrapData<Course[]>(res.data)))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [authLoading, user]);

  if (authLoading || loading) return <LoadingState label="Loading courses…" />;
  if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center text-muted-foreground">
          Instructor courses not available for your role.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-muted-foreground">Manage and edit your course content</p>
        </div>
        <Link href="/instructor/courses/create">
          <Button>Create Course</Button>
        </Link>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Courses Yet</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-muted-foreground mb-4">
              You haven&apos;t created any courses yet. Start by creating your first
              course.
            </p>
            <Link href="/instructor/courses/create">
              <Button>Create Your First Course</Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  {course.publishedAt ? (
                    <Badge tone="success">Published</Badge>
                  ) : (
                    <Badge tone="accent">Draft</Badge>
                  )}
                </div>
              </CardHeader>
              <CardBody>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {course.description || 'No description'}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span>{course.lessons?.length || 0} lessons</span>
                  <span>{course.quizzes?.length || 0} quizzes</span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/instructor/courses/${course.id}`} className="flex-1">
                    <Button variant="ghost" size="sm" className="w-full">
                      Edit Course
                    </Button>
                  </Link>
                  <Link href={`/learn/${course.id}`} className="flex-1">
                    <Button variant="ghost" size="sm" className="w-full">
                      Preview
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
