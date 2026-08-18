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
  Badge,
  Button,
} from '@shared/ui/components';
import Link from 'next/link';

interface AdminCourse {
  id: string;
  title: string;
  instructorId: string;
  publishedAt: string | null;
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<AdminCourse[]>([]);

  useEffect(() => {
    setLoading(true);
    apiClient
      .get('/courses/admin')
      .then((res) => setCourses(unwrapData<AdminCourse[]>(res.data)))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <LoadingState label="Loading…" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Courses</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-4xl font-bold">{courses.length}</div>
            <p className="text-sm text-muted-foreground mt-2">All courses in system</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Published Courses</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-4xl font-bold">
              {courses.filter((c) => c.publishedAt).length}
            </div>
            <p className="text-sm text-muted-foreground mt-2">Available to students</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Draft Courses</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-4xl font-bold">
              {courses.filter((c) => !c.publishedAt).length}
            </div>
            <p className="text-sm text-muted-foreground mt-2">Unpublished content</p>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Manage Content</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <Link href="/admin/enrollments">
                <Button variant="ghost" className="w-full justify-start">
                  View All Enrollments
                </Button>
              </Link>
              <Link href="/courses">
                <Button variant="ghost" className="w-full justify-start">
                  Browse Course Catalog
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <Link href="/instructor/courses/create">
                <Button variant="ghost" className="w-full justify-start">
                  Create New Course
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
        </CardHeader>
        <CardBody>
          {courses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No courses found.</p>
          ) : (
            <div className="space-y-3">
              {courses.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-4 border rounded"
                >
                  <div>
                    <h3 className="font-medium">{c.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Instructor ID: {c.instructorId}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {c.publishedAt ? (
                      <Badge tone="success">Published</Badge>
                    ) : (
                      <Badge tone="accent">Draft</Badge>
                    )}
                    <Link href={`/instructor/courses/${c.id}`}>
                      <Badge tone="neutral">View</Badge>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
