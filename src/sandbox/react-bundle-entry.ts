// Entry point to bundle React + ReactDOM as globals for sandbox iframe
import React from 'react';
import { createRoot } from 'react-dom/client';

// Expose as globals on the iframe's window
(window as any).React = React;
(window as any).ReactDOM = { createRoot };
