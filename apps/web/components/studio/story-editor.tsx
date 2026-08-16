'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { cn } from '@/components/ui';
import { ApiClientError } from '@/lib/api';
import { uploadMedia } from '@/lib/api/media';
import {
  BoldIcon,
  BulletListIcon,
  CodeIcon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  OrderedListIcon,
  QuoteIcon,
  RedoIcon,
  StrikeIcon,
  UndoIcon,
  VideoIcon,
} from './editor-icons';
import { blocksToTiptapDoc, isSafeUrl, tiptapDocToBlocks } from './tiptap-content';
import { StoryImage, StoryVideo } from './tiptap-media-nodes';
import type { StoryBlock } from './story-blocks';
import './story-editor.css';

const TOOL_BUTTON_CLASS =
  'flex h-8 min-w-8 shrink-0 items-center justify-center rounded-md border px-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40';

function toolClass(active: boolean): string {
  return cn(
    TOOL_BUTTON_CLASS,
    active
      ? 'border-foreground bg-surface-muted text-foreground'
      : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground',
  );
}

type ToolbarState = {
  bold: boolean;
  italic: boolean;
  strike: boolean;
  h1: boolean;
  h2: boolean;
  h3: boolean;
  bullet: boolean;
  ordered: boolean;
  quote: boolean;
  code: boolean;
  link: boolean;
  canUndo: boolean;
  canRedo: boolean;
};

const INACTIVE_TOOLBAR: ToolbarState = {
  bold: false,
  italic: false,
  strike: false,
  h1: false,
  h2: false,
  h3: false,
  bullet: false,
  ordered: false,
  quote: false,
  code: false,
  link: false,
  canUndo: false,
  canRedo: false,
};

function readToolbarState(editor: Editor): ToolbarState {
  return {
    bold: editor.isActive('bold'),
    italic: editor.isActive('italic'),
    strike: editor.isActive('strike'),
    h1: editor.isActive('heading', { level: 1 }),
    h2: editor.isActive('heading', { level: 2 }),
    h3: editor.isActive('heading', { level: 3 }),
    bullet: editor.isActive('bulletList'),
    ordered: editor.isActive('orderedList'),
    quote: editor.isActive('blockquote'),
    code: editor.isActive('codeBlock'),
    link: editor.isActive('link'),
    canUndo: editor.can().undo(),
    canRedo: editor.can().redo(),
  };
}

function promptForLink(editor: Editor): void {
  if (editor.isActive('link')) {
    editor.chain().focus().unsetLink().run();
    return;
  }

  const previous = String(editor.getAttributes('link').href ?? '');
  const entered = window.prompt('Link URL', previous || 'https://');
  if (entered === null) return;

  const href = entered.trim();
  if (!href) {
    editor.chain().focus().unsetLink().run();
    return;
  }
  if (!isSafeUrl(href)) return;

  editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
}

type EditorToolbarProps = {
  editor: Editor | null;
  disabled: boolean;
  uploading: boolean;
  onUpload: (kind: 'image' | 'video') => void;
};

