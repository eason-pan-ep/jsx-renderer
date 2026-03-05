export const EXAMPLE_JSX = `import React, { useState, useEffect, useCallback } from 'react';

const ROWS = 9, COLS = 9, MINES = 10;

function createBoard() {
  const board = Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => ({
      r, c, mine: false, revealed: false, flagged: false, adjacent: 0,
    }))
  );
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (!board[r][c].mine) { board[r][c].mine = true; placed++; }
  }
  const dirs = [-1, 0, 1];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (!board[r][c].mine)
        dirs.forEach(dr => dirs.forEach(dc => {
          if (dr === 0 && dc === 0) return;
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].mine)
            board[r][c].adjacent++;
        }));
  return board;
}

function flood(board, r, c) {
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
  const cell = board[r][c];
  if (cell.revealed || cell.flagged || cell.mine) return;
  cell.revealed = true;
  if (cell.adjacent === 0) {
    [-1, 0, 1].forEach(dr => [-1, 0, 1].forEach(dc => {
      if (dr !== 0 || dc !== 0) flood(board, r + dr, c + dc);
    }));
  }
}

const NUM_COLORS = {
  1: '#2563eb', 2: '#16a34a', 3: '#dc2626',
  4: '#7c3aed', 5: '#b91c1c', 6: '#0d9488',
  7: '#0f172a', 8: '#64748b',
};

export default function Minesweeper() {
  const [board, setBoard] = useState(createBoard);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [timer, setTimer] = useState(0);
  const [started, setStarted] = useState(false);
  const [firstClick, setFirstClick] = useState(true);

  useEffect(() => {
    if (!started || gameOver || won) return;
    const id = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [started, gameOver, won]);

  const checkWin = useCallback((b) => {
    const allSafe = b.flat().filter(c => !c.mine).every(c => c.revealed);
    if (allSafe) { setWon(true); return true; }
    return false;
  }, []);

  const safeFirstClick = (b, r, c) => {
    while (b[r][c].mine) {
      b[r][c].mine = false;
      let placed = false;
      while (!placed) {
        const nr = Math.floor(Math.random() * ROWS);
        const nc = Math.floor(Math.random() * COLS);
        if (!b[nr][nc].mine && !(nr === r && nc === c)) {
          b[nr][nc].mine = true; placed = true;
        }
      }
    }
    // Recalc adjacency
    const dirs = [-1, 0, 1];
    for (let rr = 0; rr < ROWS; rr++)
      for (let cc = 0; cc < COLS; cc++) {
        if (b[rr][cc].mine) continue;
        b[rr][cc].adjacent = 0;
        dirs.forEach(dr => dirs.forEach(dc => {
          if (dr === 0 && dc === 0) return;
          const nr = rr + dr, nc = cc + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && b[nr][nc].mine)
            b[rr][cc].adjacent++;
        }));
      }
  };

  const handleClick = (r, c) => {
    if (gameOver || won) return;
    const next = board.map(row => row.map(cell => ({ ...cell })));
    const cell = next[r][c];
    if (cell.revealed || cell.flagged) return;
    if (!started) setStarted(true);
    if (firstClick) { safeFirstClick(next, r, c); setFirstClick(false); }
    if (cell.mine) {
      next.forEach(row => row.forEach(c => { if (c.mine) c.revealed = true; }));
      setBoard(next);
      setGameOver(true);
      return;
    }
    flood(next, r, c);
    setBoard(next);
    checkWin(next);
  };

  const handleContext = (e, r, c) => {
    e.preventDefault();
    if (gameOver || won) return;
    const cell = board[r][c];
    if (cell.revealed) return;
    const next = board.map(row => row.map(cell => ({ ...cell })));
    next[r][c].flagged = !next[r][c].flagged;
    setBoard(next);
  };

  const reset = () => {
    setBoard(createBoard());
    setGameOver(false);
    setWon(false);
    setTimer(0);
    setStarted(false);
    setFirstClick(true);
  };

  const flags = board.flat().filter(c => c.flagged).length;
  const fmtTime = (s) => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');

  const smiley = won ? '😎' : gameOver ? '💀' : '🙂';

  return (
    <div style={{
      padding: '1.5rem', maxWidth: '400px', margin: '2rem auto',
      background: '#ffffff', border: '3px solid #0f172a', color: '#0f172a',
      boxShadow: '6px 6px 0px #0f172a', borderRadius: '8px',
      fontFamily: "'Space Grotesk', system-ui, sans-serif",
    }}>
      <h2 style={{ margin: '0 0 0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '1.15rem', textAlign: 'center' }}>
        💣 Minesweeper
      </h2>

      {/* Controls */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '0.75rem', padding: '0.4rem 0.6rem',
        background: '#f1f5f9', border: '2px solid #0f172a',
        fontSize: '0.85rem', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
      }}>
        <span>🚩 {MINES - flags}</span>
        <button onClick={reset} style={{
          background: '#fff', border: '2px solid #0f172a', borderRadius: '4px',
          fontSize: '1.5rem', cursor: 'pointer', padding: '0.1rem 0.5rem',
          lineHeight: 1, boxShadow: '2px 2px 0px #0f172a',
        }}>{smiley}</button>
        <span>⏱ {fmtTime(timer)}</span>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(' + COLS + ', 1fr)',
        gap: '2px', border: '3px solid #0f172a', padding: '2px',
        background: '#cbd5e1',
      }}>
        {board.flat().map(cell => {
          let bg = '#e2e8f0';
          let content = '';
          let color = '#0f172a';
          let fontWeight = 800;
          let fontSize = '0.85rem';

          if (cell.revealed) {
            if (cell.mine) {
              bg = gameOver && !won ? '#fecaca' : '#e2e8f0';
              content = '💣';
              fontSize = '0.9rem';
            } else {
              bg = '#ffffff';
              if (cell.adjacent > 0) {
                content = String(cell.adjacent);
                color = NUM_COLORS[cell.adjacent] || '#0f172a';
              }
            }
          } else if (cell.flagged) {
            content = '🚩';
            fontSize = '0.85rem';
          }

          return (
            <button key={cell.r + '-' + cell.c}
              onClick={() => handleClick(cell.r, cell.c)}
              onContextMenu={(e) => handleContext(e, cell.r, cell.c)}
              style={{
                aspectRatio: '1', border: 'none', background: bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: cell.revealed ? 'default' : 'pointer',
                fontSize, fontWeight, color,
                fontFamily: "'JetBrains Mono', monospace",
                boxShadow: cell.revealed ? 'none' : 'inset 1px 1px 0 #fff, inset -1px -1px 0 #94a3b8',
                transition: 'background 0.1s',
              }}
            >{content}</button>
          );
        })}
      </div>

      {/* Status */}
      {(won || gameOver) && (
        <div style={{
          marginTop: '0.75rem', padding: '0.8rem', textAlign: 'center',
          background: won ? '#bbf7d0' : '#fecaca',
          border: '3px solid #0f172a', boxShadow: '4px 4px 0px #0f172a',
        }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>
            {won ? '🎉 You cleared the field!' : '💥 Boom! Game over.'}
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginTop: '0.25rem' }}>
            {won ? fmtTime(timer) + ' · ' + (MINES - flags) + ' mines' : ''}
          </div>
          <button onClick={reset} style={{
            marginTop: '0.5rem', padding: '0.4rem 1rem', background: '#3b82f6',
            color: '#fff', border: '3px solid #0f172a', fontWeight: 700,
            cursor: 'pointer', fontSize: '0.8rem', letterSpacing: '0.05em',
            textTransform: 'uppercase', fontFamily: 'inherit',
            boxShadow: '3px 3px 0px #0f172a',
          }}>↻ Play Again</button>
        </div>
      )}

      <p style={{
        marginTop: '0.6rem', fontSize: '0.68rem', color: '#94a3b8',
        fontWeight: 600, textAlign: 'center', lineHeight: 1.4,
      }}>
        Left-click to reveal · Right-click to flag
      </p>
    </div>
  );
}`;
