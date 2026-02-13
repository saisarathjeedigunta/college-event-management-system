import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '../../lib/api';
import { useNavigate, Link } from 'react-router-dom';

const registerSchema = z.object({
    fullName: z.string().min(2, "Name is too short"),
    email: z.string().email().endsWith("@raghuenggcollege.in", "Must be a valid college email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const [showOtp, setShowOtp] = useState(false);
    const [emailForOtp, setEmailForOtp] = useState("");
    const [otp, setOtp] = useState("");
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterForm) => {
        try {
            await api.post('/auth/register', data);
            setEmailForOtp(data.email);
            setShowOtp(true);
        } catch (error: any) {
            alert(error.response?.data || "Registration failed");
        }
    };

    const handleVerify = async () => {
        try {
            await api.post('/auth/verify', { email: emailForOtp, otp });
            alert("Verified! Please login.");
            navigate('/login');
        } catch (error: any) {
            alert("Verification failed");
        }
    };

    if (showOtp) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded shadow-md w-96">
                    <h2 className="text-xl font-bold mb-4">Enter OTP</h2>
                    <p className="text-sm text-gray-600 mb-4">Sent to {emailForOtp}</p>
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full border p-2 rounded mb-4"
                        placeholder="6-digit code"
                    />
                    <button onClick={handleVerify} className="w-full bg-blue-600 text-white p-2 rounded">
                        Verify
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">Student Registration</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Full Name</label>
                        <input {...register("fullName")} className="w-full border p-2 rounded mt-1" />
                        {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium">College Email</label>
                        <input {...register("email")} className="w-full border p-2 rounded mt-1" placeholder="... @raghuenggcollege.in" />
                        {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Password</label>
                        <input type="password" {...register("password")} className="w-full border p-2 rounded mt-1" />
                        {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
                    </div>

                    <button disabled={isSubmitting} className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                        {isSubmitting ? "Registering..." : "Sign Up"}
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <Link to="/login" className="text-sm text-blue-600 hover:underline">Already have an account? Login</Link>
                </div>
            </div>
        </div>
    );
}
