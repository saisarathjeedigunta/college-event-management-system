import { ReactNode, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Bell, Search } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const { notifications } = useWebSocket();
    const [showNotifications, setShowNotifications] = useState(false);
    const unreadCount = notifications.length;

    return (
        <div className="min-h-screen bg-[#F3F4F6]">
            <Sidebar />

            <div className="ml-64">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
                    <div className="flex items-center gap-4 bg-gray-100 px-4 py-2 rounded-lg w-96">
                        <Search size={18} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search events..."
                            className="bg-transparent border-none outline-none text-sm w-full"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button
                                className="relative p-2 hover:bg-gray-100 rounded-full"
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                <Bell size={20} className="text-gray-600" />
                                {unreadCount > 0 && (
                                    <div className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full border border-white flex items-center justify-center text-xs text-white font-bold">
                                        {unreadCount}
                                    </div>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50">
                                    <div className="p-3 border-b border-gray-100 bg-gray-50">
                                        <h3 className="font-semibold text-gray-700">Notifications</h3>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500 text-sm">
                                                No new notifications
                                            </div>
                                        ) : (
                                            notifications.map((note, index) => (
                                                <div key={index} className="p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                                    <p className="text-sm text-gray-800">{note.content}</p>
                                                    <span className="text-xs text-gray-400 mt-1 block">{note.timestamp}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm">
                            ME
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
