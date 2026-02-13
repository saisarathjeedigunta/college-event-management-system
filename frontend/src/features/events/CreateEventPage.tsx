import { useForm } from 'react-hook-form';
import { api } from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';

export default function CreateEventPage() {
    const navigate = useNavigate();
    const { register, handleSubmit } = useForm();
    const role = localStorage.getItem('role');
    const userDept = localStorage.getItem('department');

    const onSubmit = async (data: any) => {
        try {
            // Include user department if they are a DEPT_ADMIN
            const eventData = {
                ...data,
                department: role === 'DEPT_ADMIN' ? userDept : data.department
            };

            await api.post('/events', eventData);
            alert("Event created successfully!");
            navigate('/events');
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to create event");
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
                <h1 className="text-2xl font-bold mb-6">Create New Event</h1>

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
                        <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700">
                            Create Event
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
