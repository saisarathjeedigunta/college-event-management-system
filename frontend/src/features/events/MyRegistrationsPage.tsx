import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Calendar, MapPin, Clock } from 'lucide-react';

interface Registration {
    id: number;
    event: {
        id: number;
        title: string;
        venue: string;
        startTime: string;
    };
    status: 'CONFIRMED' | 'WAITLIST' | 'CANCELLED';
    registeredAt: string;
}

export default function MyRegistrationsPage() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const fetchRegistrations = () => {
        api.get('/registrations/my')
            .then(res => setRegistrations(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const handleCancel = async (id: number) => {
        if (!confirm("Are you sure you want to cancel?")) return;
        try {
            await api.delete(`/registrations/${id}`);
            fetchRegistrations(); // Refresh list
        } catch (err) {
            alert("Failed to cancel");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-green-100 text-green-700';
            case 'WAITLIST': return 'bg-yellow-100 text-yellow-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const parseDate = (dateVal: any) => {
        if (!dateVal) return new Date();
        if (Array.isArray(dateVal)) {
            return new Date(dateVal[0], dateVal[1] - 1, dateVal[2], dateVal[3], dateVal[4]);
        }
        return new Date(dateVal);
    };

    return (
        <DashboardLayout>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Registrations</h1>

            {loading ? (
                <div>Loading...</div>
            ) : registrations.length === 0 ? (
                <div className="bg-white p-8 rounded-xl text-center text-gray-500">
                    You haven't registered for any events yet.
                </div>
            ) : (
                <div className="space-y-4">
                    {registrations.map(reg => (
                        <div key={reg.id} className="bg-white p-6 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{reg.event.title}</h3>
                                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                    <div className="flex items-center gap-1"><Calendar size={14} /> {parseDate(reg.event.startTime).toLocaleDateString()}</div>
                                    <div className="flex items-center gap-1"><Clock size={14} /> {parseDate(reg.event.startTime).toLocaleTimeString()}</div>
                                    <div className="flex items-center gap-1"><MapPin size={14} /> {reg.event.venue}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(reg.status)}`}>
                                    {reg.status}
                                </span>
                                {reg.status !== 'CANCELLED' && (
                                    <button
                                        onClick={() => handleCancel(reg.id)}
                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
