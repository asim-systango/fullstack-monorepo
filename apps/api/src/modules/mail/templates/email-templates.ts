export type EmailContent = {
  subject: string;
  text: string;
  html: string;
};

function appLink(baseUrl: string, path: string, token: string): string {
  const base = baseUrl.replace(/\/$/, '');
  return `${base}${path}?token=${encodeURIComponent(token)}`;
}

export function buildVerificationEmail(
  appPublicUrl: string,
  token: string,
  name?: string,
): EmailContent {
  const link = appLink(appPublicUrl, '/verify-email', token);
  const greeting = name ? `Hi ${name},` : 'Hi,';
  return {
    subject: 'Verify your Splitter account',
    text: `${greeting}\n\nVerify your email address:\n${link}\n\nIf you did not create an account, ignore this email.`,
    html: `<p>${greeting}</p><p>Verify your email address:</p><p><a href="${link}">${link}</a></p><p>If you did not create an account, ignore this email.</p>`,
  };
}

export function buildPasswordResetEmail(
  appPublicUrl: string,
  token: string,
  name?: string,
): EmailContent {
  const link = appLink(appPublicUrl, '/reset-password', token);
  const greeting = name ? `Hi ${name},` : 'Hi,';
  return {
    subject: 'Reset your Splitter password',
    text: `${greeting}\n\nReset your password:\n${link}\n\nIf you did not request this, ignore this email.`,
    html: `<p>${greeting}</p><p>Reset your password:</p><p><a href="${link}">${link}</a></p><p>If you did not request this, ignore this email.</p>`,
  };
}

export function buildGroupInviteEmail(
  appPublicUrl: string,
  token: string,
  groupName: string,
  inviterName: string,
): EmailContent {
  const link = appLink(appPublicUrl, '/invites/accept', token);
  return {
    subject: `You're invited to join ${groupName} on Splitter`,
    text: `${inviterName} invited you to join "${groupName}".\n\nAccept the invite:\n${link}`,
    html: `<p><strong>${inviterName}</strong> invited you to join <strong>${groupName}</strong>.</p><p><a href="${link}">Accept invite</a></p>`,
  };
}
