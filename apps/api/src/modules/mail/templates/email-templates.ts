export type EmailContent = {
  subject: string;
  text: string;
  html: string;
};

const APP_NAME = 'Splitter';

function appHome(baseUrl: string): string {
  return baseUrl.replace(/\/$/, '');
}

function appLink(baseUrl: string, path: string, token: string): string {
  return `${appHome(baseUrl)}${path}?token=${encodeURIComponent(token)}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function greeting(name?: string): string {
  const trimmed = name?.trim();
  return trimmed ? `Hi ${trimmed},` : 'Hi,';
}

function wrapEmail(args: {
  preheader: string;
  eyebrow: string;
  title: string;
  paragraphs: string[];
  ctaLabel: string;
  ctaUrl: string;
  footer: string;
}): string {
  const paragraphsHtml = args.paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-size:16px;line-height:24px;color:#374151;">${p}</p>`,
    )
    .join('');
  const safeUrl = escapeHtml(args.ctaUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(args.title)}</title>
</head>
<body style="margin:0;padding:0;background:#F3F6F5;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(args.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F6F5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;">
          <tr>
            <td style="padding:0 8px 20px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;letter-spacing:0.08em;color:#0F766E;">${APP_NAME}</p>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;border:1px solid #E5E7EB;border-radius:16px;padding:32px 28px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#0D9488;">${escapeHtml(args.eyebrow)}</p>
              <h1 style="margin:0 0 20px;font-size:24px;line-height:32px;color:#111827;">${escapeHtml(args.title)}</h1>
              ${paragraphsHtml}
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 20px;">
                <tr>
                  <td style="border-radius:10px;background:#0D9488;">
                    <a href="${safeUrl}" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;">${escapeHtml(args.ctaLabel)}</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:13px;line-height:20px;color:#6B7280;">If the button does not work, copy and paste this link into your browser:</p>
              <p style="margin:0;font-size:13px;line-height:20px;word-break:break-all;"><a href="${safeUrl}" style="color:#0F766E;">${safeUrl}</a></p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#6B7280;">
              ${args.footer}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function footerIgnore(home: string): string {
  return `You received this email from ${APP_NAME}. If you were not expecting it, you can ignore it.<br /><a href="${escapeHtml(home)}" style="color:#0F766E;text-decoration:none;">Open ${APP_NAME}</a>`;
}

export function buildVerificationEmail(
  appPublicUrl: string,
  token: string,
  name?: string,
): EmailContent {
  const link = appLink(appPublicUrl, '/verify-email', token);
  const hi = greeting(name);
  const home = appHome(appPublicUrl);

  return {
    subject: `Verify your ${APP_NAME} account`,
    text: `${hi}

Welcome to ${APP_NAME}. Confirm your email so you can start splitting expenses with your groups.

Verify your email address:
${link}

If you did not create a ${APP_NAME} account, you can ignore this email.`,
    html: wrapEmail({
      preheader: `Confirm your email to start using ${APP_NAME}.`,
      eyebrow: APP_NAME,
      title: 'Confirm your email',
      paragraphs: [
        escapeHtml(hi),
        `Welcome to <strong>${APP_NAME}</strong>. Confirm this email address so you can track shared expenses, invite friends, and settle up.`,
      ],
      ctaLabel: 'Verify email address',
      ctaUrl: link,
      footer: footerIgnore(home),
    }),
  };
}

export function buildPasswordResetEmail(
  appPublicUrl: string,
  token: string,
  name?: string,
): EmailContent {
  const link = appLink(appPublicUrl, '/reset-password', token);
  const hi = greeting(name);
  const home = appHome(appPublicUrl);

  return {
    subject: `Reset your ${APP_NAME} password`,
    text: `${hi}

We received a request to reset the password for your ${APP_NAME} account.

Reset your password:
${link}

If you did not request this, you can ignore this email. Your password will stay the same.`,
    html: wrapEmail({
      preheader: `Use this link to reset your ${APP_NAME} password.`,
      eyebrow: APP_NAME,
      title: 'Reset your password',
      paragraphs: [
        escapeHtml(hi),
        `We received a request to reset the password for your ${APP_NAME} account. This link expires after a short time and can be used only once.`,
      ],
      ctaLabel: 'Reset password',
      ctaUrl: link,
      footer: footerIgnore(home),
    }),
  };
}

export function buildGroupInviteEmail(
  appPublicUrl: string,
  token: string,
  groupName: string,
  inviterName: string,
): EmailContent {
  const link = appLink(appPublicUrl, '/invites/accept', token);
  const home = appHome(appPublicUrl);
  const safeGroup = escapeHtml(groupName);
  const safeInviter = escapeHtml(inviterName);

  return {
    subject: `You're invited to join ${groupName} on ${APP_NAME}`,
    text: `${inviterName} invited you to join "${groupName}" on ${APP_NAME}.

Accept the invitation to start splitting expenses with the group:
${link}

If you do not have a ${APP_NAME} account yet, you can create one after you accept.

If you were not expecting this invitation, you can ignore this email.`,
    html: wrapEmail({
      preheader: `${inviterName} invited you to join ${groupName} on ${APP_NAME}.`,
      eyebrow: 'Group invitation',
      title: `Join ${groupName} on ${APP_NAME}`,
      paragraphs: [
        `<strong>${safeInviter}</strong> invited you to join <strong>${safeGroup}</strong> on ${APP_NAME}.`,
        'Accept this invitation to track shared expenses, see balances, and settle up with the group.',
        'If you do not have an account yet, you can create one after you accept — use this same email address.',
      ],
      ctaLabel: 'Accept invitation',
      ctaUrl: link,
      footer: footerIgnore(home),
    }),
  };
}
