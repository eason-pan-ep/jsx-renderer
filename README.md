# JSX Renderer

A beautiful, retro-tech web application that instantly transpiles and renders React components directly in your browser. 

Built with React 19, TypeScript, and Vite.

## Features

- **Live Transpilation**: Utilizing `@babel/standalone`, this app parses and executes modern ES6 and JSX syntax directly in the client—no backend required.
- **Secure Sandbox**: The evaluation environment is heavily restricted by a custom Babel AST plugin, completely blocking access to sensitive global variables like `window`, `document`, `fetch`, `localStorage`, etc.
- **Drag and Drop**: Simply drag a `.jsx`, `.tsx`, or `.js` file onto the window, and it will load into the viewer and render the component instantly.
- **Clean Retro Tech Aesthetic**: A premium interface featuring thick window borders, structural shadows, background grids, and classic window control dots.
- **Theme Toggling**: Seamlessly switch between Tech Light mode (default) and Cyber Dark mode.
- **React Hooks Support**: You can upload functional components that utilize standard hooks like `useState` and `useEffect`.
- **Graceful Error Handling**: Syntax errors are caught and displayed safely in the UI, rather than crashing the page.

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

## Deployment

This app is completely static and can be hosted on platforms like Cloudflare Pages, Vercel, or Netlify.

See [CLOUDFLARE_PAGES_DEPLOY.md](./CLOUDFLARE_PAGES_DEPLOY.md) for a step-by-step guide on how to host this site on Cloudflare.

## Technologies Used
- React 19
- Vite
- TypeScript
- `@babel/standalone`
- Lucide React (Icons)
