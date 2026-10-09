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
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from '@shared/ui/components';
import type { Grade } from '@/lib/interfaces';

export default function MyGradesPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [grades, setGrades] = useState<Grade[]>([]);

  useEffect(() => {
    if (authLoading || !user) return;
    if (user.role !== 'user') return;

    setLoading(true);
    apiClient
      .get('/grades/my')
      .then((res) => setGrades(unwrapData<Grade[]>(res.data)))
      .catch(() => setGrades([]))
      .finally(() => setLoading(false));
  }, [authLoading, user]);

  if (authLoading || loading) return <LoadingState label="Loading grades…" />;
  if (!user || user.role !== 'user') {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center text-muted-foreground">
          Grades not available for your role.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Grades</h1>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Results</CardTitle>
        </CardHeader>
        <CardBody>
          {grades.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No graded submissions yet. Complete some quizzes to see your grades here.
            </p>
          ) : (
            <Table>
              <TableHead>
                <TableHeaderCell>Course</TableHeaderCell>
                <TableHeaderCell>Quiz</TableHeaderCell>
                <TableHeaderCell>Score</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Feedback</TableHeaderCell>
              </TableHead>
              <TableBody>
                {grades.map((grade) => (
                  <TableRow key={grade.id}>
                    <TableCell>
                      {grade.submission?.quiz?.course?.title || 'Unknown'}
                    </TableCell>
                    <TableCell>{grade.submission?.quiz?.title || 'Unknown'}</TableCell>
                    <TableCell>
                      <Badge tone={grade.score >= 70 ? 'success' : 'accent'}>
                        {grade.score}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(grade.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground italic">
                      {grade.feedback || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
