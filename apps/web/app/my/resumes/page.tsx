'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { PageShell } from '@/components/layout/page-shell';
import { Alert, Button, Card, CardBody, Field, Input, Skeleton } from '@/components/ui';
import { getErrorMessage } from '@/lib/api/errors';
import {
  createResume,
  deleteResume,
  getUploadSignature,
  listResumes,
  updateResume,
  uploadResumeToCloudinary,
} from '@/lib/api/resumes-api';
import { queryKeys } from '@/lib/query/keys';

export default function MyResumesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.resumes,
    queryFn: listResumes,
  });

  const [label, setLabel] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadOk, setUploadOk] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editUrl, setEditUrl] = useState('');

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Choose a PDF (or other document) to upload.');
      const signature = await getUploadSignature();
      const uploaded = await uploadResumeToCloudinary(file, signature);
      return createResume({
        url: uploaded.secure_url,
        cloudinaryPublicId: uploaded.public_id,
        label: label.trim() || undefined,
      });
    },
    onSuccess: async () => {
      setUploadOk('Resume uploaded and saved.');
      setUploadError(null);
      setFile(null);
      setLabel('');
      await queryClient.invalidateQueries({ queryKey: queryKeys.resumes });
    },
    onError: (err) => {
      setUploadOk(null);
      setUploadError(getErrorMessage(err));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteResume(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.resumes }),
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!editId) throw new Error('Nothing to update');
      return updateResume(editId, {
        label: editLabel.trim() || undefined,
        url: editUrl.trim() || undefined,
      });
    },
    onSuccess: async () => {
      setEditId(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.resumes });
    },
  });

  function onUpload(event: { preventDefault(): void }) {
    event.preventDefault();
    setUploadError(null);
    setUploadOk(null);
    uploadMutation.mutate();
  }

  return (
    <PageShell
      title="My resumes"
      description="Upload goes to Cloudinary directly (signed). Metadata is stored via POST /resumes."
    >
      <Card className="mb-6">
        <CardBody>
          <h2 className="text-md font-semibold">Upload resume</h2>
          <form className="mt-4 flex flex-col gap-3" onSubmit={onUpload}>
            {uploadError ? (
              <Alert tone="danger" title="Upload failed">
                {uploadError}
              </Alert>
            ) : null}
            {uploadOk ? (
              <Alert tone="success" title="Saved">
                {uploadOk}
              </Alert>
            ) : null}
            <Field label="Label (optional)">
              {({ id }) => (
                <Input
                  id={id}
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  maxLength={120}
                />
              )}
            </Field>
            <Field label="File" required hint="Uploaded as Cloudinary resource_type=raw">
              {({ id }) => (
                <Input
                  id={id}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  required
                />
              )}
            </Field>
            <Button type="submit" loading={uploadMutation.isPending}>
              Upload & save
            </Button>
          </form>
        </CardBody>
      </Card>

      {isLoading ? <Skeleton className="h-24 w-full" /> : null}
      {isError ? (
        <Alert tone="danger" title="Could not load resumes">
          {getErrorMessage(error)}
        </Alert>
      ) : null}
      {data && data.length === 0 ? (
        <Alert tone="info" title="No resumes yet">
          Upload your first resume above.
        </Alert>
      ) : null}

      <ul className="space-y-3">
        {data?.map((resume) => (
          <li key={resume.id}>
            <Card>
              <CardBody className="space-y-3">
                {editId === resume.id ? (
                  <form
                    className="flex flex-col gap-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      updateMutation.mutate();
                    }}
                  >
                    <Field label="Label">
                      {({ id }) => (
                        <Input
                          id={id}
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                        />
                      )}
                    </Field>
                    <Field label="URL" hint="cloudinaryPublicId is not editable here">
                      {({ id }) => (
                        <Input
                          id={id}
                          type="url"
                          value={editUrl}
                          onChange={(e) => setEditUrl(e.target.value)}
                        />
                      )}
                    </Field>
                    {updateMutation.isError ? (
                      <Alert tone="danger">{getErrorMessage(updateMutation.error)}</Alert>
                    ) : null}
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" loading={updateMutation.isPending}>
                        Save
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-primary">
                        {resume.label || 'Untitled resume'}
                      </p>
                      <a
                        href={resume.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 block break-all text-sm"
                      >
                        {resume.url}
                      </a>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditId(resume.id);
                          setEditLabel(resume.label ?? '');
                          setEditUrl(resume.url);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        loading={deleteMutation.isPending}
                        onClick={() => {
                          if (confirm('Delete this resume?')) {
                            deleteMutation.mutate(resume.id);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
