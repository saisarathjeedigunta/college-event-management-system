import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '../../lib/api';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../lib/utils';
import { validatePassword } from '../../lib/passwordUtils';
import { PasswordStrengthIndicator } from '../../components/PasswordStrengthIndicator';

const registerSchema = z.object({
    fullName: z.string().min(2, "Name is too short"),
    email: z.string().email().endsWith("@raghuenggcollege.in", "Must be a valid college email"),
    password: z.string().min(8, "Password must be at least 8 characters")
        .refine((password) => {
            const validation = validatePassword(password);
            return validation.isValid;
        }, {
            message: "Password must contain uppercase, lowercase, number, and special character"
        }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const [showOtp, setShowOtp] = useState(false);
    const [emailForOtp, setEmailForOtp] = useState("");
    const [otp, setOtp] = useState("");
    const [resending, setResending] = useState(false);
    const [otpExpiryTime, setOtpExpiryTime] = useState<number | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    // Watch password field for real-time validation
    const watchedPassword = watch("password", "");

    useEffect(() => {
        setPassword(watchedPassword);
    }, [watchedPassword]);

    const onSubmit = async (data: RegisterForm) => {
        try {
            await api.post('/auth/register', {
                fullName: data.fullName,
                email: data.email,
                password: data.password,
            });
            setEmailForOtp(data.email);
            setShowOtp(true);
            // OTP expires in 10 minutes
            setOtpExpiryTime(Date.now() + 10 * 60 * 1000);
            toast.success("OTP Sent to your email!");
        } catch (error: any) {
            toast.error(getErrorMessage(error));
        }
    };

    const handleVerify = async () => {
        try {
            await api.post('/auth/verify', { email: emailForOtp, otp });
            toast.success("Verified! Please login.");
            navigate('/login');
        } catch (error: any) {
            toast.error(getErrorMessage(error));
        }
    };

    const handleResendOtp = async () => {
        setResending(true);
        try {
            await api.post('/auth/resend-otp', { email: emailForOtp });
            toast.success("New OTP sent to your email!");
            setOtp(""); // Clear previous OTP input
            // Reset expiry time for new OTP
            setOtpExpiryTime(Date.now() + 10 * 60 * 1000);
        } catch (error: any) {
            toast.error(getErrorMessage(error));
        } finally {
            setResending(false);
        }
    };

    // Countdown timer effect
    useEffect(() => {
        if (!otpExpiryTime) return;

        const interval = setInterval(() => {
            const remaining = Math.max(0, otpExpiryTime - Date.now());
            setTimeRemaining(remaining);

            if (remaining === 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [otpExpiryTime]);

    const formatTime = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (showOtp) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded shadow-md w-96">
                    <h2 className="text-2xl font-bold mb-6 text-center">Verify OTP</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        We sent a verification code to <strong>{emailForOtp}</strong>
                    </p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Enter OTP</label>
                            <input
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full border p-2 rounded mt-1"
                                placeholder="Enter 6-digit code"
                            />
                        </div>
                        <button
                            onClick={handleVerify}
                            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                        >
                            Verify
                        </button>
                        <button
                            onClick={handleResendOtp}
                            disabled={resending || timeRemaining > 0}
                            className={`w-full p-2 rounded ${timeRemaining > 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            {resending
                                ? "Sending..."
                                : timeRemaining > 0
                                    ? `Resend OTP (${formatTime(timeRemaining)})`
                                    : "Resend OTP"}
                        </button>
                        {timeRemaining > 0 && (
                            <p className="text-xs text-gray-500 text-center">
                                You can request a new OTP in {formatTime(timeRemaining)}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">College Event Registration</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Full Name</label>
                        <input
                            {...register("fullName")}
                            className="w-full border p-2 rounded mt-1"
                        />
                        {errors.fullName && (
                            <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium">College Email</label>
                        <input
                            {...register("email")}
                            className="w-full border p-2 rounded mt-1"
                            placeholder="yourname@raghuenggcollege.in"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Password</label>
                        <input
                            type="password"
                            {...register("password")}
                            className="w-full border p-2 rounded mt-1"
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                        )}
                        <PasswordStrengthIndicator password={password} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Confirm Password</label>
                        <input
                            type="password"
                            {...register("confirmPassword")}
                            className="w-full border p-2 rounded mt-1"
                        />
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {isSubmitting ? "Registering..." : "Register"}
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <Link to="/login" className="text-blue-600 hover:underline">
                        Already have an account? Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
