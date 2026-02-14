import { validatePassword, getPasswordRequirements, getStrengthColor, getStrengthTextColor, getStrengthPercentage } from '../lib/passwordUtils';

interface PasswordStrengthIndicatorProps {
    password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
    const validation = validatePassword(password);
    const requirements = getPasswordRequirements();
    const strengthPercentage = getStrengthPercentage(validation.requirements);

    // Don't show indicator if password is empty
    if (!password) return null;

    return (
        <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            {/* Requirements Checklist */}
            <div className="space-y-2 mb-3">
                <p className="text-sm font-medium text-gray-700">Password Requirements:</p>
                {requirements.map((req) => {
                    const isMet = validation.requirements[req.id];
                    return (
                        <div key={req.id} className="flex items-center gap-2 text-sm">
                            <span className={isMet ? 'text-green-600' : 'text-red-600'}>
                                {isMet ? '✅' : '❌'}
                            </span>
                            <span className={isMet ? 'text-gray-700' : 'text-gray-500'}>
                                {req.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Strength Meter */}
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Strength:</span>
                    <span className={`text-sm font-semibold ${getStrengthTextColor(validation.strength)}`}>
                        {validation.strength.charAt(0).toUpperCase() + validation.strength.slice(1)}
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(validation.strength)}`}
                        style={{ width: `${strengthPercentage}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
