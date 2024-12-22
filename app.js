function App() {
    return (
        <div className="app-container" data-name="app-container">
            <Header />
            <Sidebar />
            <main className="content-area" data-name="main-content">
                <div className="dashboard-stats" data-name="dashboard-stats">
                    <div className="stat-card" data-name="stat-emails">
                        <div className="stat-value">152</div>
                        <div className="stat-label">Emails Processed Today</div>
                    </div>
                    <div className="stat-card" data-name="stat-response">
                        <div className="stat-value">45s</div>
                        <div className="stat-label">Average Response Time</div>
                    </div>
                    <div className="stat-card" data-name="stat-accuracy">
                        <div className="stat-value">94%</div>
                        <div className="stat-label">Response Accuracy</div>
                    </div>
                </div>
            </main>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);