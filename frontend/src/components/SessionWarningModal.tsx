import { useEffect } from 'react';

interface SessionWarningModalProps {
    isOpen: boolean;
    existingSession: {
        userEmail: string;
        role: string;
        loginTime: number;
    } | null;
    onContinue: () => void;
    onCancel: () => void;
}

export function SessionWarningModal({ isOpen, existingSession, onContinue, onCancel }: SessionWarningModalProps) {
    useEffect(() => {
        // Prevent body scroll when modal is open
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !existingSession) return null;

    const getTimeSince = (timestamp: number) => {
        const minutes = Math.floor((Date.now() - timestamp) / 60000);
        if (minutes < 1) return 'just now';
        if (minutes === 1) return '1 minute ago';
        if (minutes < 60) return `${minutes} minutes ago`;
        const hours = Math.floor(minutes / 60);
        if (hours === 1) return '1 hour ago';
        return `${hours} hours ago`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">⚠️</span>
                    <h2 className="text-xl font-bold text-gray-900">Already Logged In</h2>
                </div>

                {/* Content */}
                <div className="space-y-3 mb-6">
                    <p className="text-gray-700">
                        You're already logged in as <strong>{existingSession.userEmail}</strong> ({existingSession.role}) in another tab.
                    </p>
                    <p className="text-sm text-gray-500">
                        Last login: {getTimeSince(existingSession.loginTime)}
                    </p>
                    <p className="text-orange-600 font-medium">
                        Logging in here will logout your other session.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onContinue}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                        Continue & Logout Other Sessions
                    </button>
                </div>
            </div>
        </div>
    );
}
