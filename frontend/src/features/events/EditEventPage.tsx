import { useForm } from 'react-hook-form';
import { api } from '../../lib/api';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useEffect, useState } from 'react';

export default function EditEventPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { register, handleSubmit, reset } = useForm();
    const [loading, setLoading] = useState(true);
    const role = localStorage.getItem('role');
    const userDept = localStorage.getItem('department');

    useEffect(() => {
        api.get(`/events/${id}`)
            .then(res => {
                const data = res.data;
                // Format dates for datetime-local input
                const formatDateTime = (dateStr: string) => {
                    if (!dateStr) return '';
                    const date = new Date(dateStr);
                    // Handle Spring Boot's array format if necessary, but api.ts should handle it if interceptors are set
                    // If it's a string, we need YYYY-MM-DDThh:mm
                    const tzOffset = date.getTimezoneOffset() * 60000;
                    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
                };

                reset({
                    ...data,
                    startTime: formatDateTime(data.startTime),
                    endTime: formatDateTime(data.endTime)
                });
            })
            .catch(err => {
                alert("Failed to load event");
                navigate('/events');
            })
            .finally(() => setLoading(false));
    }, [id, reset, navigate]);

    const onSubmit = async (data: any) => {
        try {
            const eventData = {
                ...data,
                department: role === 'DEPT_ADMIN' ? userDept : data.department
            };

            await api.put(`/events/${id}`, eventData);
            alert("Event updated successfully!");
            navigate('/events');
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to update event");
        }
    };

    if (loading) return <DashboardLayout><div>Loading...</div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
                <h1 className="text-2xl font-bold mb-6">Edit Event</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Event Title</label>
                        <input {...register("title")} className="w-full border p-2 rounded mt-1" required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Description</label>
                        <textarea {...register("description")} className="w-full border p-2 rounded mt-1" rows={3} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Start Time</label>
                            <input type="datetime-local" {...register("startTime")} className="w-full border p-2 rounded mt-1" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">End Time</label>
                            <input type="datetime-local" {...register("endTime")} className="w-full border p-2 rounded mt-1" required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Venue</label>
                        <input {...register("venue")} className="w-full border p-2 rounded mt-1" required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Capacity</label>
                        <input type="number" {...register("capacity")} className="w-full border p-2 rounded mt-1" required />
                    </div>

                    {role === 'SUPER_ADMIN' && (
                        <div>
                            <label className="block text-sm font-medium">Department</label>
                            <select {...register("department")} className="w-full border p-2 rounded mt-1">
                                <option value="General">General</option>
                                <option value="CSE">CSE</option>
                                <option value="ECE">ECE</option>
                                <option value="MECH">MECH</option>
                            </select>
                        </div>
                    )}

                    <div className="pt-4 flex gap-4">
                        <button type="button" onClick={() => navigate('/events')} className="flex-1 px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
