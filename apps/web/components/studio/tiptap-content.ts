import type { JSONContent } from '@tiptap/core';
import type { HeadingLevel, StoryBlock } from './story-blocks';

let blockCounter = 0;

function nextBlockId(): string {
  blockCounter += 1;
  return `tiptap-${blockCounter}`;
}

const MARK_WRAP_ORDER = ['code', 'strike', 'italic', 'bold', 'link'] as const;

function isHeadingLevel(value: unknown): value is HeadingLevel {
  return value === 1 || value === 2 || value === 3;
}

function textNodes(text: string, marks?: JSONContent['marks']): JSONContent[] {
  if (!text) return [];
  return marks ? [{ type: 'text', text, marks }] : [{ type: 'text', text }];
}

function applyMark(
  nodes: JSONContent[],
  mark: NonNullable<JSONContent['marks']>[number],
): JSONContent[] {
  return nodes.map((node) => {
    if (node.type !== 'text') return node;
    return { ...node, marks: [...(node.marks ?? []), mark] };
  });
}

function findSingleStarClose(text: string, from: number, end: number): number {
  let index = from;
  while (index < end) {
    if (text[index] === '*' && text[index + 1] !== '*') return index;
    index += text[index] === '*' ? 2 : 1;
  }
  return -1;
}

/** Parse a markdown inline subset into TipTap text nodes. */
export function parseInlineMarkdown(text: string): JSONContent[] {
  return parseInlineRange(text, 0, text.length);
}

function parseInlineRange(text: string, start: number, end: number): JSONContent[] {
  const nodes: JSONContent[] = [];
  let index = start;
  let buffer = '';

  function flush(): void {
    if (!buffer) return;
    nodes.push(...textNodes(buffer));
    buffer = '';
  }

  while (index < end) {
    if (text.startsWith('**', index)) {
      const close = text.indexOf('**', index + 2);
      if (close !== -1 && close < end && close > index + 2) {
        flush();
        nodes.push(
          ...applyMark(parseInlineRange(text, index + 2, close), { type: 'bold' }),
        );
        index = close + 2;
        continue;
      }
    }

    if (text.startsWith('~~', index)) {
      const close = text.indexOf('~~', index + 2);
      if (close !== -1 && close < end && close > index + 2) {
        flush();
        nodes.push(
          ...applyMark(parseInlineRange(text, index + 2, close), { type: 'strike' }),
        );
        index = close + 2;
        continue;
      }
    }

    if (text[index] === '`') {
      const close = text.indexOf('`', index + 1);
      if (close !== -1 && close < end && close > index + 1) {
        flush();
        nodes.push(...textNodes(text.slice(index + 1, close), [{ type: 'code' }]));
        index = close + 1;
        continue;
      }
    }

    if (text[index] === '[') {
      const labelEnd = text.indexOf('](', index + 1);
      const hrefEnd = labelEnd === -1 ? -1 : text.indexOf(')', labelEnd + 2);
      if (labelEnd > index + 1 && hrefEnd > labelEnd + 2 && hrefEnd < end) {
        flush();
        const label = text.slice(index + 1, labelEnd);
        const href = text.slice(labelEnd + 2, hrefEnd);
        const inner = parseInlineRange(label, 0, label.length);
        nodes.push(
          ...applyMark(inner.length > 0 ? inner : textNodes(href), {
            type: 'link',
            attrs: { href },
          }),
        );
        index = hrefEnd + 1;
        continue;
      }
    }

    if (text[index] === '*' && text[index + 1] !== '*') {
      const close = findSingleStarClose(text, index + 1, end);
      if (close !== -1 && close > index + 1) {
        flush();
        nodes.push(
          ...applyMark(parseInlineRange(text, index + 1, close), { type: 'italic' }),
        );
        index = close + 1;
        continue;
      }
    }

    buffer += text[index];
    index += 1;
  }

  flush();
  return nodes;
}

function isBlockStart(line: string): boolean {
  return (
    line.trimStart().startsWith('```') ||
    parseMarkdownHeading(line) !== null ||
    line.startsWith('>') ||
    /^\s*[-*+]\s+/.test(line) ||
    /^\s*\d+\.\s+/.test(line)
  );
}

function parseMarkdownHeading(
  line: string,
): { level: HeadingLevel; text: string } | null {
  let level = 0;
  while (level < 3 && line[level] === '#') level += 1;
  if (!isHeadingLevel(level) || line[level] !== ' ') return null;
  return { level, text: line.slice(level + 1) };
}

function paragraphNode(text: string): JSONContent {
  const content = parseInlineMarkdown(text);
  return content.length > 0 ? { type: 'paragraph', content } : { type: 'paragraph' };
}

function lineAt(lines: readonly string[], index: number): string {
  return lines[index] ?? '';
}

