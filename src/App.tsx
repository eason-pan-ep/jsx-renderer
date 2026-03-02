import React, { useState } from 'react';
import { Upload, Code2, Play, FileJson, PanelLeftClose, PanelLeftOpen, Sparkles } from 'lucide-react';
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
        <div className="error-message" style={{ marginBottom: '1rem' }}>
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
            color: '#64748b',
            gap: '1.5rem',
            textAlign: 'center',
            padding: '2rem'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)',
              padding: '2rem',
              borderRadius: '50%',
              boxShadow: '0 10px 25px rgba(124, 58, 237, 0.2)'
            }}>
              <Sparkles size={48} color="#7c3aed" />
            </div>
            <div>
              <h2 style={{ color: '#1e293b', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Ready to Render</h2>
              <p style={{ maxWidth: '400px', lineHeight: 1.6 }}>
                Write your React components in the editor, or upload a <code>.jsx</code> file to see it come to life instantly.
              </p>
            </div>
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '1rem'
            }}>
              <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                ✨ ES6 & TypeScript Support
              </div>
              <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                ⚛️ React Hooks Ready
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
          <FileJson size={28} color="#38bdf8" />
          JSX Renderer
        </h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {!showCode && (
            <button
              className="btn"
              onClick={() => setShowCode(true)}
              style={{ background: 'transparent', border: '1px solid var(--panel-border)', color: 'var(--text-primary)' }}
            >
              <PanelLeftOpen size={18} /> Show Code
            </button>
          )}
          <label className="btn">
            <Upload size={18} />
            Upload JSX File
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
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Code2 size={16} /> Source Code
              </span>
              <button
                className="btn"
                onClick={() => setShowCode(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.8rem'
                }}
                title="Hide Code"
              >
                <PanelLeftClose size={16} /> Hide
              </button>
            </div>
            <div className="pane-content" onDragLeave={handleDragLeave}>
              {fileError && <div className="error-message" style={{ marginBottom: '1rem' }}>{fileError}</div>}
              <textarea
                className="code-editor"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`// Write or upload your JSX code here...

import React from 'react';

export default function MyComponent() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', background: '#e0e7ff', borderRadius: '8px' }}>
      <h1 style={{ color: '#4f46e5' }}>Hello from JSX!</h1>
      <p style={{ color: '#4338ca' }}>You can write code here directly or upload a file.</p>
    </div>
  );
}`}
                spellCheck={false}
              />

              <div className={`upload-overlay ${isHovering ? 'active' : ''}`}>
                <div className="upload-box">
                  <Upload size={48} className="upload-icon" />
                  <h3>Drop file to load</h3>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Supports .jsx, .tsx, .js files
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="pane">
          <div className="pane-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Play size={16} /> Render Output
            </span>
          </div>
          <div className="pane-content" style={{ padding: 0 }}>
            <div className="render-container">
              <Preview code={code} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
