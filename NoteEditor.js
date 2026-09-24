import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AUTOSAVE_DELAY = 800;

const NoteEditor = ({ note, onSave, onDelete, onTogglePin, onToggleArchive }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [view, setView] = useState('split'); // 'edit' | 'preview' | 'split'
  const [status, setStatus] = useState('');
  const debounceRef = useRef(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setTagsInput((note.tags || []).join(', '));
      setStatus('');
    }
  }, [note?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const doSave = useCallback(
    (nextTitle, nextContent, nextTags) => {
      if (!note) return;
      setStatus('Saving...');
      onSave(note._id, {
        title: nextTitle,
        content: nextContent,
        tags: nextTags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      }).then(() => setStatus('Saved'));
    },
    [note, onSave]
  );

  const scheduleSave = (nextTitle, nextContent, nextTags) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSave(nextTitle, nextContent, nextTags);
    }, AUTOSAVE_DELAY);
  };

  if (!note) {
    return (
      <div className="editor-empty">
        <h2>Select a note or create a new one</h2>
        <p>Write in Markdown on the left, see it rendered on the right.</p>
      </div>
    );
  }

  return (
    <div className="editor">
      <div className="editor-toolbar">
        <input
          className="title-input"
          value={title}
          placeholder="Untitled Note"
          onChange={(e) => {
            setTitle(e.target.value);
            scheduleSave(e.target.value, content, tagsInput);
          }}
        />
        <div className="toolbar-actions">
          <div className="view-switch">
            <button className={view === 'edit' ? 'active' : ''} onClick={() => setView('edit')}>
              Edit
            </button>
            <button className={view === 'split' ? 'active' : ''} onClick={() => setView('split')}>
              Split
            </button>
            <button className={view === 'preview' ? 'active' : ''} onClick={() => setView('preview')}>
              Preview
            </button>
          </div>
          <button
            className={`pin-btn ${note.isPinned ? 'pinned' : ''}`}
            onClick={() => onTogglePin(note._id)}
            title="Toggle pin"
          >
            📌
          </button>
          <button onClick={() => onToggleArchive(note._id)} title="Archive / unarchive">
            {note.isArchived ? '📤' : '🗄'}
          </button>
          <button className="delete-btn" onClick={() => onDelete(note._id)} title="Delete note">
            🗑
          </button>
        </div>
      </div>

      <input
        className="tags-input"
        value={tagsInput}
        placeholder="tags, separated, by, commas"
        onChange={(e) => {
          setTagsInput(e.target.value);
          scheduleSave(title, content, e.target.value);
        }}
      />

      <div className={`editor-body view-${view}`}>
        {(view === 'edit' || view === 'split') && (
          <textarea
            className="markdown-input"
            value={content}
            placeholder="# Start writing in Markdown..."
            onChange={(e) => {
              setContent(e.target.value);
              scheduleSave(title, e.target.value, tagsInput);
            }}
          />
        )}
        {(view === 'preview' || view === 'split') && (
          <div className="markdown-preview">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content || '*Nothing to preview yet*'}
            </ReactMarkdown>
          </div>
        )}
      </div>

      <div className="editor-status">{status}</div>
    </div>
  );
};

export default NoteEditor;
