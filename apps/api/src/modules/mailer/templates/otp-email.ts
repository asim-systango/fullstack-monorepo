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

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#e8e2d6;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    Your BOOKLY code is ${escapeHtml(input.otp)} — expires in 10 minutes.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#e8e2d6;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">
          <tr>
            <td align="center" style="padding:0 0 28px;">
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:700;letter-spacing:0.18em;color:#1a2332;text-transform:uppercase;">
                BOOKLY
              </div>
              <div style="margin-top:8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#6b7280;">
                Your library companion
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:#fffdf8;border-radius:18px;border:1px solid #d9d0bf;overflow:hidden;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="height:6px;background:#2f5d50;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
                <tr>
                  <td style="padding:36px 32px 28px;">
                    <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.25;font-weight:700;color:#1a2332;">
                      ${escapeHtml(headline)}
                    </h1>
                    <p style="margin:0 0 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#4b5563;">
                      ${escapeHtml(intro)}
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 24px;">
                      <tr>
                        ${otpCells}
                      </tr>
                    </table>
                    <p style="margin:0;text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.5;color:#6b7280;">
                      This code expires in <strong style="color:#1a2332;">10 minutes</strong>.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 32px 32px;">
                    <div style="padding-top:20px;border-top:1px solid #ebe4d6;">
                      <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.55;color:#9ca3af;">
                        If you didn’t request this, you can ignore this email. Someone may have typed your address by mistake.
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:24px 8px 0;">
              <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;line-height:1.5;color:#8b8578;">
                © ${new Date().getFullYear()} BOOKLY · Sent securely for account verification
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
