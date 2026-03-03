import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Babel from '@babel/standalone';
import { Code2, Atom, Star } from 'lucide-react';
import { EXAMPLE_JSX } from '../constants/exampleJsx';
import { Button } from './Button';

// Pre-built React+ReactDOM IIFE bundle (inlined at build time via Vite ?raw import)
// @ts-ignore — Vite raw import
import sandboxReactBundle from '../sandbox/react-bundle.js?raw';

/**
 * Build a self-contained HTML document that runs transpiled user code
 * inside a sandboxed iframe. React is inlined so no external fetches
 * are needed from within the sandbox.
 */
function buildSandboxHTML(transpiledCode: string): string {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<script>${sandboxReactBundle}<\/script>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Space Grotesk', 'Inter', system-ui, -apple-system, sans-serif;
    color: #0f172a;
  }
</style>
</head>
<body>
<div id="root"></div>
<script>
// Report errors back to the parent window
window.onerror = function(msg, src, line, col, err) {
    parent.postMessage({ type: 'sandbox-error', message: String(msg) }, '*');
    return true;
};
window.addEventListener('unhandledrejection', function(e) {
    parent.postMessage({ type: 'sandbox-error', message: String(e.reason) }, '*');
});

try {
    // Evaluate the transpiled CommonJS module
    var exports = {};
    var require = function(moduleName) {
        if (moduleName === 'react') return React;
        throw new Error("Module '" + moduleName + "' cannot be resolved in browser context");
    };

    (function(exports, require, React) {
        "use strict";
        ${transpiledCode}
    })(exports, require, React);

    // Extract the component (default export or first named export)
    var Component = exports.default;
    if (!Component) {
        var values = Object.values(exports);
        if (values.length > 0) Component = values[0];
    }

    if (typeof Component !== 'function' && (typeof Component !== 'object' || Component === null)) {
        throw new Error('Your code must export default a valid React component.');
    }

    // Render
    var root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(Component));

    // Signal success to parent
    parent.postMessage({ type: 'sandbox-ready' }, '*');
} catch (e) {
    parent.postMessage({ type: 'sandbox-error', message: e.message || String(e) }, '*');
}
<\/script>
</body>
</html>`;
}

export const Preview = ({ code, setCode }: { code: string, setCode: (code: string) => void }) => {
    const [error, setError] = useState<string | null>(null);
    const [iframeSrc, setIframeSrc] = useState<string | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Listen for messages from the sandbox iframe
    const handleMessage = useCallback((event: MessageEvent) => {
        const data = event.data;
        if (!data || typeof data !== 'object') return;

        if (data.type === 'sandbox-error') {
            setError(data.message || 'Unknown error in sandbox.');
        } else if (data.type === 'sandbox-ready') {
            setError(null);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [handleMessage]);

    // Transpile and build sandbox whenever code changes
    useEffect(() => {
        if (!code.trim()) {
            setIframeSrc(null);
            setError(null);
            return;
        }

        try {
            // Transpile JSX/TSX → JS with Babel (no security plugin needed — iframe is the boundary)
            const result = Babel.transform(code, {
                presets: ['env', 'react', 'typescript'],
                filename: 'dynamic.tsx'
            });

            if (!result.code) {
                throw new Error('Compilation failed silently.');
            }

            // Build the sandboxed HTML document with inlined React
            const html = buildSandboxHTML(result.code);
            setIframeSrc(html);
            setError(null);

        } catch (err: any) {
            console.error(err);
            let errorMsg = err.message || String(err);
            setError(errorMsg);
            setIframeSrc(null);
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
            {iframeSrc ? (
                <iframe
                    ref={iframeRef}
                    className="sandbox-frame"
                    sandbox="allow-scripts"
                    srcDoc={iframeSrc}
                    title="JSX Render Output"
                />
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
                            gap: '2.5rem',
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
                            <Button
                                onClick={() => setCode(EXAMPLE_JSX)}
                                style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}
                                icon={<Code2 size={20} />}
                            >
                                Load Example JSX
                            </Button>
                        </div>
                        <p className="disclaimer-note">
                            <strong>Note:</strong> Only self-contained JSX files are supported for now. <br />A general-purpose version is coming soon.
                        </p>
                    </div>
                )
            )}
        </>
    );
};
