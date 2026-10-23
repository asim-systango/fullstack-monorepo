import {
  Badge,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from '@shared/ui';
import type { OnboardOrganizationPayload } from '@shared/types';

export type TenantPreviewCardProps = Readonly<{
  data: OnboardOrganizationPayload;
}>;

export function TenantPreviewCard({ data }: TenantPreviewCardProps) {
  const derivedSlug = data.primaryDomain.trim()
    ? data.primaryDomain.trim().split('.')[0]
    : 'workspace';

  const adminFullName =
    `${data.adminFirstName || ''} ${data.adminLastName || ''}`.trim() ||
    'Alexander Wright';

  return (
    <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-4 sticky top-8">
      <CardHeader className="p-0 border-b border-zinc-800/80 pb-3">
        <CardTitle className="text-base font-bold text-white">
          Live Tenant Preview
        </CardTitle>
        <CardDescription className="text-xs text-zinc-400 mt-0.5">
          Real-time preview of the provisioned workspace profile.
        </CardDescription>
      </CardHeader>

      <CardBody className="p-0 space-y-4 text-xs">
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 space-y-2">
          <span className="text-zinc-500 block font-medium">Organization Name</span>
          <div className="text-white font-bold text-base truncate">
            {data.name.trim() || 'Acme Technologies Inc'}
          </div>
        </div>

        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 space-y-2">
          <span className="text-zinc-500 block font-medium">
            Derived Workspace Domain
          </span>
          <div className="text-violet-300 font-mono font-semibold text-sm truncate">
            {derivedSlug}.systangocrm.com
          </div>
        </div>

        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 space-y-2">
          <span className="text-zinc-500 block font-medium">Primary Administrator</span>
          <div className="text-zinc-200 font-semibold truncate">{adminFullName}</div>
          <div className="text-zinc-400 text-[11px] truncate">
            {data.adminEmail.trim() || 'alex.wright@acme.com'}
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between pt-1">
          <span className="text-zinc-400 font-medium">Isolation Mode</span>
          <Badge tone="success">Tenant Scoped Schema</Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-zinc-400 font-medium">Default Timezone</span>
          <span className="text-zinc-300 font-mono">
            {data.timezone || 'Asia/Kolkata'}
          </span>
        </div>
      </CardBody>
    </Card>
  );
}
