import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import EventCard from '../../components/EventCard';
import DashboardLayout from '../../layouts/DashboardLayout';

interface Event {
    id: number;
    title: string;
    startTime: string;
    venue: string;
    description: string;
    attendeeCount: number;
    capacity: number;
    tags?: string;
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [registeredIds, setRegisteredIds] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const role = localStorage.getItem('role');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const eventsRes = await api.get('/events');
            setEvents(eventsRes.data);

            if (role === 'STUDENT') {
                try {
                    const regRes = await api.get('/registrations/my');
                    if (Array.isArray(regRes.data)) {
                        const activeRegs = regRes.data.filter((r: any) => r.status !== 'CANCELLED');
                        const ids = new Set(activeRegs.map((r: any) => r.event.id));
                        setRegisteredIds(ids);
                    }
                } catch (regErr) {
                    console.warn("Failed to fetch registrations", regErr);
                    // Don't show error to user, just skip marking as registered
                }
            }
        } catch (err: any) {
            console.error("Load error:", err);
            setError(err.message || "Failed to load events");
        } finally {
            setLoading(false);
        }
    };

    const parseDate = (dateVal: any) => {
        if (!dateVal) return new Date();
        if (Array.isArray(dateVal)) {
            // Spring Boot often returns LocalDateTime as [2026, 2, 15, 10, 0]
            return new Date(dateVal[0], dateVal[1] - 1, dateVal[2], dateVal[3], dateVal[4]);
        }
        return new Date(dateVal);
    };

    const formatDate = (dateVal: any) => {
        const date = parseDate(dateVal);
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    };

    const formatTime = (dateVal: any) => {
        const date = parseDate(dateVal);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <DashboardLayout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Upcoming Events</h1>
                    <p className="text-gray-500 mt-1">Check out what's happening at Raghu Engineering College.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                    <div className="text-gray-500">Loading events...</div>
                </div>
            ) : error ? (
                <div className="text-center py-20 bg-red-50 rounded-xl border border-red-200">
                    <p className="text-red-600 font-medium">Error: {error}</p>
                    <button onClick={() => window.location.reload()} className="mt-4 text-sm text-red-700 underline">Retry</button>
                </div>
            ) : events.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">No upcoming events scheduled yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map(event => (
                        <EventCard
                            key={event.id}
                            id={event.id}
                            title={event.title}
                            date={formatDate(event.startTime)}
                            time={formatTime(event.startTime)}
                            venue={event.venue}
                            tags={event.tags ? event.tags.split(',') : ['General']}
                            attendees={event.attendeeCount || 0}
                            capacity={event.capacity || 50}
                            isRegistered={registeredIds.has(event.id)}
                            onRefresh={loadData}
                        />
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
