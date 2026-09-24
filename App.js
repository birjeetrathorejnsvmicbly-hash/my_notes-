import React, { useState, useEffect, useCallback, useMemo } from 'react';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import SearchBar from './components/SearchBar';
import * as api from './api';

function App() {
  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = { archived: showArchived };
      if (search.trim()) params.search = search.trim();
      const res = await api.getNotes(params);
      setNotes(res.data.data);
      setError('');
    } catch (err) {
      setError('Could not reach the server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [search, showArchived]);

  useEffect(() => {
    const t = setTimeout(fetchNotes, 250); // small debounce for search typing
    return () => clearTimeout(t);
  }, [fetchNotes]);

  const activeNote = useMemo(
    () => notes.find((n) => n._id === activeId) || null,
    [notes, activeId]
  );

  const handleCreate = async () => {
    try {
      const res = await api.createNote({ title: 'Untitled Note', content: '', tags: [] });
      setNotes((prev) => [res.data.data, ...prev]);
      setActiveId(res.data.data._id);
    } catch (err) {
      setError('Failed to create note.');
    }
  };

  const handleSave = async (id, data) => {
    const res = await api.updateNote(id, data);
    setNotes((prev) => prev.map((n) => (n._id === id ? res.data.data : n)));
    return res;
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note? This cannot be undone.')) return;
    await api.deleteNote(id);
    setNotes((prev) => prev.filter((n) => n._id !== id));
    if (activeId === id) setActiveId(null);
  };

  const handleTogglePin = async (id) => {
    const res = await api.togglePin(id);
    setNotes((prev) => prev.map((n) => (n._id === id ? res.data.data : n)));
  };

  const handleToggleArchive = async (id) => {
    const res = await api.toggleArchive(id);
    if (!showArchived) {
      setNotes((prev) => prev.filter((n) => n._id !== id));
      if (activeId === id) setActiveId(null);
    } else {
      setNotes((prev) => prev.map((n) => (n._id === id ? res.data.data : n)));
    }
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>📝 MarkNotes</h1>
          <button className="new-note-btn" onClick={handleCreate}>
            + New
          </button>
        </div>
        <SearchBar value={search} onChange={setSearch} />
        <div className="filter-row">
          <label>
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
            />
            Show archived
          </label>
        </div>
        {error && <div className="error-banner">{error}</div>}
        {loading ? (
          <div className="empty-list">Loading notes...</div>
        ) : (
          <NoteList
            notes={notes}
            activeId={activeId}
            onSelect={setActiveId}
            onDelete={handleDelete}
            onTogglePin={handleTogglePin}
          />
        )}
      </aside>

      <main className="main-content">
        <NoteEditor
          note={activeNote}
          onSave={handleSave}
          onDelete={handleDelete}
          onTogglePin={handleTogglePin}
          onToggleArchive={handleToggleArchive}
        />
      </main>
    </div>
  );
}

export default App;
