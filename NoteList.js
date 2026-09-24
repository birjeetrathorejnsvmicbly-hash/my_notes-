import React from 'react';

function stripMarkdown(md = '') {
  return md
    .replace(/[#>*_`~-]/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim();
}

const NoteList = ({ notes, activeId, onSelect, onDelete, onTogglePin }) => {
  if (!notes.length) {
    return <div className="empty-list">No notes yet. Create your first one!</div>;
  }

  return (
    <ul className="note-list">
      {notes.map((note) => (
        <li
          key={note._id}
          className={`note-list-item ${activeId === note._id ? 'active' : ''}`}
          onClick={() => onSelect(note._id)}
        >
          <div className="note-list-item-header">
            <h3>{note.title || 'Untitled Note'}</h3>
            <button
              className={`pin-btn ${note.isPinned ? 'pinned' : ''}`}
              title={note.isPinned ? 'Unpin note' : 'Pin note'}
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(note._id);
              }}
            >
              📌
            </button>
          </div>
          <p className="note-preview">{stripMarkdown(note.content).slice(0, 80) || 'No content'}</p>
          {note.tags?.length > 0 && (
            <div className="tag-row">
              {note.tags.map((tag) => (
                <span key={tag} className="tag-chip">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="note-list-item-footer">
            <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
            <button
              className="delete-btn"
              title="Delete note"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note._id);
              }}
            >
              🗑
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default NoteList;
