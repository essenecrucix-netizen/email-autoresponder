function AuthGuard({ children, requiredRole = null }) {
    const [isAuthorized, setIsAuthorized] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                window.location.href = '/login';
                return;
            }

            if (requiredRole && user.role !== requiredRole) {
                setIsAuthorized(false);
                setIsLoading(false);
                return;
            }

            setIsAuthorized(true);
            setIsLoading(false);
        } catch (error) {
            console.error('Error in AuthGuard:', error);
            window.location.href = '/login';
        }
    }, [requiredRole]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600">Unauthorized Access</h2>
                    <p className="mt-2">You don't have permission to access this page.</p>
                </div>
            </div>
        );
    }

    return children;
}

