'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { unwrapData } from '@shared/api-client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  LoadingState,
  Button,
  Field,
  TextInput,
  Select,
  Badge,
} from '@shared/ui/components';
import type { Course, Quiz, Question, Lesson } from '@/lib/interfaces';

export default function InstructorCourseEditor() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonPosition, setLessonPosition] = useState(1);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDueDate, setQuizDueDate] = useState('');
  const [questions, setQuestions] = useState<Array<Question>>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiClient
      .get(`/courses/${id}`)
      .then((res) => setCourse(unwrapData<Course>(res.data)))
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [id]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { type: 'mcq', prompt: '', position: questions.length + 1, choices: [] },
    ]);
  };

  const updateQuestion = (
    index: number,
    field: string,
    value: string | 'mcq' | 'short_answer',
  ) => {
    const updated = [...questions];
    const existingQuestion = updated[index];

    if (!existingQuestion) {
      updated[index] = {
        type: 'mcq',
        prompt: '',
        position: index + 1,
        choices: [],
      };
      setQuestions(updated);
      return;
    }

    const question: Question = {
      type: existingQuestion.type ?? 'mcq',
      prompt: existingQuestion.prompt ?? '',
      position: existingQuestion.position ?? index + 1,
      choices: existingQuestion.choices,
    };

    if (field === 'type') {
      question.type = value as 'mcq' | 'short_answer';
    } else if (field === 'prompt') {
      question.prompt = value;
    }
    updated[index] = question;
    setQuestions(updated);
  };

  const addChoice = (questionIndex: number) => {
    const updated = [...questions];
    if (!updated[questionIndex]) {
      updated[questionIndex] = {
        type: 'mcq',
        prompt: '',
        position: questionIndex + 1,
        choices: [],
      };
    }
    if (updated[questionIndex].choices?.length === 0) {
      updated[questionIndex].choices = [];
    }
    updated[questionIndex].choices = [...(updated[questionIndex].choices || []), ''];
    setQuestions(updated);
  };

  const updateChoice = (questionIndex: number, choiceIndex: number, value: string) => {
    const updated = [...questions];
    if (!updated[questionIndex]) {
      updated[questionIndex] = {
        type: 'mcq',
        prompt: '',
        position: questionIndex + 1,
        choices: [],
      };
    }
    if (updated[questionIndex].choices) {
      updated[questionIndex].choices = [...updated[questionIndex].choices];
      updated[questionIndex].choices[choiceIndex] = value;
    }
    setQuestions(updated);
  };

  const deleteQuestion = (questionIndex: number) => {
    setQuestions((prev) => prev.filter((_, index) => index !== questionIndex));
  };

  const createQuiz = async () => {
    try {
      console.log(questions, '======questions');
      await apiClient.post('/quizzes', {
        courseId: id,
        title: quizTitle,
        dueAt: quizDueDate || null,
        questions: questions.map((q) => ({
          choices: q.choices,
          position: q.position,
          prompt: q.prompt,
          type: q.type,
        })),
      });
      setShowQuizForm(false);
      setQuizTitle('');
      setQuizDueDate('');
      setQuestions([]);
      // Reload course data
      apiClient
        .get(`/courses/${id}`)
        .then((res) => setCourse(unwrapData<Course>(res.data)));
    } catch (error) {
      console.error('Failed to create quiz', error);
    }
  };

  const createLesson = async () => {
    try {
      await apiClient.post('/lessons', {
        courseId: id,
        title: lessonTitle,
        content: lessonContent,
        position: lessonPosition,
      });
      setShowLessonForm(false);
      setLessonTitle('');
      setLessonContent('');
      setLessonPosition(course?.lessons?.length ? course.lessons.length + 1 : 1);
      // Reload course data
      apiClient
        .get(`/courses/${id}`)
        .then((res) => setCourse(unwrapData<Course>(res.data)));
    } catch (error) {
      console.error('Failed to create lesson', error);
    }
  };

  const togglePublish = async () => {
    try {
      const endpoint = course?.publishedAt
        ? `/courses/${id}/unpublish`
        : `/courses/${id}/publish`;
      await apiClient.patch(endpoint);
      // Reload course data
      apiClient
        .get(`/courses/${id}`)
        .then((res) => setCourse(unwrapData<Course>(res.data)));
    } catch (error) {
      console.error('Failed to toggle publish status', error);
    }
  };

  if (loading) return <LoadingState label="Loading course…" />;
  if (!course)
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div>Course not found</div>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => router.back()}
            className="text-sm text-muted-foreground hover:text-ink mb-2"
          >
            ← Back to My Courses
          </button>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground">
            {course.description || 'No description'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={togglePublish}
            variant={course.publishedAt ? 'ghost' : 'primary'}
          >
            {course.publishedAt ? 'Unpublish' : 'Publish'}
          </Button>
          {course.publishedAt && (
            <Button variant="ghost" onClick={() => router.push(`/learn/${course.id}`)}>
              Preview
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Course Content</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Lessons ({course.lessons?.length || 0})</h3>
                <Button onClick={() => setShowLessonForm(!showLessonForm)} size="sm">
                  {showLessonForm ? 'Cancel' : '+ Add Lesson'}
                </Button>
              </div>

              {showLessonForm && (
                <div className="border rounded p-4 space-y-4 mb-4">
                  <Field label="Lesson Title" htmlFor="lesson-title">
                    <TextInput
                      id="lesson-title"
                      value={lessonTitle}
                      onChange={(e) => setLessonTitle(e.target.value)}
                      placeholder="Enter lesson title"
                    />
                  </Field>

                  <Field label="Position" htmlFor="lesson-position">
                    <TextInput
                      id="lesson-position"
                      type="number"
                      value={lessonPosition}
                      onChange={(e) => setLessonPosition(Number(e.target.value))}
                      min="1"
                    />
                  </Field>

                  <Field label="Content" htmlFor="lesson-content">
                    <TextInput
                      id="lesson-content"
                      value={lessonContent}
                      onChange={(e) => setLessonContent(e.target.value)}
                      placeholder="Lesson content"
                    />
                  </Field>

                  <Button onClick={createLesson} disabled={!lessonTitle}>
                    Create Lesson
                  </Button>
                </div>
              )}

              {course.lessons?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No lessons yet</p>
              ) : (
                <ol className="list-decimal pl-6 space-y-2">
                  {course.lessons?.map((l: Lesson) => (
                    <li key={l.id} className="py-1">
                      {l.title}
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Quizzes ({course.quizzes?.length || 0})</h3>
                <Button onClick={() => setShowQuizForm(!showQuizForm)} size="sm">
                  {showQuizForm ? 'Cancel' : '+ Add Quiz'}
                </Button>
              </div>

              {course.quizzes?.map((quiz: Quiz) => (
                <div key={quiz.id} className="mb-3 p-3 border rounded">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{quiz.title}</h4>
                    <Badge tone="accent">{quiz.questions?.length || 0} questions</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {quiz.dueAt
                      ? `Due: ${new Date(quiz.dueAt).toLocaleString()}`
                      : 'No due date'}
                  </p>
                </div>
              ))}

              {showQuizForm && (
                <div className="border rounded p-4 space-y-4 mt-4">
                  <Field label="Quiz Title" htmlFor="quiz-title">
                    <TextInput
                      id="quiz-title"
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      placeholder="Enter quiz title"
                    />
                  </Field>

                  <Field label="Due Date (optional)" htmlFor="quiz-due">
                    <TextInput
                      id="quiz-due"
                      type="datetime-local"
                      value={quizDueDate}
                      onChange={(e) => setQuizDueDate(e.target.value)}
                    />
                  </Field>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Questions</p>
                      <Button onClick={addQuestion} variant="ghost" size="sm">
                        + Add Question
                      </Button>
                    </div>

                    {questions.map((q, qIndex) => (
                      <div key={qIndex} className="border rounded p-3 mb-3 space-y-2">
                        <div className="flex gap-2">
                          <Select
                            value={q.type}
                            onChange={(e) =>
                              updateQuestion(qIndex, 'type', e.target.value)
                            }
                            className="w-32"
                          >
                            <option value="mcq">Multiple Choice</option>
                            <option value="short_answer">Short Answer</option>
                          </Select>
                          <TextInput
                            value={q.prompt}
                            onChange={(e) =>
                              updateQuestion(qIndex, 'prompt', e.target.value)
                            }
                            placeholder="Question prompt"
                            className="flex-1"
                          />
                          <Button
                            onClick={() => deleteQuestion(qIndex)}
                            variant="danger"
                            size="sm"
                          >
                            Delete
                          </Button>
                        </div>

                        {q.type === 'mcq' && (
                          <div className="ml-4 space-y-1">
                            <p className="text-xs text-muted-foreground">Choices:</p>
                            {q.choices?.map((choice, cIndex) => (
                              <div key={cIndex} className="flex gap-2">
                                <TextInput
                                  value={choice}
                                  onChange={(e) =>
                                    updateChoice(qIndex, cIndex, e.target.value)
                                  }
                                  placeholder={`Choice ${cIndex + 1}`}
                                  className="flex-1"
                                />
                              </div>
                            ))}
                            <Button
                              onClick={() => addChoice(qIndex)}
                              variant="ghost"
                              size="sm"
                            >
                              + Add Choice
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={createQuiz}
                    disabled={!quizTitle || questions.length === 0}
                  >
                    Create Quiz
                  </Button>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Course Stats</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge tone={course.publishedAt ? 'success' : 'accent'}>
                  {course.publishedAt ? 'Published' : 'Draft'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lessons</span>
                <span className="font-medium">{course.lessons?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quizzes</span>
                <span className="font-medium">{course.quizzes?.length || 0}</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
