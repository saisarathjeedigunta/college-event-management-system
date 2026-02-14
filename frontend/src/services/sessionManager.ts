// Session Manager Service
// Handles cross-tab session detection and synchronization

export interface SessionInfo {
    sessionId: string;
    userId: string;
    userEmail: string;
    role: string;
    loginTime: number;
}

class SessionManager {
    private sessionId: string;
    private storageKey = 'auth_event';
    private sessionKey = 'session_info';

    constructor() {
        this.sessionId = this.generateSessionId();
        this.setupStorageListener();
    }

    /**
     * Generate a unique session ID for this tab
     */
    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get the current session ID for this tab
     */
    getSessionId(): string {
        return this.sessionId;
    }

    /**
     * Check if there's an active session in another tab
     * Returns session info if exists, null otherwise
     */
    checkExistingSession(): SessionInfo | null {
        const token = localStorage.getItem('token');
        const sessionId = sessionStorage.getItem('sessionId');
        const sessionInfo = localStorage.getItem(this.sessionKey);

        // If token exists but this tab has no session ID, another tab is logged in
        if (token && !sessionId && sessionInfo) {
            try {
                return JSON.parse(sessionInfo);
            } catch {
                return null;
            }
        }

        return null;
    }

    /**
     * Register this tab's session
     */
    registerSession(userId: string, userEmail: string, role: string): void {
        const sessionInfo: SessionInfo = {
            sessionId: this.sessionId,
            userId,
            userEmail,
            role,
            loginTime: Date.now(),
        };

        // Store session ID in sessionStorage (tab-specific)
        sessionStorage.setItem('sessionId', this.sessionId);

        // Store session info in localStorage (shared across tabs)
        localStorage.setItem(this.sessionKey, JSON.stringify(sessionInfo));
    }

    /**
     * Broadcast login event to other tabs
     */
    broadcastLogin(token: string, userId: string, userEmail: string, role: string): void {
        // First, broadcast logout to close other sessions
        this.broadcastLogout();

        // Small delay to ensure logout is processed
        setTimeout(() => {
            // Register this session
            this.registerSession(userId, userEmail, role);

            // Store token
            localStorage.setItem('token', token);
        }, 100);
    }

    /**
     * Broadcast logout event to all tabs
     */
    broadcastLogout(): void {
        const event = {
            type: 'logout',
            timestamp: Date.now(),
            sessionId: this.sessionId,
        };

        // Set the event
        localStorage.setItem(this.storageKey, JSON.stringify(event));

        // Remove immediately to trigger storage event in other tabs
        setTimeout(() => {
            localStorage.removeItem(this.storageKey);
        }, 50);
    }

    /**
     * Clear session data
     */
    clearSession(): void {
        localStorage.removeItem('token');
        localStorage.removeItem(this.sessionKey);
        sessionStorage.removeItem('sessionId');
    }

    /**
     * Setup listener for storage events (cross-tab communication)
     */
    private setupStorageListener(): void {
        window.addEventListener('storage', (e) => {
            // Only handle auth events
            if (e.key === this.storageKey && e.newValue) {
                try {
                    const event = JSON.parse(e.newValue);

                    // Handle logout event
                    if (event.type === 'logout' && event.sessionId !== this.sessionId) {
                        // Another tab logged out, force logout this tab
                        this.handleCrossTabLogout();
                    }
                } catch (error) {
                    console.error('Error parsing storage event:', error);
                }
            }

            // Handle token changes
            if (e.key === 'token') {
                const currentSessionId = sessionStorage.getItem('sessionId');

                // If token changed and this tab has a session, it means another tab logged in
                if (currentSessionId && e.newValue !== e.oldValue) {
                    this.handleCrossTabLogout();
                }
            }
        });
    }

    /**
     * Handle logout triggered from another tab
     */
    private handleCrossTabLogout(): void {
        // Clear local session data
        sessionStorage.removeItem('sessionId');

        // Dispatch custom event for app to handle
        window.dispatchEvent(new CustomEvent('cross-tab-logout', {
            detail: { message: 'Logged out from another tab' }
        }));
    }

    /**
     * Cleanup listeners (call on unmount)
     */
    cleanup(): void {
        // Storage listener is automatically cleaned up when window closes
        // But we can clear session data
        sessionStorage.removeItem('sessionId');
    }
}

// Export singleton instance
export const sessionManager = new SessionManager();
