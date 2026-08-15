import '../load-env';
import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import dataSource from './data-source';
import { Article } from '../modules/articles/article.entity';
import { Revision } from '../modules/articles/revision.entity';
import type { ContentBlock } from '../modules/articles/types/revision-content';
import { Comment } from '../modules/comments/comment.entity';
import { ArticleTag } from '../modules/tags/article-tag.entity';
import { Tag } from '../modules/tags/tag.entity';

const AUTHOR_EMAIL = 'user@demo.local';
const EDITOR_EMAIL = 'staff@demo.local';
const ADMIN_EMAIL = 'admin@demo.local';

type GatewayUser = { id: string; email: string };

const TAG_GENERATIVE_AI = 'generative ai';
const TAG_OPEN_SOURCE = 'open source';
const TAG_DEVELOPER_TOOLS = 'developer tools';

const TAGS: Array<{ name: string; normalizedName: string }> = [
  { name: 'Generative AI', normalizedName: TAG_GENERATIVE_AI },
  { name: 'Open Source', normalizedName: TAG_OPEN_SOURCE },
  { name: 'Developer Tools', normalizedName: TAG_DEVELOPER_TOOLS },
];

function heading(text: string, level: 2 | 3 = 2): ContentBlock {
  return { id: randomUUID(), type: 'heading', level, text };
}

function paragraph(markdown: string): ContentBlock {
  return { id: randomUUID(), type: 'paragraph', markdown };
}

function code(code: string, language: string): ContentBlock {
  return { id: randomUUID(), type: 'code', code, language };
}

const AGENTS_DRAFT: ContentBlock[] = [
  paragraph(
    'Coding agents can open files, run tests, and open a pull request. That does not mean you should merge on trust. This draft is the short version of a piece on keeping a human in the loop.',
  ),
];

const AGENTS_PUBLISHED: ContentBlock[] = [
  paragraph(
    'By mid-2026 most product teams have tried an AI coding agent. The demos look finished: the agent reads the repo, edits three files, and the tests go green. Then someone merges it, and a week later you find a deleted auth check that no test covered.',
  ),
  heading('What agents are actually good at'),
  paragraph(
    'Agents are strong at mechanical work with a tight feedback loop: renaming a symbol, adding a repository method that matches existing ones, writing the first cut of a test from a function signature. They are weak at product intent. They cannot tell that the “unused” helper is the four-eyes publish rule.',
  ),
  heading('Keep the human on the merge'),
  paragraph(
    'Treat the agent like a fast intern. You still pick the revision that goes live. In this CMS that is the same rule as publishing: an editor points `publishedRevisionId` at an exact revision in one transaction. The blog never “publishes latest.” That is the habit to copy in code review — merge a specific diff, not “whatever the agent did last.”',
  ),
  heading('A small eval you can run this week'),
  paragraph(
    'Before you let an agent touch auth, billing, or publish paths, give it five fixtures that must not regress. If it deletes a CHECK or a four-eyes guard, the eval fails and a person looks. You do not need a research bench. You need a red test.',
  ),
  code(
    `it('keeps four-eyes: editor cannot publish own article', async () => {
  await expect(publish(articleId, { actor: author })).rejects.toThrow();
});`,
    'typescript',
  ),
];

const OPEN_WEIGHT_DRAFT: ContentBlock[] = [
  paragraph(
    'Notes for a story on open-weight models catching up on coding and RAG tasks, and what product teams should change in procurement.',
  ),
];

const OPEN_WEIGHT_PUBLISHED: ContentBlock[] = [
  paragraph(
    'Closed APIs still win on the hardest reasoning tasks. On a lot of product work — classify a ticket, draft a changelog, retrieve four paragraphs from your own docs — open-weight models are close enough that the bill and the data-residency story start to matter more than the leaderboard.',
  ),
  heading('Why this is moving now'),
  paragraph(
    'Weights you can run in your VPC mean prompts and customer text do not have to leave the region. Fine-tunes stay yours. That is why procurement teams who ignored Llama-class models in 2024 are running bake-offs in 2026: not because the chat demo is prettier, but because legal finally has a box they can tick.',
  ),
  heading('What to measure instead of “vibes”'),
  paragraph(
    'Run the same eval set against your hosted API and one open-weight endpoint: groundedness on your docs, tool-call validity, and latency at p95. If the open-weight model is within a few points and cheaper, route the boring traffic there and keep the expensive model for the hard cases. A two-tier router is a product decision, not an ML paper.',
  ),
  heading('The catch'),
  paragraph(
    'You now own serving, upgrades, and eval drift. Open source is not free labor. Budget an engineer for the inference path the same way you budget Cloudinary for images — someone has to keep it alive.',
  ),
];

