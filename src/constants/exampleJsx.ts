export const EXAMPLE_JSX = `import React, { useState, useEffect } from 'react';

const TASKS_INIT = [
  { id: 1, text: 'Design the landing page', done: true },
  { id: 2, text: 'Set up CI/CD pipeline', done: false },
  { id: 3, text: 'Write unit tests', done: false },
];

function ProgressBar({ value, max }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div style={{
      background: '#e2e8f0', border: '3px solid #0f172a',
      height: '28px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        width: pct + '%', height: '100%',
        background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
        transition: 'width 0.4s ease',
      }} />
      <span style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.75rem', fontWeight: 800, color: '#0f172a',
      }}>{pct}%</span>
    </div>
  );
}

export default function TaskTracker() {
  const [tasks, setTasks] = useState(TASKS_INIT);
  const [input, setInput] = useState('');
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const addTask = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setTasks(prev => [...prev, { id: Date.now(), text: trimmed, done: false }]);
    setInput('');
  };

  const toggle = (id) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const remove = (id) =>
    setTasks(prev => prev.filter(t => t.id !== id));

  const done = tasks.filter(t => t.done).length;

  const cardStyle = {
    padding: '2rem', maxWidth: '480px', margin: '2rem auto',
    background: '#ffffff', border: '3px solid #0f172a', color: '#0f172a',
    boxShadow: '6px 6px 0px #0f172a', borderRadius: '8px',
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
  };

  const btnStyle = {
    padding: '0.5rem 1rem', background: '#3b82f6', color: '#fff',
    border: '3px solid #0f172a', boxShadow: '4px 4px 0px #0f172a',
    fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase',
    fontSize: '0.8rem', letterSpacing: '0.05em',
  };

  return (
    <div style={cardStyle}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '1.25rem' }}>
          Task Tracker
        </h2>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem',
          background: '#e2e8f0', padding: '0.3rem 0.6rem',
          border: '2px solid #0f172a', fontWeight: 600,
        }}>
          {clock.toLocaleTimeString()}
        </span>
      </div>

      {/* Progress */}
      <ProgressBar value={done} max={tasks.length} />

      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.5rem 0 1.25rem', fontWeight: 600 }}>
        {done} of {tasks.length} tasks completed
      </p>

      {/* Task list */}
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem' }}>
        {tasks.map(t => (
          <li key={t.id} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.6rem 0', borderBottom: '2px solid #e2e8f0',
          }}>
            <input
              type="checkbox" checked={t.done}
              onChange={() => toggle(t.id)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#3b82f6' }}
            />
            <span style={{
              flex: 1, fontWeight: 600,
              textDecoration: t.done ? 'line-through' : 'none',
              color: t.done ? '#94a3b8' : '#0f172a',
            }}>{t.text}</span>
            <button
              onClick={() => remove(t.id)}
              style={{
                background: 'none', border: '2px solid #ef4444', color: '#ef4444',
                padding: '0.15rem 0.5rem', cursor: 'pointer', fontWeight: 700,
                fontSize: '0.75rem',
              }}
            >✕</button>
          </li>
        ))}
      </ul>

      {/* Add task */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
          placeholder="Add a new task..."
          style={{
            flex: 1, padding: '0.6rem 0.75rem', border: '3px solid #0f172a',
            fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none',
          }}
        />
        <button onClick={addTask} style={btnStyle}>+ Add</button>
      </div>
    </div>
  );
}`;
