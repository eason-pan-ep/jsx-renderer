export const EXAMPLE_JSX = `import React, { useState } from 'react';

export default function RetroCounter() {
  const [count, setCount] = useState(0);

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '400px',
      margin: '2rem auto',
      background: '#ffffff',
      border: '3px solid #0f172a',
      color: '#0f172a',
      boxShadow: '6px 6px 0px #0f172a',
      borderRadius: '8px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h2 style={{ marginTop: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        System Status
      </h2>
      <div style={{
        background: '#e2e8f0',
        padding: '1.5rem',
        margin: '1.5rem 0',
        textAlign: 'center',
        border: '3px solid #0f172a',
        fontSize: '2rem',
        fontWeight: 'bold',
      }}>
        Cycles: {count}
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button 
          onClick={() => setCount(c => c - 1)}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: '#ffffff',
            border: '3px solid #0f172a',
            color: '#0f172a',
            boxShadow: '4px 4px 0px #0f172a',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          DECREMENT
        </button>
        <button 
          onClick={() => setCount(c => c + 1)}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: '#3b82f6',
            color: '#ffffff',
            border: '3px solid #0f172a',
            boxShadow: '4px 4px 0px #0f172a',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          INCREMENT
        </button>
      </div>
    </div>
  );
}`;
