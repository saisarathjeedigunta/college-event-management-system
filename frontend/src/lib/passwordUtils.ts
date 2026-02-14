// Password validation utilities

export interface PasswordRequirements {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
}

export interface PasswordValidation {
    isValid: boolean;
    requirements: PasswordRequirements;
    strength: 'weak' | 'medium' | 'strong';
}

export interface PasswordRequirement {
    id: keyof PasswordRequirements;
    label: string;
    test: (password: string) => boolean;
}

/**
 * Validate password against all requirements
 */
export const validatePassword = (password: string): PasswordValidation => {
    const requirements: PasswordRequirements = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
    };

    const metCount = Object.values(requirements).filter(Boolean).length;
    const strength = metCount <= 2 ? 'weak' : metCount <= 4 ? 'medium' : 'strong';
    const isValid = Object.values(requirements).every(Boolean);

    return { isValid, requirements, strength };
};

/**
 * Get list of password requirements with test functions
 */
export const getPasswordRequirements = (): PasswordRequirement[] => {
    return [
        {
            id: 'minLength',
            label: 'At least 8 characters',
            test: (password) => password.length >= 8,
        },
        {
            id: 'hasUppercase',
            label: 'One uppercase letter (A-Z)',
            test: (password) => /[A-Z]/.test(password),
        },
        {
            id: 'hasLowercase',
            label: 'One lowercase letter (a-z)',
            test: (password) => /[a-z]/.test(password),
        },
        {
            id: 'hasNumber',
            label: 'One number (0-9)',
            test: (password) => /\d/.test(password),
        },
        {
            id: 'hasSpecialChar',
            label: 'One special character (!@#$%...)',
            test: (password) => /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
        },
    ];
};

/**
 * Get strength color class for Tailwind
 */
export const getStrengthColor = (strength: 'weak' | 'medium' | 'strong'): string => {
    switch (strength) {
        case 'weak':
            return 'bg-red-500';
        case 'medium':
            return 'bg-yellow-500';
        case 'strong':
            return 'bg-green-500';
    }
};

/**
 * Get strength text color class for Tailwind
 */
export const getStrengthTextColor = (strength: 'weak' | 'medium' | 'strong'): string => {
    switch (strength) {
        case 'weak':
            return 'text-red-600';
        case 'medium':
            return 'text-yellow-600';
        case 'strong':
            return 'text-green-600';
    }
};

/**
 * Calculate strength percentage for progress bar
 */
export const getStrengthPercentage = (requirements: PasswordRequirements): number => {
    const metCount = Object.values(requirements).filter(Boolean).length;
    return (metCount / 5) * 100;
};
