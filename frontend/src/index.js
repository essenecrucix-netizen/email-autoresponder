import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Import the default export from App.js

// ReactDOM renders App into the root element
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
