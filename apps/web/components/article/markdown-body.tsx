import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const markdownComponents: Components = {
  p: ({ children }) => (
    <p className="mb-6 font-serif text-xl leading-relaxed text-body last:mb-0">
      {children}
    </p>
  ),
  h1: ({ children }) => (
    <h2 className="mt-10 mb-4 font-display text-3xl font-bold tracking-tight text-foreground first:mt-0">
      {children}
    </h2>
  ),
  h2: ({ children }) => (
    <h2 className="mt-10 mb-4 font-display text-3xl font-bold tracking-tight text-foreground first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 mb-4 font-display text-2xl font-bold tracking-tight text-foreground">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-6 mb-4 font-display text-xl font-bold tracking-tight text-foreground">
      {children}
    </h4>
  ),
  h5: ({ children }) => (
    <h5 className="mt-6 mb-3 font-display text-lg font-bold text-foreground">
      {children}
    </h5>
  ),
  h6: ({ children }) => (
    <h6 className="mt-6 mb-3 font-display text-base font-bold text-foreground">
      {children}
    </h6>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-foreground underline decoration-border-strong underline-offset-2 hover:text-brand"
      rel="noopener noreferrer"
      target={href?.startsWith('http') ? '_blank' : undefined}
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em>{children}</em>,
  ul: ({ children }) => (
    <ul className="mb-6 list-disc space-y-2 pl-6 font-serif text-xl leading-relaxed text-body">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-6 list-decimal space-y-2 pl-6 font-serif text-xl leading-relaxed text-body">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="mb-6 border-l-4 border-border-strong pl-4 font-serif text-xl text-muted-foreground italic">
      {children}
    </blockquote>
  ),
  code: ({ className, children }) => {
    const isBlock = Boolean(className);
    if (isBlock) {
      return <code className="font-mono text-sm text-foreground">{children}</code>;
    }
    return (
      <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mb-6 overflow-x-auto rounded-lg bg-surface-muted p-4 text-sm text-foreground">
      {children}
    </pre>
  ),
  hr: () => <hr className="my-8 border-border" />,
};

/**
 * Renders author markdown from a paragraph block. Raw HTML in the source is
 * not executed — react-markdown does not enable rehype-raw.
 */
export function MarkdownBody({ markdown }: Readonly<{ markdown: string }>) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {markdown}
    </ReactMarkdown>
  );
}
