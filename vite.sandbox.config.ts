import { defineConfig } from 'vite';

// Builds a standalone React + ReactDOM IIFE bundle for use inside sandboxed iframes.
// Output: src/sandbox/react-bundle.js
export default defineConfig({
    define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
    },
    build: {
        lib: {
            entry: 'src/sandbox/react-bundle-entry.ts',
            formats: ['iife'],
            name: 'SandboxReact',
            fileName: () => 'react-bundle.js',
        },
        outDir: 'src/sandbox',
        emptyOutDir: false,
        minify: true,
        rollupOptions: {
            output: {
                // No code-splitting, single file
                inlineDynamicImports: true,
            },
        },
    },
});
