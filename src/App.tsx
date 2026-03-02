import React, { useState, useEffect } from 'react';
import { Upload, Code2, Play, FileJson, PanelLeftClose, PanelLeftOpen, Sparkles, Moon, Sun } from 'lucide-react';
import * as Babel from '@babel/standalone';

// The Preview component handles real-time Babel transpilation and rendering
const Preview = ({ code }: { code: string }) => {
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
            <div style={{
              background: 'var(--sparkle-bg)',
              padding: '2rem',
              borderRadius: '50%',
              border: '3px solid var(--panel-border)',
              boxShadow: '6px 6px 0px var(--panel-border)'
            }}>
              <Sparkles size={48} color="var(--sparkle-color)" />
            </div>
            <div>
              <h2 style={{ marginBottom: '0.75rem', fontSize: '1.8rem', fontWeight: 800 }}>Ready to Render</h2>
              <p style={{ maxWidth: '400px', lineHeight: 1.6, color: 'var(--text-secondary)', fontWeight: 600 }}>
                Upload a <strong>.jsx</strong> file to see it come to life instantly.
              </p>
            </div>
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '1rem'
            }}>
              <div className="empty-state-badge">
                ✨ ES6 & TS Support
              </div>
              <div className="empty-state-badge">
                ⚛️ React Hooks
              </div>
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
  const [isHovering, setIsHovering] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

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
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    readFile(file);
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

  return (
    <div className="app-container" onDragOver={handleDragOver} onDrop={handleDrop}>
      <header className="header">
        <h1>
          <FileJson size={32} color="var(--accent-color)" />
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
              onClick={() => setShowCode(true)}
            >
              <PanelLeftOpen size={18} /> Show Code
            </button>
          )}
          <label className="btn">
            <Upload size={18} />
            Upload JSX
            <input
              type="file"
              accept=".jsx,.tsx,.js,.ts,.txt"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </header>

      <main className="main-content">
        {showCode && (
          <div className="pane">
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
                onClick={() => setShowCode(false)}
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
        )}

        <div className="pane">
          <div className="pane-header">
            <div className="window-controls">
              <div className="window-dot dot-red"></div>
              <div className="window-dot dot-yellow"></div>
              <div className="window-dot dot-green"></div>
            </div>
            <span className="pane-header-title">
              <Play size={16} /> Render Output
            </span>
          </div>
          <div className="pane-content" style={{ padding: 0 }}>
            <div className="render-container" style={{ padding: '2rem', height: '100%', boxSizing: 'border-box' }}>
              <Preview code={code} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
