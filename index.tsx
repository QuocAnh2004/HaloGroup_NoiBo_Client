import "./polyfills/polyfills"; // ✅ DÒNG ĐẦU TIÊN

import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { ChatProvider } from './components/projects/ChatContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}
// src/main.tsx (hoặc main.jsx)

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HashRouter>
       <ChatProvider>
        <App />
       </ChatProvider>
    </HashRouter>
  </React.StrictMode>
);