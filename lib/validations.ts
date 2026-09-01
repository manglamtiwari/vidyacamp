// lib/validations.ts

// -----------------------------
// Phone Number Validation
// -----------------------------

export function validatePhone(
    phone: string,
    fieldName = "Phone number"
): string | null {
    const value = phone.trim();

    // Phone is optional
    if (!value) {
        return null;
    }

    // Indian phone number:
    // Exactly 10 digits
    // First digit must be 5, 6, 7, 8 or 9
    if (!/^[5-9]\d{9}$/.test(value)) {
        return `${fieldName} must be a valid 10-digit phone number.`;
    }

    return null;
}


// -----------------------------
// Email Validation
// -----------------------------

export function validateEmail(
    email: string,
    fieldName = "Email"
): string | null {
    const value = email.trim();

    // Email is optional
    if (!value) {
        return null;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return `${fieldName} must be a valid email address.`;
    }

    return null;
}