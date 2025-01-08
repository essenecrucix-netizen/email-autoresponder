import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import KnowledgeBase from './components/KnowledgeBase';
import Analytics from './components/Analytics';

function App() {
    return (
        <Router>
            <div className="app-container" data-name="app-container">
                <Header />
                <Sidebar />
                <main className="content-area" data-name="main-content">
                    <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/emails" element={<Emails />} />
                        <Route path="/knowledge-base" element={<KnowledgeBase />} />
                        <Route path="/analytics" element={<Analytics />} />
                        {/* Default Route */}
                        <Route path="/" element={<Dashboard />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;