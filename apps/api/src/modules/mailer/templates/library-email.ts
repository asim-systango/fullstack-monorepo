import { detailsBlock, wrapBooklyEmail } from './layout';

export type LibraryEmailKind =
  | 'checkout'
  | 'due_reminder'
  | 'overdue'
  | 'reservation_available'
  | 'return';

export type LibraryEmailInput = {
  kind: LibraryEmailKind;
  memberName: string;
  bookTitle: string;
  dueDate?: string;
  issuedAt?: string;
  returnedAt?: string;
  overdueDays?: number;
  fineAmountLabel?: string;
};

export function buildLibraryEmail(input: LibraryEmailInput): {
  subject: string;
  text: string;
  html: string;
} {
  const copy = copyFor(input);
  const rows: Array<{ label: string; value: string }> = [
    { label: 'Member', value: input.memberName },
    { label: 'Title', value: input.bookTitle },
  ];
  if (input.issuedAt) rows.push({ label: 'Issued', value: input.issuedAt });
  if (input.dueDate) rows.push({ label: 'Due date', value: input.dueDate });
  if (input.overdueDays != null && input.overdueDays > 0) {
    rows.push({
      label: 'Days overdue',
      value: String(input.overdueDays),
    });
  }
  if (input.returnedAt) rows.push({ label: 'Returned', value: input.returnedAt });
  if (input.fineAmountLabel) {
    rows.push({ label: 'Fine', value: input.fineAmountLabel });
  }

  const html = wrapBooklyEmail({
    subject: copy.subject,
    headline: copy.headline,
    intro: copy.intro,
    bodyHtml: detailsBlock(rows),
    noteHtml: copy.noteHtml,
    footer: `© ${new Date().getFullYear()} BOOKLY · Library notices`,
  });

  const textLines = [
    copy.intro,
    `Member: ${input.memberName}`,
    `Title: ${input.bookTitle}`,
  ];
  if (input.issuedAt) textLines.push(`Issued: ${input.issuedAt}`);
  if (input.dueDate) textLines.push(`Due date: ${input.dueDate}`);
  if (input.overdueDays != null && input.overdueDays > 0) {
    textLines.push(`Days overdue: ${input.overdueDays}`);
  }
  if (input.returnedAt) textLines.push(`Returned: ${input.returnedAt}`);
  if (input.fineAmountLabel) textLines.push(`Fine: ${input.fineAmountLabel}`);

  return { subject: copy.subject, text: textLines.join('\n'), html };
}

function copyFor(input: LibraryEmailInput): {
  subject: string;
  headline: string;
  intro: string;
  noteHtml?: string;
} {
  switch (input.kind) {
    case 'checkout':
      return {
        subject: 'BOOKLY — issue confirmation',
        headline: 'Issue confirmation',
        intro: `Hi ${input.memberName}, a title has been issued on your BOOKLY account.`,
        noteHtml: 'Please return it by the due date to avoid overdue fines.',
      };
    case 'due_reminder':
      return {
        subject: 'BOOKLY — due tomorrow',
        headline: 'Due tomorrow',
        intro: `Hi ${input.memberName}, a loan on your BOOKLY account is due tomorrow.`,
        noteHtml: 'Please return it on time to avoid overdue fines.',
      };
    case 'overdue':
      return {
        subject: 'BOOKLY — overdue loan',
        headline: 'Overdue loan',
        intro: `Hi ${input.memberName}, a loan on your BOOKLY account is now overdue.`,
        noteHtml:
          'Please bring the book to the library desk during opening hours. Do not leave it unattended. Fines continue to accrue until the title is returned.',
      };
    case 'reservation_available':
      return {
        subject: 'BOOKLY — reserved title available',
        headline: 'Your reservation is ready',
        intro: `Hi ${input.memberName}, a title you reserved is now available for pickup.`,
        noteHtml: 'Visit the desk to check it out. Copies are available on a first-come basis.',
      };
    case 'return':
      return {
        subject: 'BOOKLY — return confirmation',
        headline: 'Return confirmation',
        intro: `Hi ${input.memberName}, a title has been returned on your BOOKLY account.`,
        noteHtml: input.fineAmountLabel
          ? 'An overdue fine was recorded for this return.'
          : 'Thank you for returning it.',
      };
  }
}
