import { escapeHtml, wrapBooklyEmail } from './layout';

export type OtpEmailPurpose = 'signup' | 'password_reset';

export function buildOtpEmail(input: { otp: string; purpose: OtpEmailPurpose }): {
  subject: string;
  text: string;
  html: string;
} {
  const isSignup = input.purpose === 'signup';
  const subject = isSignup
    ? 'BOOKLY — verify your email'
    : 'BOOKLY — password reset code';
  const headline = isSignup ? 'Verify your email' : 'Reset your password';
  const intro = isSignup
    ? 'Use this code to finish creating your BOOKLY account.'
    : 'Use this code to reset your BOOKLY password.';
  const text = isSignup
    ? `Your BOOKLY verification code is ${input.otp}. It expires in 10 minutes.`
    : `Your BOOKLY password reset code is ${input.otp}. It expires in 10 minutes.`;

  const digits = input.otp
    .split('')
    .map((d) => d.trim())
    .filter(Boolean);
  const otpCells = digits
    .map(
      (digit) => `
                  <td align="center" style="padding:0 4px;">
                    <div style="width:44px;height:56px;line-height:56px;border-radius:10px;background:#f3efe6;border:1px solid #e2d9c8;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:700;color:#1a2332;letter-spacing:0;">
                      ${escapeHtml(digit)}
                    </div>
                  </td>`,
    )
    .join('');

  const bodyHtml = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 24px;">
                      <tr>
                        ${otpCells}
                      </tr>
                    </table>`;

  const html = wrapBooklyEmail({
    subject,
    headline,
    intro,
    bodyHtml,
    noteHtml:
      'This code expires in <strong style="color:#1a2332;">10 minutes</strong>. If you didn’t request this, you can ignore this email.',
    footer: `© ${new Date().getFullYear()} BOOKLY · Sent securely for account verification`,
    preheader: `Your BOOKLY code is ${input.otp} — expires in 10 minutes.`,
  });

  return { subject, text, html };
}
