import React, { useState, useEffect } from 'react';
import { Upload, Play, PanelLeftClose, PanelLeftOpen, Moon, Sun, Maximize2, Minimize2, Trash2, Code2 } from 'lucide-react';
import { Preview } from './components/Preview';
import { Button } from './components/Button';
import { Pane } from './components/Pane';
import { ConfirmModal } from './components/ConfirmModal';

function App() {
  const [code, setCode] = useState<string>('');
  const [showCode, setShowCode] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isHovering, setIsHovering] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [isFlickering, setIsFlickering] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
    setShowConfirm(true);
  };

  const confirmClear = () => {
    setShowConfirm(false);
    triggerClearGlitch(() => {
      setCode('');
      setFileError(null);
      setShowCode(false);
      setIsFullScreen(false);
    });
  };

  const isCodeLoaded = code.trim().length > 0;

  let animationClass = '';
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
          <Button
            variant="secondary"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            icon={theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          >
            {""}
          </Button>
          {!showCode && (
            <Button
              variant="secondary"
              onClick={() => setShowCode(true)}
              disabled={!isCodeLoaded}
              style={{ opacity: !isCodeLoaded ? 0.5 : 1, cursor: !isCodeLoaded ? 'not-allowed' : 'pointer' }}
              title={!isCodeLoaded ? "Upload a file first" : "Show Code"}
              icon={<PanelLeftOpen size={18} />}
            >
              Show Code
            </Button>
          )}
          {isCodeLoaded ? (
            <Button
              variant="danger"
              onClick={handleReset}
              title="Clear current file"
              icon={<Trash2 size={18} />}
            >
              Clear
            </Button>
          ) : (
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
          )}
        </div>
      </header>

      <main className="main-content" style={isFullScreen ? { height: '100vh', margin: 0, padding: 0 } : undefined}>
        <Pane
          title={<><Code2 size={16} /> Source Code</>}
          style={{
            flex: (showCode && !isFullScreen) ? 1 : 0.00001,
            transform: (showCode && !isFullScreen) ? 'translateX(0) scaleX(1)' : 'translateX(-2rem) scaleX(0)',
            borderWidth: (showCode && !isFullScreen) ? '3px' : '0px',
            marginRight: (showCode && !isFullScreen) ? '0' : '-2rem',
            visibility: (showCode && !isFullScreen) ? 'visible' : 'hidden'
          }}
          headerAction={
            <Button
              variant="secondary"
              onClick={() => setShowCode(false)}
              style={{
                padding: '0.25rem 0.6rem',
                fontSize: '0.8rem',
                borderWidth: '2px',
                boxShadow: '2px 2px 0px var(--panel-border)'
              }}
              title="Hide Code"
              icon={<PanelLeftClose size={15} />}
            >
              Hide
            </Button>
          }
          contentProps={{ onDragLeave: handleDragLeave }}
        >
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
        </Pane>

        <Pane
          title={<><Play size={16} /> Render Output</>}
          style={isFullScreen ? { border: 'none', borderRadius: 0, boxShadow: 'none' } : undefined}
          onRedDotClick={isCodeLoaded ? handleReset : undefined}
          onGreenDotClick={isCodeLoaded ? () => setIsFullScreen(!isFullScreen) : undefined}
          headerAction={
            <Button
              variant="secondary"
              onClick={() => setIsFullScreen(!isFullScreen)}
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
              icon={isFullScreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            >
              {isFullScreen ? "Exit Full Screen" : "Full Screen"}
            </Button>
          }
          contentStyle={{ padding: 0 }}
        >
          <div className="render-container" style={{ height: '100%', boxSizing: 'border-box' }}>
            <Preview code={code} setCode={setCode} />
          </div>
        </Pane>
      </main>
      {showConfirm && (
        <ConfirmModal
          message="Are you sure you want to clear the current file?"
          onConfirm={confirmClear}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}

export default App;