const RAG_EVAL_DRAFT: ContentBlock[] = [
  paragraph(
    'Most RAG demos fail in production because nobody wrote down what “good” means. This piece walks through a small harness: golden questions, citation checks, and a weekly score you can put on a dashboard.',
  ),
  heading('Start with twenty questions'),
  paragraph(
    'Pick twenty questions real users already ask. For each, store the answer you would accept and the doc ids that must be cited. If the model answers fluently from the wrong PDF, that is a fail — not a “creative” success.',
  ),
  heading('Fail closed on missing citations'),
  paragraph(
    'If the retrieval set is empty, say so. Do not let the model invent a policy. The same invariant as this blog: unpublished slugs 404; they do not leak a draft with a polite warning.',
  ),
];

const COPILOT_EMPTY_STATES: ContentBlock[] = [
  paragraph(
    'Copilot UIs still look like a blank chat box. That trains people to type a novel. Empty states should teach the three jobs the product can actually do this week.',
  ),
  heading('Show the jobs, not the model'),
  paragraph(
    '“Ask anything” is a trap. Offer “Summarize this revision,” “Explain why publish is blocked,” and “Draft a changelog from v2.” Each chip should run a known prompt with known tools. When the model cannot do the job, the chip should be disabled — the same way an author cannot see Publish.',
  ),
  heading('Still a draft'),
  paragraph(
    'This article is not ready for review. The examples need screenshots from the studio editor and a pass from design.',
  ),
];

type SeedArticle = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  tagNames: string[];
  publishedAt: Date | null;
  submitted: boolean;
  revisions: ContentBlock[][];
  comments: Array<{ email: string; body: string }>;
};

function seedArticles(): SeedArticle[] {
  return [
    {
      slug: 'ai-coding-agents-human-in-the-loop',
      title: 'AI coding agents still need a human in the loop',
      metaTitle: 'AI coding agents still need a human in the loop',
      metaDescription:
        'Agents can open PRs. You still merge a specific diff. How to keep a human on publish, auth, and other irreversible paths.',
      tagNames: [TAG_GENERATIVE_AI, TAG_DEVELOPER_TOOLS],
      publishedAt: new Date('2026-08-12T09:30:00+05:30'),
      submitted: false,
      revisions: [AGENTS_DRAFT, AGENTS_PUBLISHED],
      comments: [
        {
          email: EDITOR_EMAIL,
          body: 'This matches how we publish here — pick a revision, do not ship “latest.” I’d lead with the eval snippet.',
        },
        {
          email: ADMIN_EMAIL,
          body: 'Please keep the four-eyes example. Readers keep asking why editors cannot publish their own posts.',
        },
      ],
    },
    {
      slug: 'open-weight-models-product-teams',
      title: 'Open-weight models are catching up. What that means for product teams',
      metaTitle: 'Open-weight models and what product teams should change',
      metaDescription:
        'When to route work to open-weight models, what to measure besides chat quality, and why serving is now a product cost.',
      tagNames: [TAG_GENERATIVE_AI, TAG_OPEN_SOURCE],
      publishedAt: new Date('2026-08-14T11:00:00+05:30'),
      submitted: false,
      revisions: [OPEN_WEIGHT_DRAFT, OPEN_WEIGHT_PUBLISHED],
      comments: [
        {
          email: AUTHOR_EMAIL,
          body: 'The two-tier router point is the one I keep repeating to stakeholders. Latency at p95 hurt us more than the arena score.',
        },
        {
          email: EDITOR_EMAIL,
          body: 'Worth a follow-up on eval drift after a weight drop. We got burned in June.',
        },
      ],
    },
    {
      slug: 'rag-eval-harness-before-you-ship',
      title: 'A practical eval harness for RAG before you ship',
      metaTitle: 'A practical eval harness for RAG before you ship',
      metaDescription:
        'Twenty golden questions, citation checks, and failing closed when retrieval is empty.',
      tagNames: [TAG_GENERATIVE_AI, TAG_DEVELOPER_TOOLS],
      publishedAt: null,
      submitted: true,
      revisions: [RAG_EVAL_DRAFT],
      comments: [],
    },
    {
      slug: 'designing-empty-states-ai-copilots',
      title: 'Designing empty states for AI copilots',
      metaTitle: 'Designing empty states for AI copilots',
      metaDescription:
        'Stop putting a blank chat box on day one. Teach three jobs the copilot can actually do.',
      tagNames: [TAG_GENERATIVE_AI, TAG_DEVELOPER_TOOLS],
      publishedAt: null,
      submitted: false,
      revisions: [COPILOT_EMPTY_STATES],
      comments: [],
    },
  ];
}

