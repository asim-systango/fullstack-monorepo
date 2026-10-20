'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Category } from '@shared/api-client';
import {
  Alert,
  Badge,
  Button,
  Card,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Page,
  Spinner,
  StatusMessage,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@shared/ui/components';
import { ShellHeader, useAuth } from '@/components/auth';
import { CategoryForm } from '@/components/support-desk/category-form';
import { useCategories, useDeleteCategory } from '@/lib/hooks/use-categories';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { user, loading: isAuthLoading } = useAuth();
  const { data: categories, isLoading, isError, error, refetch } = useCategories();
  const deleteMutation = useDeleteCategory();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.push('/login?returnUrl=/admin/categories');
      } else if (user.role !== 'admin') {
        router.push('/tickets');
      }
    }
  }, [user, isAuthLoading, router]);

  if (isAuthLoading || !user || user.role !== 'admin') {
    return (
      <Page>
        <ShellHeader title="Category Management" />
        <div className="flex items-center justify-center p-12">
          <Spinner label="Checking admin authorization..." />
        </div>
      </Page>
    );
  }

  const handleCreateNew = () => {
    setEditingCategory(null);
    setFormOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync(deletingCategory.id);
      setDeletingCategory(null);
    } catch (err: unknown) {
      setDeleteError(
        err instanceof Error
          ? err.message
          : 'Cannot delete category with active referenced tickets.',
      );
    }
  };

  let content;
  if (isLoading) {
    content = (
      <Card className="flex items-center justify-center p-12">
        <Spinner label="Loading categories..." />
      </Card>
    );
  } else if (isError) {
    content = (
      <Alert tone="danger" title="Unable to load categories">
        <p>
          {error instanceof Error
            ? error.message
            : 'An error occurred while loading ticket categories.'}
        </p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-3"
          onClick={() => void refetch()}
        >
          Retry
        </Button>
      </Alert>
    );
  } else if (!categories?.length) {
    content = (
      <Card className="p-8">
        <EmptyState
          title="No categories found"
          description="There are currently no ticket categories configured."
          action={
            <Button variant="primary" size="sm" onClick={handleCreateNew}>
              Create First Category
            </Button>
          }
        />
      </Card>
    );
  } else {
    content = (
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Category Name</TableHeaderCell>
              <TableHeaderCell>Slug</TableHeaderCell>
              <TableHeaderCell>Description</TableHeaderCell>
              <TableHeaderCell>SLA Targets (Response / Resolution)</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="font-semibold text-foreground">
                  {cat.name}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {cat.slug}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {cat.description || '—'}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 text-xs">
                    {cat.slaPolicies && cat.slaPolicies.length > 0 ? (
                      cat.slaPolicies.map((p) => (
                        <Badge key={p.priority} tone="neutral" className="text-[10px]">
                          <strong className="uppercase">{p.priority}:</strong>{' '}
                          {p.firstResponseHours}h / {p.resolutionHours}h
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-xs">Default</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(cat)}>
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setDeleteError(null);
                        setDeletingCategory(cat);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    );
  }

  return (
    <Page>
      <ShellHeader
        title="Category Management"
        subtitle="Admin portal to manage ticket categories and SLA policy thresholds"
      />

      <div className="mt-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-foreground">Support Desk Categories</h2>
          <Button variant="primary" size="sm" onClick={handleCreateNew}>
            + Add Category
          </Button>
        </div>

        {content}
      </div>

      {formOpen && (
        <CategoryForm
          open={formOpen}
          category={editingCategory}
          onClose={() => setFormOpen(false)}
        />
      )}

      {deletingCategory && (
        <Dialog
          open={Boolean(deletingCategory)}
          onOpenChange={(open) => !open && setDeletingCategory(null)}
        >
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-3">
            {deleteError && <StatusMessage tone="error">{deleteError}</StatusMessage>}
            <p className="text-sm text-foreground">
              Are you sure you want to delete category{' '}
              <strong>{deletingCategory.name}</strong>?
            </p>
            <p className="text-xs text-muted-foreground">
              Category deletion will fail if active tickets are linked to this category.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeletingCategory(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => void handleDeleteConfirm()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </Page>
  );
}
