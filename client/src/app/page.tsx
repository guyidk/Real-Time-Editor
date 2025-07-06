'use client';

import { useEffect, useState } from 'react';

interface NoteFile {
  filename: string;
}

interface Note {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  files?: NoteFile[];
}


export default function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  // Load notes on mount
  useEffect(() => {
    fetch(`${API_URL}/texts`)
      .then(res => res.json())
      .then(data => setNotes(data));
  }, []);

  // Handle saving a new note
  const handleSave = async () => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    files.forEach(file => formData.append('files', file));

    const response = await fetch(`${API_URL}/text`, {
      method: 'POST',
      body: formData,
    });

    const newNote = await response.json();
    setNotes([newNote, ...notes]);
    setTitle('');
    setContent('');
    setFiles([]);
  };


  // View a selected note
  const handleSelectNote = (note: Note) => {
    setSelectedNoteId(note._id);
    setTitle(note.title ?? ''); // fallback to empty string
    setContent(note.content ?? '');
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this note?');
    if (!confirmed) return;

    await fetch(`${API_URL}/text/${id}`, {
      method: 'DELETE',
    });

    // Update UI
    setNotes(notes.filter((note) => note._id !== id));

    // Clear editor if the deleted note is currently selected
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
      setTitle('');
      setContent('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };



  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>📝 Real-Time Editor</h1>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: '0.5rem', fontSize: '1rem', width: '100%', marginBottom: '0.5rem' }}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          cols={60}
          style={{ fontSize: '1.1rem', width: '100%', padding: '1rem' }}
        />
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          style={{ marginBottom: '0.5rem' }}
        />

        <button
          onClick={handleSave}
          style={{
            marginTop: '0.5rem',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            background: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Save Note
        </button>
      </div>

      <h2>📄 Saved Notes</h2>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {notes.map((note) => (
          <li
            key={note._id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
              marginBottom: '1rem',
              padding: '0.75rem',
              border: '1px solid #ccc',
              borderRadius: '6px',
              background: '#fefefe',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button
                onClick={() => handleDelete(note._id)}
                style={{
                  marginRight: '0.5rem',
                  background: 'red',
                  color: 'white',
                  border: 'none',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                title="Delete Note"
              >
                ❌
              </button>

              <button
                onClick={() => handleSelectNote(note)}
                style={{
                  display: 'block',
                  textAlign: 'left',
                  padding: '0.5rem 1rem',
                  flex: 1,
                  background: note._id === selectedNoteId ? '#eaeaea' : '#f9f9f9',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {note.title || '(Untitled)'} - {new Date(note.createdAt).toLocaleString()}
              </button>
            </div>

            {/* ✅ Download links in a separate block below */}
            {Array.isArray(note.files) && note.files.length > 0 && (
              <div style={{ marginLeft: '2.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {note.files.map((file) => (
                  <a
                    key={file.filename}
                    href={`${API_URL}/text/${note._id}/file/${file.filename}`}
                    download
                    style={{ fontSize: '0.9rem', color: '#0070f3', textDecoration: 'underline' }}
                  >
                    📎 {file.filename}
                  </a>
                ))}
              </div>
            )}

          </li>
        ))}
      </ul>


    </main>
  );
}
