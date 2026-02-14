import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '../../lib/api';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../lib/utils';
import { sessionManager } from '../../services/sessionManager';
import { SessionWarningModal } from '../../components/SessionWarningModal';

export default function LoginPage() {
    const navigate = useNavigate();
    const { register, handleSubmit } = useForm();
    const [showWarning, setShowWarning] = useState(false);
    const [existingSession, setExistingSession] = useState<any>(null);
    const [pendingLoginData, setPendingLoginData] = useState<any>(null);

    const performLogin = async (data: any, forceLogout: boolean = false) => {
        try {
            const res = await api.post('/auth/login', data);

            // If forcing logout, broadcast to other tabs first
            if (forceLogout) {
                sessionManager.broadcastLogout();
            }

            // Register this session
            sessionManager.broadcastLogin(
                res.data.token,
                res.data.userId || res.data.email,
                res.data.email,
                res.data.role
            );

            localStorage.setItem('role', res.data.role);
            localStorage.setItem('department', res.data.department || '');

            // Redirect based on role
            if (res.data.role === 'STUDENT') {
                navigate('/events');
            } else {
                navigate('/events');
            }
            toast.success("Login Successful!");
        } catch (error: any) {
            console.error('Login Error:', error);
            toast.error(getErrorMessage(error));
        }
    };

    const onSubmit = async (data: any) => {
        // Check for existing session
        const existing = sessionManager.checkExistingSession();

        if (existing) {
            // Show warning modal
            setExistingSession(existing);
            setPendingLoginData(data);
            setShowWarning(true);
        } else {
            // No existing session, proceed with login
            await performLogin(data, false);
        }
    };

    const handleContinueLogin = async () => {
        setShowWarning(false);
        if (pendingLoginData) {
            await performLogin(pendingLoginData, true);
            setPendingLoginData(null);
        }
    };

    const handleCancelLogin = () => {
        setShowWarning(false);
        setPendingLoginData(null);
        setExistingSession(null);
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
                    <Link to="/register" className="text-blue-600 hover:underline">
                        Don't have an account? Sign Up
                    </Link>
                </div>
            </div>

            <SessionWarningModal
                isOpen={showWarning}
                existingSession={existingSession}
                onContinue={handleContinueLogin}
                onCancel={handleCancelLogin}
            />
        </div>
    );
}
