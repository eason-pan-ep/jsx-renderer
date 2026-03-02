import React, { useState, useEffect } from 'react';
import { Upload, Code2, Play, PanelLeftClose, PanelLeftOpen, Sparkles, Moon, Sun, Maximize2, Minimize2, Trash2, Atom, Star } from 'lucide-react';
import * as Babel from '@babel/standalone';

// The Preview component handles real-time Babel transpilation and rendering
const EXAMPLE_JSX = `import React, { useState } from 'react';

export default function RetroCounter() {
  const [count, setCount] = useState(0);

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '400px',
      margin: '2rem auto',
      background: 'var(--panel-bg, #fff)',
      border: '3px solid var(--panel-border, #0f172a)',
      boxShadow: '6px 6px 0px var(--panel-border, #0f172a)',
      borderRadius: '8px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h2 style={{ marginTop: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        System Status
      </h2>
      <div style={{
        background: 'var(--title-bar-bg, #e2e8f0)',
        padding: '1.5rem',
        margin: '1.5rem 0',
        textAlign: 'center',
        border: '3px solid var(--panel-border, #0f172a)',
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
            background: 'var(--panel-bg, #fff)',
            border: '3px solid var(--panel-border, #0f172a)',
            boxShadow: '4px 4px 0px var(--panel-border, #0f172a)',
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
            background: 'var(--accent-color, #3b82f6)',
            color: '#fff',
            border: '3px solid var(--panel-border, #0f172a)',
            boxShadow: '4px 4px 0px var(--panel-border, #0f172a)',
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

const Preview = ({ code, setCode }: { code: string, setCode: (code: string) => void }) => {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!code.trim()) {
      setComponent(null);
      setError(null);
      return;
    }

    try {
      // Security Plugin to prevent basic XSS and malicious global access
      const securityPlugin = function () {
        return {
          visitor: {
            Identifier(path: any) {
              const forbidden = ['window', 'document', 'localStorage', 'sessionStorage', 'fetch', 'XMLHttpRequest', 'eval', 'globalThis', 'Function'];
              if (forbidden.includes(path.node.name)) {
                // Allow if it's a property of an object (e.g., obj.window)
                if (path.parentPath.isMemberExpression() && path.parentKey === 'property' && !path.parent.computed) {
                  return;
                }
                throw new Error(`Security Exception: Usage of '${path.node.name}' is not allowed in this sandbox.`);
              }
            }
          }
        };
      };

      // 1. Transpile JSX/TSX to JS
      const result = Babel.transform(code, {
        presets: ['env', 'react', 'typescript'],
        plugins: [securityPlugin],
        filename: 'dynamic.tsx'
      });

      if (!result.code) {
        throw new Error('Compilation failed silently.');
      }

      // 2. Evaluate the commonjs module output
      const exports: Record<string, any> = {};
      const customRequire = (moduleName: string) => {
        if (moduleName === 'react') return React;
        throw new Error(`Module '${moduleName}' cannot be resolved in browser context`);
      };

      // We wrap the code in a function providing standard CommonJS globals, and strictly block sensitive globals
      const executeFn = new Function(
        'exports', 'require', 'React', 'window', 'document', 'fetch', 'localStorage', 'sessionStorage', 'globalThis',
        `"use strict";\n${result.code}`
      );
      executeFn(exports, customRequire, React);

      // 3. Extract the default export or the first available component
      let ExtractedComponent = exports.default;

      // Fallback: if no default export, see if they exported something else like: export const App = () => ...
      if (!ExtractedComponent) {
        const exportedValues = Object.values(exports);
        if (exportedValues.length > 0) {
          ExtractedComponent = exportedValues[0];
        } else {
          // Fallback for code like: function App() { return <div></div> }; return App;
          // Wait, Babel might not expose functions unless explicitly exported. 
        }
      }

      if (typeof ExtractedComponent === 'function' || (typeof ExtractedComponent === 'object' && ExtractedComponent !== null)) {
        setComponent(() => ExtractedComponent);
        setError(null);
      } else {
        throw new Error('Your code must `export default` a valid React component.');
      }

    } catch (err: any) {
      console.error(err);
      // Clean up babel error messages if they are too noisy
      let errorMsg = err.message || String(err);
      setError(errorMsg);
      // We don't nullify Component here so the user can still see their last valid render while typing
    }
  }, [code]);

  return (
    <>
      {error && (
        <div className="error-message">
          <strong>Error: </strong>
          {error}
        </div>
      )}
      {Component ? (
        <Component />
      ) : (
        !error && (
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem',
            textAlign: 'center',
            padding: '2rem'
          }}>
            <div>
              <h2 style={{ marginBottom: '0.75rem', fontSize: '1.8rem', fontWeight: 800 }}>Ready to Render</h2>
              <p style={{ maxWidth: '400px', lineHeight: 1.6, color: 'var(--text-secondary)', fontWeight: 600 }}>
                Upload a <strong>.jsx</strong> file to see it come to life instantly.
              </p>
            </div>
            <div style={{
              display: 'flex',
              gap: '2.5rem', /* Increased gap between folders */
            }}>
              <div className="empty-state-badge">
                <div className="badge-icon" style={{ '--folder-color': '#d1b8cc' } as React.CSSProperties}>
                  <span><Star size={24} color="var(--text-primary)" strokeWidth={2.5} /></span>
                </div>
                <span>ES6 & TS</span>
              </div>
              <div className="empty-state-badge">
                <div className="badge-icon" style={{ '--folder-color': '#f1c27d' } as React.CSSProperties}>
                  <span><Atom size={24} color="var(--text-primary)" strokeWidth={2.5} /></span>
                </div>
                <span>React Hooks</span>
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Or try it out with a sample component:</p>
              <button
                className="btn"
                onClick={() => setCode(EXAMPLE_JSX)}
                style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}
              >
                <Code2 size={20} /> Load Example JSX
              </button>
            </div>
          </div>
        )
      )}
    </>
  );
};

function App() {
  const [code, setCode] = useState<string>('');
  const [showCode, setShowCode] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isHovering, setIsHovering] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [isFlickering, setIsFlickering] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      // Validate savedTheme
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme as 'dark' | 'light');
      }
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // Per instructions, light mode should be explicit default, but honoring explicit system preset is nice.
      // Easiest true default: just light mode.
      setTheme('light');
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setIsFlickering(true);
    setTimeout(() => {
      setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    }, 250); // change theme in the middle of TV off

    setTimeout(() => {
      setIsFlickering(false);
    }, 500); // matches the 0.5s CSS animation
  };

  useEffect(() => {
    if (isFlickering) {
      document.body.classList.add('theme-tv');
    } else {
      document.body.classList.remove('theme-tv');
    }
  }, [isFlickering]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    readFile(file);
  };

  const triggerGlitch = (action: () => void) => {
    setIsGlitching(true);
    // Execute the layout/state action in the middle of the TV switching animation (0.25s total)
    setTimeout(() => {
      action();
    }, 125);

    // End animation
    setTimeout(() => {
      setIsGlitching(false);
    }, 250);
  };

  const triggerClearGlitch = (action: () => void) => {
    // The Clear button uses the heavy TV channel switch effect.
    setIsClearing(true);
    setTimeout(() => {
      action();
    }, 125);
    setTimeout(() => {
      setIsClearing(false);
    }, 250);
  };

  const readFile = (file: File) => {
    // Basic safety check for reasonable extensions (since Babel can't parse huge binary files)
    if (!file.name.match(/\.(js|jsx|ts|tsx|txt)$/i) && file.type && !file.type.includes('text')) {
      setFileError("Please drop a valid React source component file (.jsx, .tsx).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCode(text);
      setFileError(null);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(true);
  };

  const handleDragLeave = () => {
    setIsHovering(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);

    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  };

  const handleReset = () => {
    triggerClearGlitch(() => {
      setCode('');
      setFileError(null);
      setShowCode(false);
      setIsFullScreen(false);
    });
  };

  const isCodeLoaded = code.trim().length > 0;

  let animationClass = '';
  if (isGlitching) animationClass = 'layout-glitch';
  if (isClearing) animationClass = 'channel-switching';

  return (
    <div className={`app-container ${animationClass}`} style={isFullScreen ? { padding: 0, gap: 0 } : undefined} onDragOver={handleDragOver} onDrop={handleDrop}>
      <header
        className="header"
        style={{
          transform: isFullScreen ? 'translateY(-150%)' : 'translateY(0)',
          opacity: isFullScreen ? 0 : 1,
          height: isFullScreen ? 0 : 'auto',
          padding: isFullScreen ? 0 : '1rem 1.5rem',
          margin: isFullScreen ? 0 : '',
          border: isFullScreen ? 'none' : '',
          overflow: 'hidden',
          visibility: isFullScreen ? 'hidden' : 'visible'
        }}
      >
        <h1>
          <img src="/jsx_renderer_icon.png" alt="JSX Renderer Icon" style={{ width: '32px', height: '32px' }} />
          JSX Renderer
        </h1>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {!showCode && (
            <button
              className="btn btn-secondary"
              onClick={() => triggerGlitch(() => setShowCode(true))}
              disabled={!isCodeLoaded}
              style={{ opacity: !isCodeLoaded ? 0.5 : 1, cursor: !isCodeLoaded ? 'not-allowed' : 'pointer' }}
              title={!isCodeLoaded ? "Upload a file first" : "Show Code"}
            >
              <PanelLeftOpen size={18} /> Show Code
            </button>
          )}
          <label className="btn" style={{ margin: 0 }}>
            <Upload size={18} />
            Upload JSX
            <input
              type="file"
              accept=".jsx,.tsx,.js,.ts,.txt"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
          {isCodeLoaded && (
            <button
              className="btn"
              onClick={handleReset}
              style={{ background: '#ef4444', color: 'white', borderColor: 'var(--panel-border)' }}
              title="Clear current file"
            >
              <Trash2 size={18} /> Clear
            </button>
          )}
        </div>
      </header>

      <main className="main-content" style={isFullScreen ? { height: '100vh', margin: 0, padding: 0 } : undefined}>
        <div
          className="pane"
          style={{
            flex: (showCode && !isFullScreen) ? 1 : 0.00001,
            // opacity: (showCode && !isFullScreen) ? 1 : 0, // removed opacity to let scale handle hidden state
            transform: (showCode && !isFullScreen) ? 'translateX(0) scaleX(1)' : 'translateX(-2rem) scaleX(0)',
            borderWidth: (showCode && !isFullScreen) ? '3px' : '0px',
            marginRight: (showCode && !isFullScreen) ? '0' : '-2rem', // Compensate for gap
            visibility: (showCode && !isFullScreen) ? 'visible' : 'hidden'
          }}
        >
          <div className="pane-header">
            <div className="window-controls">
              <div className="window-dot dot-red"></div>
              <div className="window-dot dot-yellow"></div>
              <div className="window-dot dot-green"></div>
            </div>
            <span className="pane-header-title">
              <Code2 size={16} /> Source Code
            </span>
            <button
              className="btn btn-secondary"
              onClick={() => triggerGlitch(() => setShowCode(false))}
              style={{
                padding: '0.25rem 0.6rem',
                fontSize: '0.8rem',
                borderWidth: '2px',
                boxShadow: '2px 2px 0px var(--panel-border)'
              }}
              title="Hide Code"
            >
              <PanelLeftClose size={15} /> Hide
            </button>
          </div>
          <div className="pane-content" onDragLeave={handleDragLeave}>
            {fileError && <div className="error-message">{fileError}</div>}
            <textarea
              className="code-editor"
              value={code}
              readOnly
              placeholder={`// Upload your JSX code here to see it rendered...`}
              spellCheck={false}
            />

            <div className={`upload-overlay ${isHovering ? 'active' : ''}`}>
              <div className="upload-box">
                <Upload size={48} className="upload-icon" />
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 800 }}>Drop file to load</h3>
                <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Supports .jsx, .tsx, .js files
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pane" style={isFullScreen ? { border: 'none', borderRadius: 0, boxShadow: 'none' } : undefined}>
          <div className="pane-header">
            <div className="window-controls">
              <div className="window-dot dot-red"></div>
              <div className="window-dot dot-yellow"></div>
              <div className="window-dot dot-green"></div>
            </div>
            <span className="pane-header-title">
              <Play size={16} /> Render Output
            </span>
            <button
              className="btn btn-secondary"
              onClick={() => triggerGlitch(() => setIsFullScreen(!isFullScreen))}
              disabled={!isCodeLoaded}
              style={{
                padding: '0.25rem 0.6rem',
                fontSize: '0.8rem',
                borderWidth: '2px',
                boxShadow: !isCodeLoaded ? 'none' : '2px 2px 0px var(--panel-border)',
                opacity: !isCodeLoaded ? 0.5 : 1,
                cursor: !isCodeLoaded ? 'not-allowed' : 'pointer'
              }}
              title={!isCodeLoaded ? "Upload a file first" : isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
            >
              {isFullScreen ? <><Minimize2 size={15} /> Exit Full Screen</> : <><Maximize2 size={15} /> Full Screen</>}
            </button>
          </div>
          <div className="pane-content" style={{ padding: 0 }}>
            <div className="render-container" style={{ padding: '2rem', height: '100%', boxSizing: 'border-box' }}>
              <Preview code={code} setCode={setCode} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
