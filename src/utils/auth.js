function Auth() {
    async function hashPassword(password) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (error) {
            reportError(error);
            throw new Error('Password hashing failed');
        }
    }

    async function verifyPassword(password, hashedPassword) {
        try {
            const hashedInput = await hashPassword(password);
            return hashedInput === hashedPassword;
        } catch (error) {
            reportError(error);
            return false;
        }
    }

    function isAuthenticated() {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            return !!user;
        } catch (error) {
            reportError(error);
            return false;
        }
    }

    function getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem('user'));
        } catch (error) {
            reportError(error);
            return null;
        }
    }

    function logout() {
        try {
            localStorage.removeItem('user');
            window.location.href = '/login';
        } catch (error) {
            reportError(error);
        }
    }

    function hasRole(role) {
        try {
            const user = getCurrentUser();
            return user && user.objectData.role === role;
        } catch (error) {
            reportError(error);
            return false;
        }
    }

    return {
        hashPassword,
        verifyPassword,
        isAuthenticated,
        getCurrentUser,
        logout,
        hasRole
    };
}
