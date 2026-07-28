'use client';

import { useState } from 'react';
import { ShellHeader } from '@/components/auth';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Dialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Field,
  Form,
  LoadingState,
  Page,
  Select,
  Separator,
  Skeleton,
  StatusMessage,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TextArea,
  TextInput,
} from '@shared/ui/components';

/**
 * UI kit showcase — shared primitives against the ink/paper theme.
 * Prefer these components over one-off styles on domain pages.
 */
export default function UiShowcasePage() {
  const [agree, setAgree] = useState(false);
  const [pendingDemo, setPendingDemo] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Page className="max-w-4xl">
      <ShellHeader
        title="UI kit"
        subtitle="Ink primary · blue accent for links and focus · @shared/ui/theme.css"
      />
      <p className="mb-8 text-sm text-muted-foreground">
        Shared primitives from <code>@shared/ui/components</code>. Change look-and-feel in
        the theme layer — not in pages. See <a href="#type-scale">type</a>,{' '}
        <a href="#buttons">buttons</a>, and <a href="#loading">loading</a> below.
      </p>

      <section id="type-scale" className="mb-10">
        <h2 className="mb-2 text-lg font-semibold text-foreground">Type & accent</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Page titles use fluid <code>--text-page-title</code>. Body is IBM Plex Sans;
          labels/code use mono.
        </p>
        <div className="space-y-2 rounded-lg border border-border bg-card p-4">
          <p className="ui-page-title">Page title (fluid)</p>
          <p className="text-base text-foreground">Body copy on paper</p>
          <p className="font-mono text-xs text-muted-foreground">mono · status · ids</p>
          <p className="text-sm">
            Accent is for <a href="#buttons">links and focus</a> only — not primary
            buttons.
          </p>
        </div>
      </section>

      <section id="buttons" className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-foreground">
          Buttons (ink primary)
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button size="sm">Small</Button>
          <Button disabled>Disabled</Button>
          <Button loading loadingText="Saving…">
            Save
          </Button>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Badges</h2>
        <div className="flex flex-wrap gap-2">
          <Badge>Neutral</Badge>
          <Badge tone="accent">Accent</Badge>
          <Badge tone="success">Success</Badge>
          <Badge tone="danger">Danger</Badge>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Alerts & status</h2>
        <div className="space-y-3">
          <Alert tone="info" title="Info">
            Prefer semantic tones over raw colors.
          </Alert>
          <Alert tone="success" title="Saved">
            Changes were stored.
          </Alert>
          <Alert tone="danger" title="Request failed">
            Check the network tab or API logs.
          </Alert>
          <StatusMessage tone="neutral">Inline status (forms)</StatusMessage>
          <StatusMessage tone="error">Inline error</StatusMessage>
          <StatusMessage tone="success">Inline success</StatusMessage>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Form controls</h2>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Sample form</CardTitle>
            <CardDescription>
              Focus ring uses <code>ring</code> (accent blue). Primary submit is ink.
            </CardDescription>
          </CardHeader>
          <CardBody>
            <Form
              pending={pendingDemo}
              onSubmit={(e) => {
                e.preventDefault();
                setPendingDemo(true);
                window.setTimeout(() => setPendingDemo(false), 1200);
              }}
            >
              <Field
                label="Name"
                htmlFor="demo-name"
                name="name"
                required
                hint="Shown on your profile"
                disabled={pendingDemo}
              >
                <TextInput id="demo-name" name="name" placeholder="Ada Lovelace" />
              </Field>
              <Field label="Role" htmlFor="demo-role" disabled={pendingDemo}>
                <Select id="demo-role" name="role" defaultValue="user">
                  <option value="user">User</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </Select>
              </Field>
              <Field
                label="Notes"
                htmlFor="demo-notes"
                optional
                error="Keep it under 500 chars"
                disabled={pendingDemo}
              >
                <TextArea id="demo-notes" name="notes" placeholder="Optional notes" />
              </Field>
              <Checkbox
                label="I agree to the demo terms"
                name="agree"
                checked={agree}
                disabled={pendingDemo}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <CardFooter className="mt-0 border-0 px-0 pt-2">
                <Button type="submit" loading={pendingDemo} loadingText="Saving…">
                  Submit
                </Button>
                <Button type="button" variant="ghost" disabled={pendingDemo}>
                  Cancel
                </Button>
              </CardFooter>
            </Form>
          </CardBody>
        </Card>
      </section>

      <section id="loading" className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-foreground">
          Loading / empty (rule #8)
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <LoadingState label="Fetching list…" />
          </Card>
          <Card>
            <LoadingState variant="block" label="Loading detail…" />
          </Card>
          <Card>
            <div className="space-y-2">
              <Skeleton size="line" />
              <Skeleton size="md" />
              <Skeleton size="lg" />
            </div>
          </Card>
          <EmptyState
            title="No items yet"
            description="Create your first domain record to see it here."
            action={<Button size="sm">Create</Button>}
          />
        </div>
      </section>

      <section id="dialog" className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Dialog / Modal</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Native <code>&lt;dialog&gt;</code> with <code>showModal()</code> — Escape, focus
          trap, and backdrop. <code>Modal</code> is an alias of <code>Dialog</code>.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => setDialogOpen(true)}>
            Open dialog
          </Button>
          <Button type="button" variant="secondary" onClick={() => setConfirmOpen(true)}>
            Confirm action
          </Button>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogHeader>
            <DialogTitle>Example dialog</DialogTitle>
            <DialogDescription>
              Use for forms, details, or short workflows. Primary actions stay ink.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Field label="Note" htmlFor="dialog-note" optional>
              <TextInput id="dialog-note" name="note" placeholder="Optional note" />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => setDialogOpen(false)}>
              Save
            </Button>
          </DialogFooter>
        </Dialog>

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogHeader>
            <DialogTitle>Delete item?</DialogTitle>
            <DialogDescription>
              This cannot be undone. Prefer a clear title and one primary action.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={() => setConfirmOpen(false)}>
              Delete
            </Button>
          </DialogFooter>
        </Dialog>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Table</h2>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Role</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Ada</TableCell>
              <TableCell>
                <Badge tone="success">Active</Badge>
              </TableCell>
              <TableCell>
                <span className="font-mono text-xs">admin</span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Grace</TableCell>
              <TableCell>
                <Badge tone="accent">Pending</Badge>
              </TableCell>
              <TableCell>
                <span className="font-mono text-xs">staff</span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <Separator />
      <p className="text-sm text-muted-foreground">
        Import from <code>@shared/ui/components</code>. Add recipes in{' '}
        <code>libs/ui/src/theme/components.css</code>, then wrap them in{' '}
        <code>libs/ui/src/components/</code>.
      </p>
    </Page>
  );
}
