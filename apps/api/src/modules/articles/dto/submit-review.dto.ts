/**
 * Response from POST /articles/:id/submit-review.
 *
 * `publishedRevisionId` is echoed back unchanged as a reminder that submitting
 * for review never publishes anything.
 */
export type SubmittedArticle = {
  id: string;
  submittedRevisionId: string;
  submittedAt: Date;
  /** 1-based position of the submitted revision in the history (v1, v2, v3…). */
  submittedRevisionNumber: number;
  publishedRevisionId: string | null;
};
