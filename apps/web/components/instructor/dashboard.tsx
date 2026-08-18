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
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Badge,
} from '@shared/ui/components';

type PerCourseRow = { courseId: string; title: string; ungraded: string };

export default function InstructorDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [perCourse, setPerCourse] = useState<PerCourseRow[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || (user.role !== 'staff' && user.role !== 'admin')) return;

    setLoading(true);
    setError(null);

    apiClient
      .get('/courses/mine/dashboard')
      .then((res) => {
        const data = unwrapData<{ total: number; perCourse: PerCourseRow[] }>(res.data);
        setTotal(data.total);
        setPerCourse(data.perCourse || []);
      })
      .catch((err) => {
        setError(err.message ?? 'Failed to load dashboard');
      })
      .finally(() => setLoading(false));
  }, [authLoading, user]);

  if (authLoading || loading) return <LoadingState label="Loading dashboard…" />;
  if (!user || (user.role !== 'staff' && user.role !== 'admin')) return null;

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Instructor Dashboard</CardTitle>
      </CardHeader>
      <CardBody>
        {error && <div className="text-sm text-danger">{error}</div>}
        <div className="mb-4 flex items-center gap-4">
          <div className="text-sm text-muted-foreground">Ungraded submissions</div>
          <Badge tone="accent">{total ?? 0}</Badge>
        </div>

        <Table>
          <TableHead>
            <TableHeaderCell>Course</TableHeaderCell>
            <TableHeaderCell>Ungraded</TableHeaderCell>
          </TableHead>
          <TableBody>
            {perCourse.length === 0 ? (
              <TableRow>
                <TableCell className="text-sm text-muted-foreground" colSpan={2}>
                  No ungraded submissions
                </TableCell>
              </TableRow>
            ) : (
              perCourse.map((row) => (
                <TableRow key={row.courseId}>
                  <TableCell>{row.title}</TableCell>
                  <TableCell>{row.ungraded}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
}
