// index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log("✅ index.tsx loaded");

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement); // 👈 kiểm tra xem có null không

if (!rootElement) {
  throw new Error('Root element not found in DOM!');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
