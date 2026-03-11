import { useEffect, useRef } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
import './RichTextEditor.css';

const normalizeEditorHtml = (html) => {
  const normalized = String(html || '').trim();
  if (!normalized) return '';
  if (normalized === '<p></p>' || normalized === '<p><br></p>') return '';
  return normalized;
};

const MENU_BUTTONS = [
  { label: 'B', command: (editor) => editor.chain().focus().toggleBold().run(), active: (editor) => editor.isActive('bold') },
  { label: 'I', command: (editor) => editor.chain().focus().toggleItalic().run(), active: (editor) => editor.isActive('italic') },
  { label: 'U', command: (editor) => editor.chain().focus().toggleUnderline().run(), active: (editor) => editor.isActive('underline') },
  { label: 'H2', command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: (editor) => editor.isActive('heading', { level: 2 }) },
  { label: 'H3', command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: (editor) => editor.isActive('heading', { level: 3 }) },
  { label: 'Lista', command: (editor) => editor.chain().focus().toggleBulletList().run(), active: (editor) => editor.isActive('bulletList') },
  { label: 'Num', command: (editor) => editor.chain().focus().toggleOrderedList().run(), active: (editor) => editor.isActive('orderedList') },
  { label: 'Cita', command: (editor) => editor.chain().focus().toggleBlockquote().run(), active: (editor) => editor.isActive('blockquote') },
  { label: 'Izq', command: (editor) => editor.chain().focus().setTextAlign('left').run() },
  { label: 'Centro', command: (editor) => editor.chain().focus().setTextAlign('center').run() },
  { label: 'Der', command: (editor) => editor.chain().focus().setTextAlign('right').run() },
  { label: 'Just', command: (editor) => editor.chain().focus().setTextAlign('justify').run() },
];

const RichTextEditor = ({ value, onChange, onUploadImage }) => {
  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
      }),
      Image,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || '<p></p>',
    editorProps: {
      attributes: {
        class: 'rte-editor-content',
      },
    },
    onUpdate: ({ editor: instance }) => {
      onChange(normalizeEditorHtml(instance.getHTML()));
    },
  });

  useEffect(() => {
    if (!editor) return;

    const next = value || '<p></p>';
    if (editor.getHTML() !== next) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [editor, value]);

  const addLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href || '';
    const url = window.prompt('Ingresá la URL', previousUrl);

    if (url === null) return;
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim(), target: '_blank', rel: 'noopener noreferrer' }).run();
  };

  const addTable = () => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !editor) return;

    try {
      const result = await onUploadImage(file);
      if (!result?.url) throw new Error('No se pudo obtener URL de imagen.');

      editor.chain().focus().setImage({ src: result.url, alt: file.name }).run();
    } catch (error) {
      alert(error.message || 'No se pudo subir la imagen.');
    }
  };

  if (!editor) return null;

  return (
    <div className="rte-root">
      <div className="rte-toolbar">
        {MENU_BUTTONS.map((button) => (
          <button
            key={button.label}
            type="button"
            className={button.active?.(editor) ? 'active' : ''}
            onClick={() => button.command(editor)}
          >
            {button.label}
          </button>
        ))}
        <button type="button" onClick={addLink}>Link</button>
        <button type="button" onClick={handleOpenFilePicker}>Imagen</button>
        <button type="button" onClick={addTable}>Tabla</button>
        <button type="button" onClick={() => editor.chain().focus().undo().run()}>Undo</button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()}>Redo</button>
      </div>

      <EditorContent editor={editor} />

      <div className="rte-table-actions">
        <button type="button" onClick={() => editor.chain().focus().addColumnBefore().run()}>+ Col izq</button>
        <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()}>+ Col der</button>
        <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()}>- Col</button>
        <button type="button" onClick={() => editor.chain().focus().addRowBefore().run()}>+ Fila arriba</button>
        <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()}>+ Fila abajo</button>
        <button type="button" onClick={() => editor.chain().focus().deleteRow().run()}>- Fila</button>
        <button type="button" onClick={() => editor.chain().focus().deleteTable().run()}>Eliminar tabla</button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="rte-hidden-file"
      />
    </div>
  );
};

export default RichTextEditor;
