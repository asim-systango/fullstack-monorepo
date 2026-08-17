import { Card } from '@shared/ui/components';

export default function HelpPage() {
  return (
    <Card className="splitter-shadow mx-auto max-w-xl space-y-3 p-6">
      <h2 className="text-xl font-bold text-foreground">Help & Support</h2>
      <p className="text-sm text-muted-foreground">
        Need help with Splitter? Check your group settings, invite members from a group
        page, and use Activity to review recent changes.
      </p>
      <p className="text-sm text-muted-foreground">
        For account issues, open Settings from the sidebar.
      </p>
    </Card>
  );
}
