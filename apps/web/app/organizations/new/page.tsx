'use client';

import { useEffect, useState, type SyntheticEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Field,
  Form,
  Select,
  TextArea,
  TextInput,
} from '@shared/ui';
import type { OnboardOrganizationPayload } from '@shared/types';
import { useAuth } from '@/components/auth';
import { AppShell } from '@/components/layout/app-shell';
import { TenantPreviewCard } from '@/components/organizations/tenant-preview-card';
import { organizationsApi } from '@/lib/api';
import { ORGANIZATION_ONBOARDING_MESSAGES } from '@/lib/constants';

const INITIAL_FORM_DATA: OnboardOrganizationPayload = {
  name: '',
  primaryDomain: '',
  email: '',
  phone: '',
  industry: 'Software & Technology',
  adminFirstName: '',
  adminLastName: '',
  adminEmail: '',
  adminPhone: '',
  website: '',
  address: '',
  timezone: 'Asia/Kolkata',
};

export default function OnboardOrganizationPage() {
  const router = useRouter();
  const { isAuthenticated, user, loading } = useAuth();

  // Consolidated Single-Object Form State (Industry Standard Pattern)
  const [formData, setFormData] = useState<OnboardOrganizationPayload>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-zinc-400 select-none font-sans">
        <div className="flex items-center space-x-3">
          <svg
            className="animate-spin h-5 w-5 text-violet-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-sm font-medium">Verifying Session...</span>
        </div>
      </div>
    );
  }

  function updateField<K extends keyof OnboardOrganizationPayload>(
    field: K,
    value: OnboardOrganizationPayload[K],
  ) {
    setFormData((prev: OnboardOrganizationPayload) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const {
      name,
      primaryDomain,
      email,
      phone,
      industry,
      adminFirstName,
      adminLastName,
      adminEmail,
    } = formData;

    if (
      !name.trim() ||
      !primaryDomain.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !industry.trim() ||
      !adminFirstName.trim() ||
      !adminLastName.trim() ||
      !adminEmail.trim()
    ) {
      setFormError('Please fill out all required organization and admin fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: OnboardOrganizationPayload = {
        ...formData,
        name: name.trim(),
        primaryDomain: primaryDomain.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        industry: industry.trim(),
        adminFirstName: adminFirstName.trim(),
        adminLastName: adminLastName.trim(),
        adminEmail: adminEmail.trim().toLowerCase(),
        adminPhone: formData.adminPhone?.trim() || undefined,
        website: formData.website?.trim() || undefined,
        address: formData.address?.trim() || undefined,
        timezone: formData.timezone || 'Asia/Kolkata',
      };

      await organizationsApi.onboard(payload);
      router.push('/organizations');
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string | string[] } } })
        ?.response?.data?.message;
      const finalMsg = Array.isArray(errorMsg)
        ? errorMsg.join(', ')
        : errorMsg ||
          (err as Error)?.message ||
          'Failed to onboard organization. Please verify your details.';
      setFormError(finalMsg);
    } finally {
      setIsSubmitting(false);
    }
  }

  const backAction = (
    <Link href="/organizations">
      <Button
        variant="ghost"
        size="sm"
        className="text-xs text-zinc-300 hover:text-white"
      >
        &larr; Back to Directory
      </Button>
    </Link>
  );

  return (
    <AppShell
      title={ORGANIZATION_ONBOARDING_MESSAGES.PAGE_TITLE}
      subtitle={ORGANIZATION_ONBOARDING_MESSAGES.PAGE_SUBTITLE}
      headerActions={backAction}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          {formError && (
            <Alert tone="danger" className="text-xs">
              {formError}
            </Alert>
          )}

          <Form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Corporate Details */}
            <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-5">
              <CardHeader className="p-0 border-b border-zinc-800/80 pb-3">
                <CardTitle className="text-sm font-bold text-violet-400 tracking-wide uppercase">
                  {ORGANIZATION_ONBOARDING_MESSAGES.SECTION_ORG_INFO}
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400 mt-0.5">
                  Official organization identity and primary contact credentials.
                </CardDescription>
              </CardHeader>

              <CardBody className="p-0 space-y-4">
                <Field label="Official Organization Name" htmlFor="org-name" required>
                  <TextInput
                    id="org-name"
                    type="text"
                    placeholder="e.g. Acme Technologies Inc"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    required
                  />
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Primary Domain"
                    htmlFor="org-domain"
                    hint="Used for tenant domain isolation (e.g. acme.com)"
                    required
                  >
                    <TextInput
                      id="org-domain"
                      type="text"
                      placeholder="acme.com"
                      value={formData.primaryDomain}
                      onChange={(e) => updateField('primaryDomain', e.target.value)}
                      required
                    />
                  </Field>

                  <Field label="Corporate Contact Email" htmlFor="org-email" required>
                    <TextInput
                      id="org-email"
                      type="email"
                      placeholder="contact@acme.com"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      required
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Corporate Phone" htmlFor="org-phone" required>
                    <TextInput
                      id="org-phone"
                      type="text"
                      placeholder="+1-555-0199"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      required
                    />
                  </Field>

                  <Field label="Industry Sector" htmlFor="org-industry" required>
                    <Select
                      id="org-industry"
                      value={formData.industry}
                      onChange={(e) => updateField('industry', e.target.value)}
                    >
                      <option value="Software & Technology">
                        Software &amp; Technology
                      </option>
                      <option value="Financial Services">Financial Services</option>
                      <option value="Healthcare & Life Sciences">
                        Healthcare &amp; Life Sciences
                      </option>
                      <option value="E-Commerce & Retail">E-Commerce &amp; Retail</option>
                      <option value="Manufacturing & Logistics">
                        Manufacturing &amp; Logistics
                      </option>
                      <option value="Professional Services">Professional Services</option>
                    </Select>
                  </Field>
                </div>
              </CardBody>
            </Card>

            {/* Section 2: Designated Admin */}
            <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-5">
              <CardHeader className="p-0 border-b border-zinc-800/80 pb-3">
                <CardTitle className="text-sm font-bold text-cyan-400 tracking-wide uppercase">
                  {ORGANIZATION_ONBOARDING_MESSAGES.SECTION_ADMIN_INFO}
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400 mt-0.5">
                  Initial administrator assigned with full tenant management privileges.
                </CardDescription>
              </CardHeader>

              <CardBody className="p-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Admin First Name" htmlFor="admin-fn" required>
                    <TextInput
                      id="admin-fn"
                      type="text"
                      placeholder="Alexander"
                      value={formData.adminFirstName}
                      onChange={(e) => updateField('adminFirstName', e.target.value)}
                      required
                    />
                  </Field>

                  <Field label="Admin Last Name" htmlFor="admin-ln" required>
                    <TextInput
                      id="admin-ln"
                      type="text"
                      placeholder="Wright"
                      value={formData.adminLastName}
                      onChange={(e) => updateField('adminLastName', e.target.value)}
                      required
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Admin Work Email" htmlFor="admin-email" required>
                    <TextInput
                      id="admin-email"
                      type="email"
                      placeholder="alex.wright@acme.com"
                      value={formData.adminEmail}
                      onChange={(e) => updateField('adminEmail', e.target.value)}
                      required
                    />
                  </Field>

                  <Field label="Admin Direct Phone (Optional)" htmlFor="admin-phone">
                    <TextInput
                      id="admin-phone"
                      type="text"
                      placeholder="+1-555-0188"
                      value={formData.adminPhone || ''}
                      onChange={(e) => updateField('adminPhone', e.target.value)}
                    />
                  </Field>
                </div>
              </CardBody>
            </Card>

            {/* Section 3: Optional Details */}
            <Card className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-5">
              <CardHeader className="p-0 border-b border-zinc-800/80 pb-3">
                <CardTitle className="text-sm font-bold text-zinc-400 tracking-wide uppercase">
                  {ORGANIZATION_ONBOARDING_MESSAGES.SECTION_OPTIONAL_INFO}
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400 mt-0.5">
                  Optional website, physical address, and timezone preferences.
                </CardDescription>
              </CardHeader>

              <CardBody className="p-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Website URL" htmlFor="org-website">
                    <TextInput
                      id="org-website"
                      type="text"
                      placeholder="https://acme.com"
                      value={formData.website || ''}
                      onChange={(e) => updateField('website', e.target.value)}
                    />
                  </Field>

                  <Field label="Default Timezone" htmlFor="org-timezone">
                    <Select
                      id="org-timezone"
                      value={formData.timezone}
                      onChange={(e) => updateField('timezone', e.target.value)}
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="UTC">UTC (Universal Coordinated Time)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                    </Select>
                  </Field>
                </div>

                <Field label="Headquarters Address" htmlFor="org-address">
                  <TextArea
                    id="org-address"
                    rows={2}
                    placeholder="100 Innovation Way, Suite 400, San Francisco, CA"
                    value={formData.address || ''}
                    onChange={(e) => updateField('address', e.target.value)}
                  />
                </Field>
              </CardBody>

              <CardFooter className="p-0 pt-4 flex items-center justify-end space-x-3 border-t border-zinc-800/80">
                <Link href="/organizations">
                  <Button type="button" variant="ghost" disabled={isSubmitting}>
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                  loadingText="Onboarding Tenant..."
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-violet-600/25 px-6"
                >
                  Onboard Organization
                </Button>
              </CardFooter>
            </Card>
          </Form>
        </div>

        {/* Right Column: Modular Tenant Preview Card */}
        <div>
          <TenantPreviewCard data={formData} />
        </div>
      </div>
    </AppShell>
  );
}
