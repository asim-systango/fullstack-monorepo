'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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
} from '@shared/ui/components';

interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

interface Question {
  id: string;
  position: number;
  prompt: string;
  type: 'mcq' | 'text';
  choices?: string[];
}

export default function QuizPage() {
  const params = useParams();
  const quizId = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!quizId) return;
    setLoading(true);
    apiClient
      .get(`/quizzes/${quizId}`)
      .then((res) => setQuiz(unwrapData<Quiz>(res.data)))
      .catch(() => setQuiz(null))
      .finally(() => setLoading(false));
  }, [quizId]);

  function setAnswer(qid: string, value: string) {
    setAnswers((s) => ({ ...s, [qid]: value }));
  }

  async function submit() {
    const payload = {
      quizId,
      answers: Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      })),
    };
    try {
      await apiClient.post('/submissions', payload);
      alert('Submission received');
    } catch {
      alert('Submission failed');
    }
  }

  if (loading) return <LoadingState label="Loading quiz…" />;
  if (!quiz)
    return (
      <Page>
        <div>Quiz not found</div>
      </Page>
    );

  return (
    <Page>
      <Card>
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
        </CardHeader>
        <CardBody>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            {quiz.questions?.map((q: Question) => (
              <div key={q.id} className="mb-4">
                <div className="font-medium">
                  {q.position}. {q.prompt}
                </div>
                {q.type === 'mcq' ? (
                  q.choices?.map((choice: string) => (
                    <div key={choice} className="py-1">
                      <label>
                        <input
                          type="radio"
                          name={q.id}
                          value={choice}
                          onChange={() => setAnswer(q.id, choice)}
                        />{' '}
                        {choice}
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="py-1">
                    <textarea
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                      className="ui-textarea"
                    />
                  </div>
                )}
              </div>
            ))}
            <Button type="submit">Submit</Button>
          </form>
        </CardBody>
      </Card>
    </Page>
  );
}
