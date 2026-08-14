import Image from 'next/image';
import type { ArticleMedia, PublicContentBlock } from '@/lib/api/articles';
import { toMediaLookup } from './content-blocks';

function Paragraph({ markdown }: Readonly<{ markdown: string }>) {
  const paragraphs = markdown
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <>
      {paragraphs.map((part, index) => (
        <p
          key={`${index}-${part.length}`}
          className="mb-6 font-serif text-xl leading-relaxed text-body last:mb-0"
        >
          {part.split('\n').map((line, lineIndex, lines) => (
            <span key={`${lineIndex}-${line.length}`}>
              {line}
              {lineIndex < lines.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
      ))}
    </>
  );
}

function Caption({ text }: Readonly<{ text?: string }>) {
  if (!text) return null;
  return (
    <figcaption className="mt-2 text-center text-sm text-muted-foreground">
      {text}
    </figcaption>
  );
}

function MissingMedia({ label }: Readonly<{ label: string }>) {
  return (
    <div className="flex aspect-[16/10] items-center justify-center rounded-lg bg-surface-muted text-sm text-muted-foreground">
      {label}
    </div>
  );
}

type ArticleContentProps = {
  blocks: PublicContentBlock[];
  /** Resolves the `mediaId` on image and video blocks to a deliverable URL. */
  media?: ArticleMedia[];
};

export function ArticleContent({ blocks, media = [] }: Readonly<ArticleContentProps>) {
  const mediaById = toMediaLookup(media);

  if (blocks.length === 0) {
    return (
      <p className="font-serif text-xl text-muted-foreground">
        This story has no content yet.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-content">
      {blocks.map((block) => {
        if (block.type === 'paragraph') {
          return <Paragraph key={block.id} markdown={block.markdown} />;
        }

        if (block.type === 'heading') {
          const className =
            'mb-4 font-display font-bold tracking-tight text-foreground first:mt-0';
          if (block.level <= 2) {
            return (
              <h2 key={block.id} className={`${className} mt-10 text-3xl`}>
                {block.text}
              </h2>
            );
          }
          if (block.level === 3) {
            return (
              <h3 key={block.id} className={`${className} mt-8 text-2xl`}>
                {block.text}
              </h3>
            );
          }
          return (
            <h4 key={block.id} className={`${className} mt-6 text-xl`}>
              {block.text}
            </h4>
          );
        }

        if (block.type === 'code') {
          return (
            <pre
              key={block.id}
              className="mb-6 overflow-x-auto rounded-lg bg-surface-muted p-4 text-sm text-foreground"
            >
              <code>{block.code}</code>
            </pre>
          );
        }

        if (block.type === 'image') {
          const asset = mediaById.get(block.mediaId);
          return (
            <figure key={block.id} className="mb-8">
              {asset ? (
                <Image
                  src={asset.secureUrl}
                  alt={block.alt ?? asset.defaultAltText ?? ''}
                  width={asset.width ?? 1600}
                  height={asset.height ?? 1000}
                  sizes="(max-width: 768px) 100vw, 672px"
                  className="h-auto w-full rounded-lg"
                />
              ) : (
                <MissingMedia label={block.alt ?? 'Image unavailable'} />
              )}
              <Caption text={block.caption} />
            </figure>
          );
        }

        const asset = mediaById.get(block.mediaId);
        return (
          <figure key={block.id} className="mb-8">
            {asset ? (
              <video
                src={asset.secureUrl}
                controls
                preload="metadata"
                className="w-full rounded-lg bg-black"
              />
            ) : (
              <MissingMedia label="Video unavailable" />
            )}
            <Caption text={block.caption} />
          </figure>
        );
      })}
    </div>
  );
}
