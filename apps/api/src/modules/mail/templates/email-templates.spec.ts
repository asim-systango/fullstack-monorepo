import {
  buildGroupInviteEmail,
  buildPasswordResetEmail,
  buildVerificationEmail,
} from './email-templates';

const APP_URL = 'http://localhost:3000';
const TOKEN = 'raw-token+value';

describe('email templates', () => {
  it('builds a Splitter verification email without changing the verify link', () => {
    const email = buildVerificationEmail(APP_URL, TOKEN, 'Ada');

    expect(email.subject).toBe('Verify your Splitter account');
    expect(email.text).toContain(
      'http://localhost:3000/verify-email?token=raw-token%2Bvalue',
    );
    expect(email.html).toContain(
      'http://localhost:3000/verify-email?token=raw-token%2Bvalue',
    );
    expect(email.html).toContain('Verify email address');
    expect(email.html).toContain('Splitter');
  });

  it('builds a Splitter password reset email without changing the reset link', () => {
    const email = buildPasswordResetEmail(APP_URL, TOKEN, 'Ada');

    expect(email.subject).toBe('Reset your Splitter password');
    expect(email.text).toContain(
      'http://localhost:3000/reset-password?token=raw-token%2Bvalue',
    );
    expect(email.html).toContain('Reset password');
  });

  it('builds a Splitter group invite with an Accept invitation button', () => {
    const email = buildGroupInviteEmail(APP_URL, TOKEN, 'Shared Apartment', 'Alex Kim');

    expect(email.subject).toBe("You're invited to join Shared Apartment on Splitter");
    expect(email.text).toContain(
      'Alex Kim invited you to join "Shared Apartment" on Splitter.',
    );
    expect(email.text).toContain(
      'http://localhost:3000/invites/accept?token=raw-token%2Bvalue',
    );
    expect(email.html).toContain('Accept invitation');
    expect(email.html).toContain('/invites/accept?token=raw-token%2Bvalue');
    expect(email.html).toContain('Alex Kim');
    expect(email.html).toContain('Shared Apartment');
  });

  it('escapes untrusted names in HTML while keeping links intact', () => {
    const email = buildGroupInviteEmail(
      APP_URL,
      TOKEN,
      '<script>alert(1)</script>',
      'Eve "Admin"',
    );

    expect(email.html).not.toContain('<script>alert(1)</script>');
    expect(email.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(email.html).toContain('Eve &quot;Admin&quot;');
    expect(email.text).toContain('<script>alert(1)</script>');
    expect(email.html).toContain('/invites/accept?token=raw-token%2Bvalue');
  });
});
