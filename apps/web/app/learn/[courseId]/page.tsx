'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { unwrapData } from '@shared/api-client';
import {
  Page,
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
  lessons: Lesson[];
  quizzes: Quiz[];
}

interface Lesson {
  id: string;
  title: string;
}

interface Quiz {
  id: string;
  title: string;
}

interface LessonProgress {
  id: string;
  lessonId: string;
  completed: boolean;
  completedAt: string | null;
}

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [toggleLoading, setToggleLoading] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    Promise.all([
      apiClient
        .get(`/courses/${courseId}`)
        .then((res) => setCourse(unwrapData<Course>(res.data))),
      apiClient
        .get(`/lesson-progress/course/${courseId}`)
        .then((res) => setProgress(unwrapData<LessonProgress[]>(res.data))),
    ])
      .catch(() => {
        setCourse(null);
        setProgress([]);
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  const toggleLessonComplete = async (lessonId: string) => {
    setToggleLoading(true);
    try {
      const existingProgress = progress.find((p) => p.lessonId === lessonId);
      await apiClient.post('/lesson-progress', {
        lessonId,
        completed: !existingProgress?.completed,
      });
      // Reload progress
      apiClient
        .get(`/lesson-progress/course/${courseId}`)
        .then((res) => setProgress(unwrapData<LessonProgress[]>(res.data)));
    } catch (error) {
      console.error('Failed to update progress', error);
    } finally {
      setToggleLoading(false);
    }
  };

  const getLessonProgress = (lessonId: string) => {
    return progress.find((p) => p.lessonId === lessonId);
  };

  const calculateProgress = () => {
    if (!course?.lessons.length) return 0;
    const completedCount = progress.filter((p) => p.completed).length;
    return Math.round((completedCount / course.lessons.length) * 100);
  };

  if (loading) return <LoadingState label="Loading course…" />;
  if (!course)
    return (
      <Page>
        <div>Course not found</div>
      </Page>
    );

  const progressPercentage = calculateProgress();

  return (
    <Page>
      <Card>
        <CardHeader>
          <CardTitle>Learning: {course.title}</CardTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge tone={progressPercentage === 100 ? 'success' : 'accent'}>
              {progressPercentage}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardBody>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Lessons</h3>
            <ol className="list-decimal pl-6 space-y-2">
              {course.lessons?.map((l: Lesson) => {
                const lessonProgress = getLessonProgress(l.id);
                return (
                  <li key={l.id} className="py-2 flex items-center justify-between">
                    <span>{l.title}</span>
                    <Button
                      onClick={() => toggleLessonComplete(l.id)}
                      variant="ghost"
                      size="sm"
                      disabled={toggleLoading}
                    >
                      {lessonProgress?.completed ? '✓ Completed' : 'Mark Complete'}
                    </Button>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Quizzes</h3>
            {course.quizzes?.map((q: Quiz) => (
              <div key={q.id} className="py-2">
                <Button onClick={() => router.push(`/learn/${course.id}/quiz/${q.id}`)}>
                  Take Quiz: {q.title}
                </Button>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </Page>
  );
}
