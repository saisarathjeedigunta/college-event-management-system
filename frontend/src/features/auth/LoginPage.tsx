import { useForm } from 'react-hook-form';
import { api } from '../../lib/api';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
    const navigate = useNavigate();
    const { register, handleSubmit } = useForm();

    const onSubmit = async (data: any) => {
        try {
            const res = await api.post('/auth/login', data);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);
            localStorage.setItem('department', res.data.department || '');

            // Redirect based on role
            if (res.data.role === 'STUDENT') {
                navigate('/events');
            } else {
                navigate('/events'); // Admins also go there for now, but see Create button
            }
        } catch (error: any) {
            alert(error.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">College Event Login</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Email</label>
                        <input {...register("email")} className="w-full border p-2 rounded mt-1" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Password</label>
                        <input type="password" {...register("password")} className="w-full border p-2 rounded mt-1" />
                    </div>

                    <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                        Login
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <Link to="/register" className="text-sm text-blue-600 hover:underline">Need an account? Register</Link>
                </div>
            </div>
        </div>
    );
}
