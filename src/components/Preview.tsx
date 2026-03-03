import React, { useState } from 'react';
import * as Babel from '@babel/standalone';
import { Code2, Atom, Star } from 'lucide-react';
import { EXAMPLE_JSX } from '../constants/exampleJsx';
import { Button } from './Button';

export const Preview = ({ code, setCode }: { code: string, setCode: (code: string) => void }) => {
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
                            <Button
                                onClick={() => setCode(EXAMPLE_JSX)}
                                style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}
                                icon={<Code2 size={20} />}
                            >
                                Load Example JSX
                            </Button>
                        </div>
                    </div>
                )
            )}
        </>
    );
};
