# JSX Renderer

A beautiful, retro-tech web application that instantly transpiles and renders React components directly in your browser. 

Built with React 19, TypeScript, and Vite.

## Features

- **Live Transpilation**: Utilizing `@babel/standalone`, this app parses and executes modern ES6, TypeScript, and JSX syntax directly in the client—no backend required.
- **Sandboxed Rendering**: User code runs inside a browser-enforced `<iframe sandbox="allow-scripts">`, providing full access to browser APIs (`window`, `document`, `fetch`, etc.) while keeping the host page completely isolated and secure.
- **Drag and Drop**: Simply drag a `.jsx`, `.tsx`, or `.js` file onto the window, and it will load into the viewer and render the component instantly.
- **Clean Retro Tech Aesthetic**: A premium interface featuring thick window borders, structural shadows, background grids, and classic window control dots with hidden easter eggs.
- **Theme Toggling**: Seamlessly switch between Tech Light mode (default) and Cyber Dark mode with a satisfying TV-flicker transition.
- **React Hooks Support**: Upload functional components that utilize standard hooks like `useState` and `useEffect`.
- **Graceful Error Handling**: Compile-time and runtime errors are caught and displayed safely in the UI, rather than crashing the page.

## Getting Started

To run this project locally:

1. Clone the repository and navigate into the directory:
   ```bash
   git clone <your-repo-url>
   cd jsx-renderer
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Architecture

### Sandbox Isolation

User-uploaded JSX is rendered inside a sandboxed `<iframe>` for security:

1. **Babel transpiles** the JSX/TSX to plain JavaScript (in the parent page)
2. A self-contained **HTML document** is assembled with React inlined
3. The HTML is rendered via `<iframe sandbox="allow-scripts" srcdoc="...">` 
4. **Errors are reported** back to the parent via `postMessage`

The React runtime used inside the iframe is pre-built as a standalone IIFE bundle (`src/sandbox/react-bundle.js`). If you upgrade React, rebuild it with:

```bash
npm run build:sandbox
```


## Technologies Used
- React 19
- Vite
- TypeScript
- `@babel/standalone`
- Lucide React (Icons)
