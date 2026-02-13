import { Home, Calendar, Settings, LogOut, PlusCircle, Ticket } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { icon: Home, label: 'Dashboard', path: '/events' }, // Pointing Dashboard to Events for now
        { icon: Calendar, label: 'Events', path: '/events' },
        { icon: Ticket, label: 'My Registrations', path: '/my-registrations' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('department');
        navigate('/login');
    };

    return (
        <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0">
            <div className="p-6 flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">R</div>
                <span className="text-xl font-bold text-gray-800">RaghuEvents</span>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </button>
                    );
                })}

                {(localStorage.getItem('role') === 'SUPER_ADMIN' || localStorage.getItem('role') === 'DEPT_ADMIN') && (
                    <button
                        onClick={() => navigate('/events/create')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-emerald-600 hover:bg-emerald-50 mt-4"
                    >
                        <PlusCircle size={20} />
                        Create Event
                    </button>
                )}
            </nav>

            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </div>
    );
}
