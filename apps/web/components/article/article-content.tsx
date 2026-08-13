import type { PublicContentBlock } from '@/lib/api/articles';

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

export function ArticleContent({ blocks }: Readonly<{ blocks: PublicContentBlock[] }>) {
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
          return (
            <figure key={block.id} className="mb-8">
              <div className="flex aspect-[16/10] items-center justify-center rounded-lg bg-surface-muted text-sm text-muted-foreground">
                {block.alt ?? 'Image'}
              </div>
              {block.caption ? (
                <figcaption className="mt-2 text-center text-sm text-muted-foreground">
                  {block.caption}
                </figcaption>
              ) : null}
            </figure>
          );
        }

        return (
          <p key={block.id} className="mb-6 text-sm text-muted-foreground">
            Unsupported media block
          </p>
        );
      })}
    </div>
  );
}
