'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [text, setText] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Load text from backend on page load
  useEffect(() => {
    fetch(`${API_URL}/text`)
      .then(res => res.json())
      .then(data => setText(data.content || ''));
  }, []);

  // Save to backend when text changes
  const handleChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);

    await fetch(`${API_URL}/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newText }),
    });
  };


  return (
    <main style={{ padding: '2rem' }}>
      <h1>📝 Real-Time Editor</h1>
      <textarea
        value={text}
        onChange={handleChange}
        rows={10}
        cols={60}
        style={{ fontSize: '1.1rem', width: '100%', padding: '1rem' }}
      />
    </main>
  );
}