async function requireDemoUsers(): Promise<{
  author: GatewayUser;
  editor: GatewayUser;
  admin: GatewayUser;
}> {
  const rows = (await dataSource.query(
    `SELECT id, email FROM users WHERE email = ANY($1)`,
    [[AUTHOR_EMAIL, EDITOR_EMAIL, ADMIN_EMAIL]],
  )) as GatewayUser[];

  const byEmail = new Map(rows.map((row) => [row.email, row]));
  const author = byEmail.get(AUTHOR_EMAIL);
  const editor = byEmail.get(EDITOR_EMAIL);
  const admin = byEmail.get(ADMIN_EMAIL);

  if (!author || !editor || !admin) {
    throw new Error(
      'Gateway demo users are missing. Run `pnpm migration:run` then `pnpm seed` before `pnpm seed:api`.',
    );
  }

  return { author, editor, admin };
}

async function upsertTags(): Promise<Map<string, Tag>> {
  const tags = dataSource.getRepository(Tag);
  const byNormalized = new Map<string, Tag>();

  for (const row of TAGS) {
    let tag = await tags.findOne({ where: { normalizedName: row.normalizedName } });
    if (!tag) {
      tag = await tags.save(tags.create(row));
    }
    byNormalized.set(row.normalizedName, tag);
  }

  return byNormalized;
}

async function seed() {
  await dataSource.initialize();

  try {
    const { author, editor, admin } = await requireDemoUsers();
    const usersByEmail: Record<string, GatewayUser> = {
      [AUTHOR_EMAIL]: author,
      [EDITOR_EMAIL]: editor,
      [ADMIN_EMAIL]: admin,
    };

    const tagByNormalized = await upsertTags();
    const articles = dataSource.getRepository(Article);

    let created = 0;
    let skipped = 0;

    for (const spec of seedArticles()) {
      const existing = await articles.findOne({ where: { slug: spec.slug } });
      if (existing) {
        skipped += 1;
        continue;
      }

      await dataSource.transaction(async (manager) => {
        const articleRepo = manager.getRepository(Article);
        const revisionRepo = manager.getRepository(Revision);
        const articleTagRepo = manager.getRepository(ArticleTag);
        const commentRepo = manager.getRepository(Comment);

        const article = await articleRepo.save(
          articleRepo.create({
            authorId: author.id,
            title: spec.title,
            slug: spec.slug,
            metaTitle: spec.metaTitle,
            metaDescription: spec.metaDescription,
          }),
        );

        const savedRevisions: Revision[] = [];
        for (const content of spec.revisions) {
          savedRevisions.push(
            await revisionRepo.save(
              revisionRepo.create({
                articleId: article.id,
                content,
                createdBy: author.id,
              }),
            ),
          );
        }

        const latest = savedRevisions[savedRevisions.length - 1];
        if (!latest) {
          throw new Error(`Seed article ${spec.slug} is missing revisions`);
        }

        if (spec.publishedAt) {
          article.publishedRevisionId = latest.id;
          article.publishedAt = spec.publishedAt;
        }
        if (spec.submitted) {
          article.submittedRevisionId = latest.id;
          article.submittedAt = new Date();
        }
        if (spec.publishedAt || spec.submitted) {
          await articleRepo.save(article);
        }

        for (const tagName of spec.tagNames) {
          const tag = tagByNormalized.get(tagName);
          if (!tag) {
            throw new Error(`Unknown seed tag "${tagName}"`);
          }
          await articleTagRepo.save(
            articleTagRepo.create({ articleId: article.id, tagId: tag.id }),
          );
        }

        for (const comment of spec.comments) {
          const user = usersByEmail[comment.email];
          if (!user) {
            throw new Error(`Unknown commenter ${comment.email}`);
          }
          await commentRepo.save(
            commentRepo.create({
              articleId: article.id,
              userId: user.id,
              body: comment.body,
            }),
          );
        }
      });

      created += 1;
    }

    console.log('Domain seed complete', {
      tags: TAGS.map((tag) => tag.name),
      created,
      skipped,
    });
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