function collectFence(
  lines: string[],
  start: number,
): { node: JSONContent; next: number } {
  const language = lineAt(lines, start).trimStart().slice(3).trim();
  const codeLines: string[] = [];
  let index = start + 1;
  while (index < lines.length && !lineAt(lines, index).trimStart().startsWith('```')) {
    codeLines.push(lineAt(lines, index));
    index += 1;
  }
  if (index < lines.length) index += 1;
  const code = codeLines.join('\n');
  return {
    next: index,
    node: {
      type: 'codeBlock',
      attrs: { language: language || null },
      content: code ? [{ type: 'text', text: code }] : [],
    },
  };
}

function collectQuote(
  lines: string[],
  start: number,
): { node: JSONContent; next: number } {
  const quoteLines: string[] = [];
  let index = start;
  while (index < lines.length) {
    const line = lineAt(lines, index);
    if (line.startsWith('>')) {
      quoteLines.push(line.replace(/^>\s?/, ''));
      index += 1;
      continue;
    }
    if (
      line.trim() === '' &&
      index + 1 < lines.length &&
      lineAt(lines, index + 1).startsWith('>')
    ) {
      quoteLines.push('');
      index += 1;
      continue;
    }
    break;
  }
  const inner = markdownToNodes(quoteLines.join('\n'));
  return {
    next: index,
    node: {
      type: 'blockquote',
      content: inner.length > 0 ? inner : [{ type: 'paragraph' }],
    },
  };
}

function collectList(
  lines: string[],
  start: number,
  itemPattern: RegExp,
  type: 'bulletList' | 'orderedList',
): { node: JSONContent; next: number } {
  const items: JSONContent[] = [];
  let index = start;
  while (index < lines.length && itemPattern.test(lineAt(lines, index))) {
    const itemText = lineAt(lines, index).replace(itemPattern, '');
    items.push({
      type: 'listItem',
      content: [paragraphNode(itemText)],
    });
    index += 1;
  }
  return { next: index, node: { type, content: items } };
}

/** Turn stored paragraph markdown into TipTap block nodes. */
export function markdownToNodes(markdown: string): JSONContent[] {
  const lines = markdown.replaceAll('\r\n', '\n').split('\n');
  const nodes: JSONContent[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lineAt(lines, index);
    if (line.trim() === '') {
      index += 1;
      continue;
    }

    if (line.trimStart().startsWith('```')) {
      const fence = collectFence(lines, index);
      nodes.push(fence.node);
      index = fence.next;
      continue;
    }

    const heading = parseMarkdownHeading(line);
    if (heading) {
      nodes.push({
        type: 'heading',
        attrs: { level: heading.level },
        content: heading.text ? parseInlineMarkdown(heading.text) : [],
      });
      index += 1;
      continue;
    }

    if (line.startsWith('>')) {
      const quote = collectQuote(lines, index);
      nodes.push(quote.node);
      index = quote.next;
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      const list = collectList(lines, index, /^\s*[-*+]\s+/, 'bulletList');
      nodes.push(list.node);
      index = list.next;
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const list = collectList(lines, index, /^\s*\d+\.\s+/, 'orderedList');
      nodes.push(list.node);
      index = list.next;
      continue;
    }

    const paraLines = [line];
    index += 1;
    while (
      index < lines.length &&
      lineAt(lines, index).trim() !== '' &&
      !isBlockStart(lineAt(lines, index))
    ) {
      paraLines.push(lineAt(lines, index));
      index += 1;
    }
    nodes.push(paragraphNode(paraLines.join('\n')));
  }

  return nodes.length > 0 ? nodes : [{ type: 'paragraph' }];
}

function serializeMarks(text: string, marks: JSONContent['marks']): string {
  let result = text;
  const ordered = [...(marks ?? [])].sort(
    (left, right) =>
      MARK_WRAP_ORDER.indexOf(left.type as (typeof MARK_WRAP_ORDER)[number]) -
      MARK_WRAP_ORDER.indexOf(right.type as (typeof MARK_WRAP_ORDER)[number]),
  );

  for (const mark of ordered) {
    if (mark.type === 'code') result = `\`${result}\``;
    else if (mark.type === 'strike') result = `~~${result}~~`;
    else if (mark.type === 'italic') result = `*${result}*`;
    else if (mark.type === 'bold') result = `**${result}**`;
    else if (mark.type === 'link')
      result = `[${result}](${String(mark.attrs?.href ?? '')})`;
  }

  return result;
}

function serializeInline(content: JSONContent[] | undefined): string {
  if (!content) return '';
  return content
    .map((node) => {
      if (node.type === 'hardBreak') return '  \n';
      if (node.type === 'text') return serializeMarks(node.text ?? '', node.marks);
      return serializeInline(node.content);
    })
    .join('');
}

function plainText(node: JSONContent): string {
  if (node.type === 'text') return node.text ?? '';
  if (node.type === 'hardBreak') return '\n';
  return (node.content ?? []).map(plainText).join('');
}

function serializeList(node: JSONContent, ordered: boolean): string {
  return (node.content ?? [])
    .map((item, itemIndex) => {
      const prefix = ordered ? `${itemIndex + 1}. ` : '- ';
      const inner = (item.content ?? [])
        .map((child) => {
          if (child.type === 'paragraph') return serializeInline(child.content);
          if (child.type === 'bulletList') return serializeList(child, false);
          if (child.type === 'orderedList') return serializeList(child, true);
          return serializeInline(child.content);
        })
        .filter(Boolean)
        .join('\n');
      return `${prefix}${inner}`;
    })
    .join('\n');
}

