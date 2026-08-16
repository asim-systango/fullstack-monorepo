/**
 * A media asset resolved for rendering. Content blocks only store `mediaId`,
 * so responses that need to display media ship this lookup alongside the blocks.
 */
export type ArticleMedia = {
  id: string;
  secureUrl: string;
  resourceType: string;
  width: number | null;
  height: number | null;
  defaultAltText: string | null;
};
