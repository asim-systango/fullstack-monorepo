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
} from '@shared/ui/components';
import type { Enrollment } from '@/lib/interfaces';

export default function AdminEnrollmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    if (authLoading || !user) return;
    if (user.role !== 'admin') return;

    setLoading(true);
    apiClient
      .get('/enrollments/admin')
      .then((res) => setEnrollments(unwrapData<Enrollment[]>(res.data)))
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false));
  }, [authLoading, user]);

  if (authLoading || loading) return <LoadingState label="Loading enrollments…" />;
  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-muted-foreground">
          Admin enrollment view not available for your role.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">All Enrollments</h1>

      <Card>
        <CardHeader>
          <CardTitle>Platform Enrollments</CardTitle>
        </CardHeader>
        <CardBody>
          {enrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No enrollments found.</p>
          ) : (
            <Table>
              <TableHead>
                <TableHeaderCell>Course</TableHeaderCell>
                <TableHeaderCell>Student ID</TableHeaderCell>
                <TableHeaderCell>Enrolled Date</TableHeaderCell>
              </TableHead>
              <TableBody>
                {enrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell>{enrollment.course?.title || 'Unknown'}</TableCell>
                    <TableCell>{enrollment.studentId}</TableCell>
                    <TableCell>
                      {new Date(enrollment.enrolledAt).toLocaleDateString()}
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
