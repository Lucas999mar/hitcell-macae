import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { seedInitialData } from './database/seed';

// Initialize Database automatically on app start
seedInitialData().then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}).catch(err => {
  console.error("Failed to seed database:", err);
  document.getElementById('root').innerHTML = `
    <div style="padding:40px; color:white; background:#111; height:100vh;">
      <h2>Erro Fatal</h2>
      <p>Não foi possível inicializar o banco de dados.</p>
    </div>
  `;
});
