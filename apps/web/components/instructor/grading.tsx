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
  Button,
  Field,
  TextInput,
} from '@shared/ui/components';

interface Submission {
  id: string;
  quizId: string;
  studentId: string;
  answers: Array<{ questionId: string; answer: string }>;
  submittedAt: string;
  grade?: {
    id: string;
    score: number;
    feedback?: string;
  };
  quiz: {
    id: string;
    title: string;
    course: {
      id: string;
      title: string;
    };
  };
}

export default function GradingQueue() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [grading, setGrading] = useState<string | null>(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user || (user.role !== 'staff' && user.role !== 'admin')) return;

    loadSubmissions();
  }, [authLoading, user]);

  const loadSubmissions = () => {
    setLoading(true);
    setError(null);

    apiClient
      .get('/submissions/ungraded')
      .then((res) => {
        setSubmissions(unwrapData<Submission[]>(res.data));
      })
      .catch((err) => {
        setError(err.message ?? 'Failed to load submissions');
      })
      .finally(() => setLoading(false));
  };

  const startGrading = (submission: Submission) => {
    setGrading(submission.id);
    setScore(submission.grade?.score?.toString() || '');
    setFeedback(submission.grade?.feedback || '');
  };

  const submitGrade = async () => {
    if (!grading) return;

    try {
      await apiClient.post('/grades', {
        submissionId: grading,
        score: parseInt(score, 10),
        feedback: feedback || null,
      });
      setGrading(null);
      setScore('');
      setFeedback('');
      loadSubmissions();
    } catch (error) {
      console.error('Failed to submit grade', error);
    }
  };

  if (authLoading || loading) return <LoadingState label="Loading grading queue…" />;
  if (!user || (user.role !== 'staff' && user.role !== 'admin')) return null;

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>Grading Queue</CardTitle>
      </CardHeader>
      <CardBody>
        {error && <div className="text-sm text-danger mb-4">{error}</div>}

        {grading ? (
          <div className="space-y-4">
            <div className="border rounded p-4">
              <h3 className="font-medium mb-2">Grade Submission</h3>
              <Field label="Score (0-100)" htmlFor="score">
                <TextInput
                  id="score"
                  type="number"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="Enter score"
                />
              </Field>
              <Field label="Feedback (optional)" htmlFor="feedback">
                <TextInput
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Enter feedback"
                />
              </Field>
              <div className="flex gap-2 mt-4">
                <Button onClick={submitGrade} disabled={!score}>
                  Submit Grade
                </Button>
                <Button onClick={() => setGrading(null)} variant="ghost">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableHeaderCell>Course</TableHeaderCell>
              <TableHeaderCell>Quiz</TableHeaderCell>
              <TableHeaderCell>Submitted</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Action</TableHeaderCell>
            </TableHead>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell className="text-sm text-muted-foreground" colSpan={5}>
                    No ungraded submissions
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>{submission.quiz.course.title}</TableCell>
                    <TableCell>{submission.quiz.title}</TableCell>
                    <TableCell>
                      {new Date(submission.submittedAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {submission.grade ? (
                        <Badge tone="success">Graded: {submission.grade.score}</Badge>
                      ) : (
                        <Badge tone="accent">Ungraded</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!submission.grade && (
                        <Button
                          onClick={() => startGrading(submission)}
                          variant="ghost"
                          size="sm"
                        >
                          Grade
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardBody>
    </Card>
  );
}