function serializeQuote(node: JSONContent): string {
  const inner = (node.content ?? [])
    .map((child) => nodeToMarkdown(child))
    .filter(Boolean)
    .join('\n');
  return inner
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n');
}

function nodeToMarkdown(node: JSONContent): string {
  switch (node.type) {
    case 'paragraph':
      return serializeInline(node.content);
    case 'heading': {
      const level = isHeadingLevel(node.attrs?.level) ? node.attrs.level : 2;
      return `${'#'.repeat(level)} ${plainText(node).trim()}`;
    }
    case 'codeBlock':
      return `\`\`\`${String(node.attrs?.language ?? '')}\n${plainText(node)}\n\`\`\``;
    case 'bulletList':
      return serializeList(node, false);
    case 'orderedList':
      return serializeList(node, true);
    case 'blockquote':
      return serializeQuote(node);
    default:
      return serializeInline(node.content);
  }
}

function attrString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function nodeToBlocks(node: JSONContent): StoryBlock[] {
  switch (node.type) {
    case 'doc':
      return (node.content ?? []).flatMap(nodeToBlocks);
    case 'paragraph': {
      const markdown = serializeInline(node.content).trim();
      return markdown ? [{ id: nextBlockId(), type: 'paragraph', markdown }] : [];
    }
    case 'heading': {
      const text = plainText(node).trim();
      if (!text) return [];
      const level: HeadingLevel = isHeadingLevel(node.attrs?.level)
        ? node.attrs.level
        : 2;
      return [{ id: nextBlockId(), type: 'heading', level, text }];
    }
    case 'codeBlock': {
      const code = plainText(node).trim();
      if (!code) return [];
      return [
        {
          id: nextBlockId(),
          type: 'code',
          code,
          language: attrString(node.attrs?.language),
        },
      ];
    }
    case 'bulletList':
    case 'orderedList': {
      const markdown = serializeList(node, node.type === 'orderedList').trim();
      return markdown ? [{ id: nextBlockId(), type: 'paragraph', markdown }] : [];
    }
    case 'blockquote': {
      const markdown = serializeQuote(node).trim();
      return markdown ? [{ id: nextBlockId(), type: 'paragraph', markdown }] : [];
    }
    case 'storyImage': {
      const mediaId = attrString(node.attrs?.mediaId);
      if (!mediaId) return [];
      return [
        {
          id: nextBlockId(),
          type: 'image',
          mediaId,
          url: attrString(node.attrs?.url),
          width: Number(node.attrs?.width) || 1600,
          height: Number(node.attrs?.height) || 1000,
          alt: attrString(node.attrs?.alt),
          caption: attrString(node.attrs?.caption),
        },
      ];
    }
    case 'storyVideo': {
      const mediaId = attrString(node.attrs?.mediaId);
      if (!mediaId) return [];
      return [
        {
          id: nextBlockId(),
          type: 'video',
          mediaId,
          url: attrString(node.attrs?.url),
          caption: attrString(node.attrs?.caption),
        },
      ];
    }
    default:
      return (node.content ?? []).flatMap(nodeToBlocks);
  }
}

/** Hydrate TipTap from the existing revision block array. */
export function blocksToTiptapDoc(blocks: readonly StoryBlock[]): JSONContent {
  const content: JSONContent[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case 'paragraph':
        content.push(...markdownToNodes(block.markdown));
        break;
      case 'heading':
        content.push({
          type: 'heading',
          attrs: { level: block.level },
          content: block.text ? [{ type: 'text', text: block.text }] : [],
        });
        break;
      case 'code':
        content.push({
          type: 'codeBlock',
          attrs: { language: block.language || null },
          content: block.code ? [{ type: 'text', text: block.code }] : [],
        });
        break;
      case 'image':
        content.push({
          type: 'storyImage',
          attrs: {
            mediaId: block.mediaId,
            url: block.url,
            width: block.width,
            height: block.height,
            alt: block.alt,
            caption: block.caption,
          },
        });
        break;
      case 'video':
        content.push({
          type: 'storyVideo',
          attrs: {
            mediaId: block.mediaId,
            url: block.url,
            caption: block.caption,
          },
        });
        break;
    }
  }

  return { type: 'doc', content: content.length > 0 ? content : [{ type: 'paragraph' }] };
}

/** Convert the live TipTap document back into the existing block format. */
export function tiptapDocToBlocks(doc: JSONContent): StoryBlock[] {
  const blocks = nodeToBlocks(doc);
  return blocks.length > 0
    ? blocks
    : [{ id: nextBlockId(), type: 'paragraph', markdown: '' }];
}

const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

export function isSafeUrl(href: string): boolean {
  const trimmed = href.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return true;
  try {
    const url = new URL(trimmed);
    return SAFE_PROTOCOLS.has(url.protocol);
  } catch {
    return !trimmed.includes(':');
  }
}
