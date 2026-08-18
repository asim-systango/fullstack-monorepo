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
import type { Certificate } from '@/lib/interfaces';

export default function MyCertificatesPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    if (authLoading || !user) return;
    if (user.role !== 'user') return;

    setLoading(true);
    apiClient
      .get('/certificates/my')
      .then((res) => setCertificates(unwrapData<Certificate[]>(res.data)))
      .catch(() => setCertificates([]))
      .finally(() => setLoading(false));
  }, [authLoading, user]);

  if (authLoading || loading) return <LoadingState label="Loading certificates…" />;
  if (!user || user.role !== 'user') {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center text-muted-foreground">
          Certificates not available for your role.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Certificates</h1>

      {certificates.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Certificates Yet</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-muted-foreground mb-4">
              Complete courses with passing grades (70%+) to earn certificates.
            </p>
            <Link href="/courses">
              <Button>Browse Courses</Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {certificates.map((certificate) => (
            <Card key={certificate.id} className="border-2 border-dashed">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Certificate of Completion</span>
                  <Badge tone="success">Earned</Badge>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Course</p>
                    <p className="font-medium">
                      {certificate.enrollment?.course?.title || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Issued</p>
                    <p className="font-medium">
                      {new Date(certificate.issuedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="pt-4 border-t">
                    <Link href={`/learn/${certificate.enrollment?.courseId || ''}`}>
                      <Button variant="ghost" size="sm" className="w-full">
                        View Course
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
