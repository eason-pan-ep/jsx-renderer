# JSX Renderer

A retro-tech web application that transpiles and renders React components directly in your browser — no backend required.

Built with React 19, TypeScript, and Vite.

## Features

- **Live Transpilation** — `@babel/standalone` parses and executes modern ES6, TypeScript, and JSX/TSX syntax entirely client-side.
- **Sandboxed Rendering** — User code runs inside a browser-enforced `<iframe sandbox="allow-scripts">`, keeping the host page completely isolated.
- **Drag & Drop Upload** — Drop a `.jsx`, `.tsx`, `.js`, or `.ts` file anywhere on the window, or use the upload modal with its own drag-drop zone and file picker.
- **Fullscreen Mode** — Expand the render pane to full screen via the green window dot or the maximize button.
- **Show / Hide Code** — Toggle the source code pane on or off to focus on either the code or the rendered output.
- **Theme Toggle** — Switch between Tech Light and Cyber Dark modes with a CRT-flicker transition (click the red window dot).
- **Built-in Example** — Load a Task Tracker demo to see the renderer in action without uploading anything.
- **React Hooks Support** — Functional components with standard hooks (`useState`, `useEffect`, etc.) work out of the box.
- **Graceful Error Handling** — Compile-time and runtime errors are caught in the sandbox and displayed in the UI instead of crashing the page.
- **Mobile Awareness** — A gentle reminder encourages users on small screens to switch to a larger display for the best experience.

## Limitations

This version supports **standalone, self-contained files only**. The uploaded file must:

1. Define **all** components within the same file.
2. Either `export default` a renderable React component, **or** call `ReactDOM.createRoot` directly.

A standalone component like `<Button>` that depends on props will render, but with no props passed you'll see an empty or default-state result. A general-purpose version is planned.

## Getting Started

1. Clone and install:
   ```bash
   git clone https://github.com/eason-pan-ep/jsx-renderer.git
   cd jsx-renderer
   npm install
   ```

2. Start the dev server:
   ```bash
   npm run dev
   ```

## Build Commands

| Command              | Description                                        |
| -------------------- | -------------------------------------------------- |
| `npm run dev`        | Start the Vite dev server                          |
| `npm run build`      | TypeScript check + Vite production build           |
| `npm run build:sandbox` | Rebuild the React IIFE bundle for the sandbox iframe |
| `npm run lint`       | Run ESLint                                         |
| `npm run preview`    | Preview the production build locally               |

## Architecture

### Sandbox Isolation

User-uploaded code is rendered inside a sandboxed `<iframe>` for security:

1. **Babel transpiles** JSX/TSX to plain JavaScript in the parent page.
2. A self-contained **HTML document** is assembled with React inlined as a pre-built IIFE bundle.
3. The document is rendered via `<iframe sandbox="allow-scripts" srcdoc="...">`.
4. The sandbox detects whether the code calls `ReactDOM.createRoot` itself (self-rendering) or exports a component (rendered by the sandbox harness).
5. **Errors are reported** back to the parent via `postMessage`.

If you upgrade React, rebuild the sandbox bundle with:

```bash
npm run build:sandbox
```

### Project Structure

```
src/
├── components/        # React components (Preview, UploadModal, Pane, Button, ConfirmModal)
├── constants/         # Built-in example JSX
├── sandbox/           # Pre-built React IIFE bundle and build entry
├── styles/            # Modular CSS (theme, layout, components, animations)
├── App.tsx            # Main app container
└── main.tsx           # Entry point
```

## Technologies

- React 19
- TypeScript
- Vite
- `@babel/standalone`
- Lucide React (icons)
