export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function wrapBooklyEmail(input: {
  subject: string;
  headline: string;
  intro: string;
  bodyHtml: string;
  noteHtml?: string;
  footer: string;
  preheader?: string;
}): string {
  const preheader = input.preheader
    ? `  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    ${escapeHtml(input.preheader)}
  </div>`
    : '';
  const note = input.noteHtml
    ? `                    <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.5;color:#6b7280;">
                      ${input.noteHtml}
                    </p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(input.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#e8e2d6;-webkit-font-smoothing:antialiased;">
${preheader}
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
                      ${escapeHtml(input.headline)}
                    </h1>
                    <p style="margin:0 0 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#4b5563;">
                      ${escapeHtml(input.intro)}
                    </p>
                    ${input.bodyHtml}
                    ${note}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:24px 8px 0;">
              <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;line-height:1.5;color:#8b8578;">
                ${escapeHtml(input.footer)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function detailsBlock(rows: ReadonlyArray<{ label: string; value: string }>): string {
  const items = rows
    .map(
      (row, index) =>
        `<div${index === 0 ? '' : ' style="margin-top:12px;"'}><strong>${escapeHtml(row.label)}</strong><br />${escapeHtml(row.value)}</div>`,
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;background:#f3efe6;border-radius:12px;">
                      <tr>
                        <td style="padding:16px 18px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#1a2332;">
                          ${items}
                        </td>
                      </tr>
                    </table>`;
}
