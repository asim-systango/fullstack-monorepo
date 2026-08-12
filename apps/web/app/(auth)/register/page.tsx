'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, type SyntheticEvent } from 'react';
import {
  Button,
  Field,
  Form,
  TextInput,
  TextArea,
  Select,
  StatusMessage,
  LoadingState,
  Card,
  Badge,
  Modal,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@shared/ui/components';
import { ApiClientError } from '@shared/api-client';
import { ShellHeader, useAuth } from '@/components/auth';
import { useRegister } from '@/features/auth/hooks/use-auth';
import { registerSchema } from '@/features/auth/validators';

const SPECIALIZATIONS = [
  'General Medicine',
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Neurology',
  'Orthopedics',
  'Psychiatry',
  'Gynecology',
  'Ophthalmology',
  'ENT (Ear, Nose, Throat)',
];

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const registerMutation = useRegister();

  const [role, setRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');
  const [step, setStep] = useState<1 | 2>(1);
  const [showPendingModal, setShowPendingModal] = useState(false);

  // Account details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Doctor onboarding details
  const [specialization, setSpecialization] = useState('General Medicine');
  const [qualification, setQualification] = useState('');
  const [experienceYears, setExperienceYears] = useState('5');
  const [consultationFee, setConsultationFee] = useState('100');
  const [biography, setBiography] = useState('');

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingState label="Redirecting to dashboard..." />
      </div>
    );
  }

  function handleNextStep(e: SyntheticEvent) {
    e.preventDefault();
    setError(null);

    const validation = registerSchema.safeParse({
      role,
      firstName,
      lastName,
      email,
      phone,
      password,
      confirmPassword,
    });

    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message || 'Invalid account details';
      setError(firstError);
      return;
    }

    setStep(2);
  }

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const payload = {
      role,
      firstName,
      lastName,
      email,
      phone: phone.trim() || undefined,
      password,
      confirmPassword,
      ...(role === 'DOCTOR'
        ? {
            specialization,
            qualification: qualification.trim() || 'MBBS',
            experienceYears: Number(experienceYears) || 0,
            consultationFee: Number(consultationFee) || 0,
            biography: biography.trim() || undefined,
          }
        : {}),
    };

    const validation = registerSchema.safeParse(payload);

    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message || 'Invalid form data';
      setError(firstError);
      return;
    }

    try {
      const apiPayload = { ...payload };
      delete (apiPayload as Record<string, unknown>).confirmPassword;
      await registerMutation.mutateAsync(apiPayload);
      if (role === 'DOCTOR') {
        setShowPendingModal(true);
      }
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Registration failed');
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <ShellHeader />

      <main className="flex flex-1 items-center justify-center p-6 my-8">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {role === 'DOCTOR'
                ? 'Doctor Professional Onboarding'
                : 'Create Patient Account'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {role === 'DOCTOR'
                ? 'Join our medical network to manage appointments and treat patients'
                : 'Register as a patient to book consultations and access health records'}
            </p>
          </div>

          {/* Role selector tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-muted rounded-xl">
            <button
              type="button"
              onClick={() => {
                setRole('PATIENT');
                setStep(1);
                setError(null);
              }}
              className={`py-2.5 px-4 text-xs font-semibold rounded-lg transition-all ${
                role === 'PATIENT'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              🧑‍⚕️ Register
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('DOCTOR');
                setError(null);
              }}
              className={`py-2.5 px-4 text-xs font-semibold rounded-lg transition-all ${
                role === 'DOCTOR'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              🩺 Register as Doctor
            </button>
          </div>

          <Card className="p-6">
            {role === 'DOCTOR' && (
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Badge tone={step === 1 ? 'accent' : 'neutral'}>Step 1: Account</Badge>
                  <span className="text-muted-foreground text-xs">→</span>
                  <Badge tone={step === 2 ? 'accent' : 'neutral'}>
                    Step 2: Medical Profile
                  </Badge>
                </div>
                {step === 2 && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    ← Back to Step 1
                  </button>
                )}
              </div>
            )}

            <Form
              pending={registerMutation.isPending}
              onSubmit={role === 'DOCTOR' && step === 1 ? handleNextStep : onSubmit}
              className="space-y-4"
            >
              {/* Step 1: Account Credentials */}
              {(role === 'PATIENT' || step === 1) && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="First Name"
                      htmlFor="reg-fname"
                      required
                      disabled={registerMutation.isPending}
                    >
                      <TextInput
                        id="reg-fname"
                        name="firstName"
                        placeholder={role === 'DOCTOR' ? 'Dr. Sarah' : 'Jane'}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </Field>
                    <Field
                      label="Last Name"
                      htmlFor="reg-lname"
                      required
                      disabled={registerMutation.isPending}
                    >
                      <TextInput
                        id="reg-lname"
                        name="lastName"
                        placeholder="Jenkins"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </Field>
                  </div>

                  <Field
                    label="Email Address"
                    htmlFor="reg-email"
                    required
                    disabled={registerMutation.isPending}
                  >
                    <TextInput
                      id="reg-email"
                      name="email"
                      type="email"
                      placeholder={
                        role === 'DOCTOR'
                          ? 'dr.jenkins@hospital.com'
                          : 'jane.doe@example.com'
                      }
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Field>

                  <Field
                    label="Phone Number"
                    htmlFor="reg-phone"
                    disabled={registerMutation.isPending}
                  >
                    <TextInput
                      id="reg-phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </Field>

                  <Field
                    label="Password"
                    htmlFor="reg-password"
                    required
                    hint="8+ chars with uppercase, lowercase, number, special char"
                    disabled={registerMutation.isPending}
                  >
                    <TextInput
                      id="reg-password"
                      name="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </Field>

                  <Field
                    label="Confirm Password"
                    htmlFor="reg-confirm"
                    required
                    disabled={registerMutation.isPending}
                  >
                    <TextInput
                      id="reg-confirm"
                      name="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </Field>
                </>
              )}

              {/* Step 2: Doctor Professional Profile Onboarding */}
              {role === 'DOCTOR' && step === 2 && (
                <>
                  <Field
                    label="Medical Specialization"
                    htmlFor="doc-spec"
                    required
                    disabled={registerMutation.isPending}
                  >
                    <Select
                      id="doc-spec"
                      name="specialization"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                    >
                      {SPECIALIZATIONS.map((spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field
                    label="Qualifications & Credentials"
                    htmlFor="doc-qual"
                    required
                    hint="e.g. MBBS, MD (Cardiology), FACC"
                    disabled={registerMutation.isPending}
                  >
                    <TextInput
                      id="doc-qual"
                      name="qualification"
                      placeholder="MBBS, MD"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Years of Experience"
                      htmlFor="doc-exp"
                      required
                      disabled={registerMutation.isPending}
                    >
                      <TextInput
                        id="doc-exp"
                        name="experienceYears"
                        type="number"
                        min={0}
                        placeholder="5"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                      />
                    </Field>

                    <Field
                      label="Consultation Fee ($)"
                      htmlFor="doc-fee"
                      required
                      disabled={registerMutation.isPending}
                    >
                      <TextInput
                        id="doc-fee"
                        name="consultationFee"
                        type="number"
                        min={0}
                        placeholder="100"
                        value={consultationFee}
                        onChange={(e) => setConsultationFee(e.target.value)}
                      />
                    </Field>
                  </div>

                  <Field
                    label="Professional Biography"
                    htmlFor="doc-bio"
                    hint="Brief introduction about your clinical background & expertise"
                    disabled={registerMutation.isPending}
                  >
                    <TextArea
                      id="doc-bio"
                      name="biography"
                      rows={3}
                      placeholder="Board-certified specialist dedicated to patient care..."
                      value={biography}
                      onChange={(e) => setBiography(e.target.value)}
                    />
                  </Field>
                </>
              )}

              {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

              {role === 'DOCTOR' && step === 1 ? (
                <Button type="submit" variant="primary" className="w-full mt-2">
                  Continue to Professional Profile →
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  loading={registerMutation.isPending}
                  loadingText="Creating Account..."
                  className="w-full mt-2"
                >
                  {role === 'DOCTOR'
                    ? 'Complete Doctor Onboarding'
                    : 'Create Patient Account'}
                </Button>
              )}
            </Form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Already registered?{' '}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Sign in instead
              </Link>
            </p>
          </Card>
        </div>
      </main>

      {/* Doctor Registration Pending Modal */}
      <Modal
        open={showPendingModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowPendingModal(false);
            router.push('/login');
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            ⏳ Doctor Approval Request Sent
          </DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-3 text-xs text-muted-foreground">
          <p className="text-foreground font-medium">
            Thank you for registering your medical profile, Dr. {firstName} {lastName}.
          </p>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-800 dark:text-amber-300 space-y-1">
            <p className="font-semibold text-xs">Approval Pending Verification</p>
            <p>
              Your account details and credentials have been submitted to hospital
              administration for verification.
            </p>
          </div>
          <p>
            Once an administrator reviews and approves your account status, you will be
            able to log in to the Doctor Portal and manage consultation slots.
          </p>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setShowPendingModal(false);
              router.push('/login');
            }}
          >
            Go to Login
          </Button>
        </DialogFooter>
      </Modal>
    </div>
  );
}
