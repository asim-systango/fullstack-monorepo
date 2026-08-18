'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { apiClient } from '@/lib/api';
import { unwrapData } from '@shared/api-client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Field,
  TextInput,
  Button,
  StatusMessage,
} from '@shared/ui/components';
import type { Course } from '@/lib/interfaces';

export default function CreateCoursePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
  });

  if (user?.role !== 'staff' && user?.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center text-muted-foreground">
          You don&apos;t have permission to access this page.
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/courses', formData);
      const course = unwrapData<Course>(response.data);
      router.push(`/instructor/courses/${course.id}`);
    } catch (err) {
      console.error('Error creating course:', err);
      setError('Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-muted-foreground hover:text-ink mb-4"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold">Create New Course</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Course Title" htmlFor="title" required>
              <TextInput
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Introduction to Web Development"
                required
              />
            </Field>

            <Field label="Slug" htmlFor="slug" required>
              <TextInput
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                  })
                }
                placeholder="e.g., intro-web-dev"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                URL-friendly identifier (lowercase, hyphens only)
              </p>
            </Field>

            <Field label="Description" htmlFor="description">
              <TextInput
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the course"
                // multiline
              />
            </Field>

            {error && <StatusMessage tone="error">{error}</StatusMessage>}

            <div className="flex gap-3 pt-4">
              <Button type="submit" loading={loading} loadingText="Creating…">
                Create Course
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
