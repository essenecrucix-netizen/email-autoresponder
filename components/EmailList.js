function EmailList() {
    const [emails, setEmails] = React.useState([]);
    const [selectedEmail, setSelectedEmail] = React.useState(null);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('all');
    const [sortBy, setSortBy] = React.useState('date');
    const [sortOrder, setSortOrder] = React.useState('desc');

    async function loadEmails() {
        try {
            const trickleObjAPI = new TrickleObjectAPI();
            const response = await trickleObjAPI.listObjects('email', 50, true);
            setEmails(response.items);
        } catch (error) {
            reportError(error);
        }
    }

    async function handleManualResponse(emailId, response) {
        try {
            const trickleObjAPI = new TrickleObjectAPI();
            await trickleObjAPI.createObject('email-response', {
                emailId,
                content: response,
                manual: true,
                timestamp: new Date().toISOString()
            });
            await loadEmails();
            setSelectedEmail(null);
        } catch (error) {
            reportError(error);
        }
    }

    function filterAndSortEmails() {
        let filteredEmails = [...emails];

        // Apply search
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filteredEmails = filteredEmails.filter(email => 
                email.objectData.subject.toLowerCase().includes(searchLower) ||
                email.objectData.sender.toLowerCase().includes(searchLower) ||
                email.objectData.content.toLowerCase().includes(searchLower)
            );
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            filteredEmails = filteredEmails.filter(email => 
                statusFilter === 'escalated' ? email.objectData.needsEscalation : !email.objectData.needsEscalation
            );
        }

        // Apply sorting
        filteredEmails.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'date':
                    comparison = new Date(b.createdAt) - new Date(a.createdAt);
                    break;
                case 'subject':
                    comparison = a.objectData.subject.localeCompare(b.objectData.subject);
                    break;
                case 'sender':
                    comparison = a.objectData.sender.localeCompare(b.objectData.sender);
                    break;
                default:
                    comparison = 0;
            }
            return sortOrder === 'desc' ? comparison : -comparison;
        });

        return filteredEmails;
    }

    React.useEffect(() => {
        loadEmails();
        const interval = setInterval(loadEmails, 30000);
        return () => clearInterval(interval);
    }, []);

    const filteredEmails = filterAndSortEmails();

    return (
        <div className="email-list-container" data-name="email-list-container">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold" data-name="email-list-title">Email Queue</h2>
                <div className="flex space-x-4" data-name="email-controls">
                    <input
                        type="text"
                        placeholder="Search emails..."
                        className="px-4 py-2 border rounded-md"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        data-name="search-input"
                    />
                    <select
                        className="px-4 py-2 border rounded-md"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        data-name="status-filter"
                    >
                        <option value="all">All Status</option>
                        <option value="automated">Automated</option>
                        <option value="escalated">Escalated</option>
                    </select>
                    <select
                        className="px-4 py-2 border rounded-md"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        data-name="sort-by"
                    >
                        <option value="date">Sort by Date</option>
                        <option value="subject">Sort by Subject</option>
                        <option value="sender">Sort by Sender</option>
                    </select>
                    <button
                        className="px-4 py-2 border rounded-md"
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        data-name="sort-order"
                    >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4" data-name="email-list">
                {filteredEmails.map((email) => (
                    <div
                        key={email.objectId}
                        className={`card cursor-pointer ${
                            selectedEmail?.objectId === email.objectId ? 'border-blue-500 border-2' : ''
                        }`}
                        onClick={() => setSelectedEmail(email)}
                        data-name="email-item"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-medium">{email.objectData.subject}</h3>
                                <p className="text-sm text-gray-500">From: {email.objectData.sender}</p>
                                <p className="text-sm text-gray-500">
                                    {new Date(email.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-sm ${
                                email.objectData.needsEscalation ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                                {email.objectData.needsEscalation ? 'Needs Attention' : 'Automated'}
                            </span>
                        </div>
                        <p className="mt-2 text-gray-600">{email.objectData.content.substring(0, 150)}...</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
