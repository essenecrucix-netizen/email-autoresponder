import React from 'react';
import ReactDOM from 'react-dom/client';
// Try to import main.css (production), fall back to tailwind.css (development)
import './styles/main.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
