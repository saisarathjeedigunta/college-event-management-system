import { ReactNode } from 'react';
import Sidebar from '../components/Sidebar';
import { Bell, Search } from 'lucide-react';

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
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
                        <button className="relative p-2 hover:bg-gray-100 rounded-full">
                            <Bell size={20} className="text-gray-600" />
                            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
                        </button>
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
