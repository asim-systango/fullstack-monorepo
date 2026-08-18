'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { unwrapData } from '@shared/api-client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  LoadingState,
  Button,
  Badge,
} from '@shared/ui/components';

interface Course {
  id: string;
  title: string;
  description: string;
  lessons: { id: string; title: string }[];
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    apiClient
      .get(`/courses/${courseId}`)
      .then((res) => setCourse(unwrapData<Course>(res.data)))
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [courseId]);

  useEffect(() => {
    if (!courseId) return;
    // check enrollment status for current user
    apiClient
      .get('/enrollments', { params: { courseId } })
      .then((res) => {
        const list = unwrapData<Record<string, unknown>[]>(res.data);
        setEnrolled(list.length > 0);
      })
      .catch(() => {
        setEnrolled(false);
      });
  }, [courseId]);

  async function enroll() {
    try {
      await apiClient.post('/enrollments', { courseId });
      setEnrolled(true);
    } catch {
      // ignore for now
    }
  }

  if (loading) return <LoadingState label="Loading course…" />;
  if (!course)
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>Course not found</div>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.back()}
        className="text-sm text-muted-foreground hover:text-ink mb-4"
      >
        ← Back to Courses
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
        <p className="text-muted-foreground">{course.description}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
            </CardHeader>
            <CardBody>
              <section>
                <h3 className="font-medium mb-3">Lessons ({course.lessons.length})</h3>
                {course.lessons.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No lessons yet</p>
                ) : (
                  <ol className="list-decimal pl-6 space-y-2">
                    {course.lessons?.map((l: { id: string; title: string }) => (
                      <li key={l.id} className="py-1">
                        {l.title}
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            </CardBody>
          </Card>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Enrollment</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {enrolled ? (
                  <Badge tone="success">Enrolled</Badge>
                ) : (
                  <Button onClick={() => void enroll()} className="w-full">
                    Enroll Now
                  </Button>
                )}

                {enrolled && (
                  <Button
                    variant="ghost"
                    onClick={() => router.push(`/learn/${course.id}`)}
                    className="w-full"
                  >
                    Start Learning
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
