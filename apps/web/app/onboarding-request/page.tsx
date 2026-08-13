'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type SyntheticEvent, useEffect } from 'react';
import { ApiClientError } from '@shared/api-client';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  TextInput,
  TextArea,
} from '@shared/ui';
import { formsApi } from '@/lib/api/forms.api';
import { PUBLIC_ONBOARDING_REQUEST_MESSAGES, SYSTEM_MESSAGES } from '@/lib/constants';

export default function OnboardingRequestPage() {
  const router = useRouter();

  // Form State
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [message, setMessage] = useState('');

  // Status State
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (success && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (success && countdown === 0) {
      router.push('/');
    }
    return () => clearTimeout(timer);
  }, [success, countdown, router]);

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!contactName.trim() || !email.trim() || !companyName.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setPending(true);
    setError(null);
    setSuccess(false);

    try {
      await formsApi.submitOnboardingRequest({
        contactName: contactName.trim(),
        email: email.trim(),
        companyName: companyName.trim(),
        phone: phone.trim() || undefined,
        companySize: companySize.trim() || undefined,
        industry: industry.trim() || undefined,
        website: website.trim() || undefined,
        message: message.trim() || undefined,
      });

      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.statusCode === 409) {
          if (err.message.includes('Too many requests')) {
            setError(PUBLIC_ONBOARDING_REQUEST_MESSAGES.ERROR_TOO_MANY_REQUESTS);
          } else {
            setError(PUBLIC_ONBOARDING_REQUEST_MESSAGES.ERROR_ALREADY_EXISTS);
          }
        } else {
          setError(SYSTEM_MESSAGES.GENERIC_SOMETHING_WENT_WRONG);
        }
      } else {
        setError(SYSTEM_MESSAGES.GENERIC_SOMETHING_WENT_WRONG);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] p-6 overflow-hidden select-none font-sans">
      {/* Soft Ambient Background Gradients */}
      <div className="absolute top-0 right-1/4 w-[40rem] h-[40rem] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[35rem] h-[35rem] rounded-full bg-indigo-500/10 blur-[140px] pointer-events-none" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 flex flex-col items-center my-12">
        {/* Brand Logo Header */}
        <Link href="/" className="flex items-center space-x-3 mb-8 group cursor-pointer">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/35 transition-all">
            <div className="w-full h-full bg-zinc-950 rounded-[11px] flex items-center justify-center font-bold text-violet-400 text-xl tracking-wider">
              S
            </div>
          </div>
          <span className="font-bold text-2xl tracking-tight text-white">
            Systango<span className="text-violet-400 font-medium">.crm</span>
          </span>
        </Link>

        {/* Form Card */}
        <Card className="w-full bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 shadow-2xl shadow-black/60">
          <CardHeader className="mb-6 text-center p-0">
            <CardTitle className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {PUBLIC_ONBOARDING_REQUEST_MESSAGES.PAGE_TITLE}
            </CardTitle>
            <CardDescription className="text-sm text-zinc-400 mt-2 leading-relaxed max-w-lg mx-auto">
              {PUBLIC_ONBOARDING_REQUEST_MESSAGES.PAGE_SUBTITLE}
            </CardDescription>
          </CardHeader>

          <CardBody className="p-0">
            {success ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-2xl font-bold mb-2">
                  ✓
                </div>
                <div className="text-lg font-bold text-white text-center">
                  Request Submitted Successfully
                </div>
                <p className="text-sm text-zinc-400 text-center max-w-md">
                  {PUBLIC_ONBOARDING_REQUEST_MESSAGES.SUCCESS_SUBMITTED}
                </p>
                <p className="text-xs text-zinc-500 mt-4 text-center">
                  Redirecting to home in {countdown} seconds...
                </p>
                <Button
                  variant="secondary"
                  className="mt-6"
                  onClick={() => router.push('/')}
                >
                  Return to Home Now
                </Button>
              </div>
            ) : (
              <>
                {/* Error Alert */}
                {error && (
                  <Alert tone="danger" className="mb-6 text-sm">
                    {error}
                  </Alert>
                )}

                <form onSubmit={onSubmit} className="space-y-6 text-left">
                  {/* Row 1: Contact Name & Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Contact Name" htmlFor="contactName" required>
                      <TextInput
                        id="contactName"
                        placeholder="Jane Doe"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        disabled={pending}
                        required
                      />
                    </Field>
                    <Field label="Work Email" htmlFor="email" required>
                      <TextInput
                        id="email"
                        type="email"
                        placeholder="jane@acme.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={pending}
                        required
                      />
                    </Field>
                  </div>

                  {/* Row 2: Company Name & Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Company Name" htmlFor="companyName" required>
                      <TextInput
                        id="companyName"
                        placeholder="Acme Corp"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        disabled={pending}
                        required
                      />
                    </Field>
                    <Field label="Phone Number" htmlFor="phone">
                      <TextInput
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={pending}
                      />
                    </Field>
                  </div>

                  {/* Row 3: Industry & Company Size */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Industry" htmlFor="industry">
                      <TextInput
                        id="industry"
                        placeholder="e.g. Technology, Healthcare"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        disabled={pending}
                      />
                    </Field>
                    <Field label="Company Size" htmlFor="companySize">
                      <TextInput
                        id="companySize"
                        placeholder="e.g. 10-50 employees"
                        value={companySize}
                        onChange={(e) => setCompanySize(e.target.value)}
                        disabled={pending}
                      />
                    </Field>
                  </div>

                  {/* Row 4: Website */}
                  <Field label="Company Website" htmlFor="website">
                    <TextInput
                      id="website"
                      type="url"
                      placeholder="https://acme.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      disabled={pending}
                    />
                  </Field>

                  {/* Row 5: Message */}
                  <Field label="How can we help you?" htmlFor="message">
                    <TextArea
                      id="message"
                      placeholder="Tell us a bit about your CRM needs..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={pending}
                      rows={4}
                    />
                  </Field>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      loading={pending}
                      loadingText="Submitting Request..."
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm tracking-wide shadow-lg shadow-violet-600/20"
                    >
                      Submit Request →
                    </Button>
                  </div>
                </form>
              </>
            )}
          </CardBody>

          {!success && (
            <p className="mt-8 text-xs text-zinc-500 text-center">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
              >
                Sign In
              </Link>
            </p>
          )}
        </Card>

        {/* Footer */}
        <p className="mt-8 text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} Systango Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
}
