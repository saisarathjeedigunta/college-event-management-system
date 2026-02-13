import { Calendar, MapPin, MoreHorizontal, Clock, Users, Edit, Trash2, Check } from 'lucide-react';
import { api } from '../lib/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface EventCardProps {
    id: number;
    title: string;
    date: string;
    time: string;
    venue: string;
    tags?: string[]; // Make optional
    attendees: number;
    capacity: number;
    isRegistered?: boolean;
    onRefresh?: () => void;
}

export default function EventCard({ id, title, date, time, venue, tags = [], attendees, capacity, isRegistered, onRefresh }: EventCardProps) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const role = localStorage.getItem('role');

    const handleRegister = async () => {
        try {
            setLoading(true);
            await api.post(`/registrations/events/${id}`);
            alert('Successfully Registered!');
            if (onRefresh) onRefresh();
        } catch (err: any) {
            // Display specific error message from backend
            alert(err.response?.data?.message || err.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this event?")) return;
        try {
            await api.delete(`/events/${id}`);
            alert("Event deleted successfully");
            if (onRefresh) onRefresh();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to delete event");
        }
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full relative">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex gap-2 mb-2">
                        {tags.map((tag, index) => (
                            <span key={index} className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{title}</h3>
                </div>

                {(role === 'SUPER_ADMIN' || role === 'DEPT_ADMIN') && (
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="text-gray-400 hover:text-gray-600 p-1"
                        >
                            <MoreHorizontal size={20} />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-10 py-1">
                                <button
                                    onClick={() => navigate(`/events/edit/${id}`)}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <Edit size={14} /> Edit
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Calendar size={16} />
                    <span>{date}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Clock size={16} />
                    <span>{time}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <MapPin size={16} />
                    <span>{venue}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Users size={16} />
                    <span>{attendees} / {capacity} Registered</span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center -space-x-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                            U{i}
                        </div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                        +{attendees > 3 ? attendees - 3 : 0}
                    </div>
                </div>

                {role === 'STUDENT' ? (
                    isRegistered ? (
                        <div className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 text-sm font-semibold rounded-lg border border-green-100">
                            <Check size={16} /> Registered
                        </div>
                    ) : (
                        <button
                            onClick={handleRegister}
                            disabled={loading}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            {loading ? '...' : 'Register'}
                        </button>
                    )
                ) : (
                    <div className="text-xs text-gray-400 font-medium italic">Admin View</div>
                )}
            </div>
        </div>
    );
}