function EditorToolbar({
  editor,
  disabled,
  uploading,
  onUpload,
}: Readonly<EditorToolbarProps>) {
  const state =
    useEditorState({
      editor,
      selector: (snapshot) =>
        snapshot.editor ? readToolbarState(snapshot.editor) : INACTIVE_TOOLBAR,
    }) ?? INACTIVE_TOOLBAR;

  const idle = !editor || disabled;

  return (
    <div
      role="toolbar"
      aria-label="Text formatting"
      className="flex flex-wrap items-center gap-1 border-b border-border pb-2"
    >
      <button
        type="button"
        aria-label="Heading 1"
        aria-pressed={state.h1}
        disabled={idle}
        className={toolClass(state.h1)}
        onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        H1
      </button>
      <button
        type="button"
        aria-label="Heading 2"
        aria-pressed={state.h2}
        disabled={idle}
        className={toolClass(state.h2)}
        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </button>
      <button
        type="button"
        aria-label="Heading 3"
        aria-pressed={state.h3}
        disabled={idle}
        className={toolClass(state.h3)}
        onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </button>

      <button
        type="button"
        aria-label="Bold"
        aria-pressed={state.bold}
        disabled={idle}
        className={toolClass(state.bold)}
        onClick={() => editor?.chain().focus().toggleBold().run()}
      >
        <BoldIcon className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Italic"
        aria-pressed={state.italic}
        disabled={idle}
        className={toolClass(state.italic)}
        onClick={() => editor?.chain().focus().toggleItalic().run()}
      >
        <ItalicIcon className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Strikethrough"
        aria-pressed={state.strike}
        disabled={idle}
        className={toolClass(state.strike)}
        onClick={() => editor?.chain().focus().toggleStrike().run()}
      >
        <StrikeIcon className="size-4" />
      </button>

      <button
        type="button"
        aria-label="Bullet list"
        aria-pressed={state.bullet}
        disabled={idle}
        className={toolClass(state.bullet)}
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
      >
        <BulletListIcon className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Ordered list"
        aria-pressed={state.ordered}
        disabled={idle}
        className={toolClass(state.ordered)}
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
      >
        <OrderedListIcon className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Blockquote"
        aria-pressed={state.quote}
        disabled={idle}
        className={toolClass(state.quote)}
        onClick={() => editor?.chain().focus().toggleBlockquote().run()}
      >
        <QuoteIcon className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Code block"
        aria-pressed={state.code}
        disabled={idle}
        className={toolClass(state.code)}
        onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
      >
        <CodeIcon className="size-4" />
      </button>
      <button
        type="button"
        aria-label={state.link ? 'Remove link' : 'Add link'}
        aria-pressed={state.link}
        disabled={idle}
        className={toolClass(state.link)}
        onClick={() => editor && promptForLink(editor)}
      >
        <LinkIcon className="size-4" />
      </button>

      <button
        type="button"
        aria-label="Undo"
        disabled={idle || !state.canUndo}
        className={toolClass(false)}
        onClick={() => editor?.chain().focus().undo().run()}
      >
        <UndoIcon className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Redo"
        disabled={idle || !state.canRedo}
        className={toolClass(false)}
        onClick={() => editor?.chain().focus().redo().run()}
      >
        <RedoIcon className="size-4" />
      </button>

      <button
        type="button"
        aria-label="Add image"
        disabled={idle || uploading}
        className={toolClass(false)}
        onClick={() => onUpload('image')}
      >
        <ImageIcon className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Add video"
        disabled={idle || uploading}
        className={toolClass(false)}
        onClick={() => onUpload('video')}
      >
        <VideoIcon className="size-4" />
      </button>
    </div>
  );
}

const editorExtensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    horizontalRule: false,
    underline: false,
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: 'https',
      protocols: ['http', 'https', 'mailto'],
    },
  }),
  Placeholder.configure({ placeholder: 'Tell your story…' }),
  StoryImage,
  StoryVideo,
];

export type StoryEditorProps = {
  blocks: readonly StoryBlock[];
  onBlocksChange: (blocks: StoryBlock[]) => void;
  disabled?: boolean;
};

export function StoryEditor({
  blocks,
  onBlocksChange,
  disabled = false,
}: Readonly<StoryEditorProps>) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const initialContent = useRef(blocksToTiptapDoc(blocks));

  const editor = useEditor({
    immediatelyRender: false,
    extensions: editorExtensions,
    content: initialContent.current,
    editable: !disabled,
    editorProps: {
      attributes: {
        'aria-label': 'Article content',
      },
    },
    onUpdate: ({ editor: instance }) => {
      onBlocksChange(tiptapDocToBlocks(instance.getJSON()));
    },
  });

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  function requestUpload(kind: 'image' | 'video') {
    const input = kind === 'image' ? imageInputRef.current : videoInputRef.current;
    if (input) {
      input.value = '';
      input.click();
    }
  }

  async function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    setUploadError(null);
    setUploading(true);

    try {
      const media = await uploadMedia(file);
      const mediaNode =
        media.resourceType === 'video'
          ? {
              type: 'storyVideo',
              attrs: { mediaId: media.id, url: media.url, caption: '' },
            }
          : {
              type: 'storyImage',
              attrs: {
                mediaId: media.id,
                url: media.url,
                width: media.width ?? 1600,
                height: media.height ?? 1000,
                alt: media.altText ?? '',
                caption: '',
              },
            };

      editor
        .chain()
        .focus()
        .insertContent([mediaNode, { type: 'paragraph' }])
        .run();
    } catch (error) {
      setUploadError(
        error instanceof ApiClientError ? error.message : 'Could not upload that file.',
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileSelected}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        hidden
        onChange={handleFileSelected}
      />

      <EditorToolbar
        editor={editor}
        disabled={disabled}
        uploading={uploading}
        onUpload={requestUpload}
      />

      {editor ? (
        <div className="story-editor-content">
          <EditorContent editor={editor} />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Loading editor…</p>
      )}

      {uploading ? <p className="text-xs text-muted-foreground">Uploading…</p> : null}

      {uploadError ? (
        <p className="text-sm text-red-600" role="alert">
          {uploadError}
        </p>
      ) : null}
    </div>
  );
}
