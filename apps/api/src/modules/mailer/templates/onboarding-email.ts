import { detailsBlock, wrapBooklyEmail } from './layout';

export type OnboardingEmailKind = 'welcome_member' | 'staff_upgrade';

export function buildOnboardingEmail(input: {
  kind: OnboardingEmailKind;
  email: string;
  temporaryPassword: string;
}): { subject: string; text: string; html: string } {
  const isWelcome = input.kind === 'welcome_member';
  const subject = isWelcome
    ? 'Welcome to BOOKLY'
    : 'Your BOOKLY account has been upgraded';
  const headline = isWelcome ? 'Welcome to BOOKLY' : 'You are now Librarian/Staff';
  const intro = isWelcome
    ? 'An administrator created a BOOKLY member account for you. Use the details below to sign in, then change your password immediately.'
    : 'Your BOOKLY account has been upgraded to Librarian/Staff. Use the details below to sign in, then change your password after logging in.';
  const roleLabel = isWelcome ? 'Member' : 'Librarian/Staff';
  const text = [
    intro,
    `Email: ${input.email}`,
    `Temporary password: ${input.temporaryPassword}`,
    `Assigned role: ${roleLabel}`,
    'You must change this password after you log in. Do not share it.',
  ].join('\n');

  const html = wrapBooklyEmail({
    subject,
    headline,
    intro,
    bodyHtml: detailsBlock([
      { label: 'Email', value: input.email },
      { label: 'Temporary password', value: input.temporaryPassword },
      { label: 'Assigned role', value: roleLabel },
    ]),
    noteHtml:
      'Log in and <strong style="color:#1a2332;">change your password immediately</strong>. Do not share this email.',
    footer: `© ${new Date().getFullYear()} BOOKLY · Account onboarding`,
  });

  return { subject, text, html };
}
