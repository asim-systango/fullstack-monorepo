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
import type { Enrollment, Grade } from '@/lib/interfaces';

export default function StudentDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);

  useEffect(() => {
    if (authLoading || !user) return;
    if (user.role !== 'user') return;

    setLoading(true);
    Promise.all([
      apiClient
        .get('/enrollments')
        .then((res) => setEnrollments(unwrapData<Enrollment[]>(res.data))),
      apiClient.get('/grades/my').then((res) => setGrades(unwrapData<Grade[]>(res.data))),
    ])
      .catch(() => {
        setEnrollments([]);
        setGrades([]);
      })
      .finally(() => setLoading(false));
  }, [authLoading, user]);

  if (authLoading || loading) return <LoadingState label="Loading dashboard…" />;
  if (!user || user.role !== 'user') {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center text-muted-foreground">
          Student dashboard not available for your role.
        </div>
      </div>
    );
  }

  const averageScore =
    grades.length > 0
      ? Math.round(grades.reduce((sum, g) => sum + g.score, 0) / grades.length)
      : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Student Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Enrolled Courses</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-4xl font-bold">{enrollments.length}</div>
            <p className="text-sm text-muted-foreground mt-2">Active enrollments</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Score</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-4xl font-bold">{averageScore}%</div>
            <p className="text-sm text-muted-foreground mt-2">
              Across {grades.length} graded submissions
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed Quizzes</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-4xl font-bold">{grades.length}</div>
            <p className="text-sm text-muted-foreground mt-2">Quiz submissions graded</p>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
          </CardHeader>
          <CardBody>
            {enrollments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You haven&quot;t enrolled in any courses yet.
              </p>
            ) : (
              <div className="space-y-3">
                {enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div>
                      <Link
                        href={`/learn/${enrollment.courseId}`}
                        className="font-medium hover:underline"
                      >
                        {enrollment.course?.title}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1">
                        Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Link href={`/learn/${enrollment.courseId}`}>
                      <Button variant="ghost" size="sm">
                        Continue
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
            <Link href="/courses" className="mt-4 block">
              <Button variant="ghost" size="sm">
                Browse Courses →
              </Button>
            </Link>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Grades</CardTitle>
          </CardHeader>
          <CardBody>
            {grades.length === 0 ? (
              <p className="text-sm text-muted-foreground">No graded submissions yet.</p>
            ) : (
              <div className="space-y-3">
                {grades.slice(0, 5).map((grade) => (
                  <div key={grade.id} className="p-3 border rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        {grade.submission?.quiz?.title || 'Quiz'}
                      </span>
                      <Badge tone={grade.score >= 70 ? 'success' : 'accent'}>
                        {grade.score}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {grade.submission?.quiz?.course?.title || 'Course'}
                    </p>
                    {grade.feedback && (
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        {grade.feedback}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            <Link href="/my/grades" className="mt-4 block">
              <Button variant="ghost" size="sm">
                View All Grades →
              </Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
