// =========================================================
// EMAIL VALIDATION
// =========================================================
// Checks whether an email address follows a basic valid
// email format.
//
// Email fields are optional. A blank value is therefore
// considered valid. If an email is provided, it must follow
// the expected email format.

export function isValidEmail(
    value: string
): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        value.trim()
    );
}

// =========================================================
// EMAIL VALIDATION WITH ERROR MESSAGE
// =========================================================
// Used by forms where we want to show the user a specific
// validation message.
//
// Returns:
// - null when the email is empty or valid
// - an error message when the email is invalid

export function validateEmail(
    value: string,
    fieldName = "Email"
): string | null {
    const email = value.trim();

    // Email is optional.
    if (!email) {
        return null;
    }

    if (!isValidEmail(email)) {
        return `${fieldName} must be a valid email address.`;
    }

    return null;
}

// =========================================================
// PHONE NUMBER CLEANING
// =========================================================
// Removes spaces, dashes, brackets, and other non-numeric
// characters from a phone number.
//
// IMPORTANT:
// The number is NOT truncated.
//
// For example:
// 987654321789 remains 987654321789
//
// This allows validation to correctly detect numbers that
// contain more than 10 digits.

export function cleanPhone(
    value: string
): string {
    return value.replace(/\D/g, "");
}

// =========================================================
// PHONE NUMBER VALIDATION
// =========================================================
// Checks whether a phone number contains exactly 10 digits.
//
// The application allows numbers beginning with 5, 6, 7,
// 8, or 9.
//
// Examples:
// 9876543210 → valid
// 5123456789 → valid
// 987654321  → invalid
// 987654321789 → invalid

export function isValidPhone(
    value: string
): boolean {
    return /^[5-9]\d{9}$/.test(
        cleanPhone(value)
    );
}

// =========================================================
// PHONE VALIDATION WITH ERROR MESSAGE
// =========================================================
// Used by forms where we want to show the user a specific
// validation message.
//
// Returns:
// - null when the phone number is empty or valid
// - an error message when the phone number is invalid

export function validatePhone(
    value: string,
    fieldName = "Phone number"
): string | null {
    const phone = value.trim();

    // Phone number is optional.
    if (!phone) {
        return null;
    }

    if (!isValidPhone(phone)) {
        return `${fieldName} must be a valid 10-digit phone number.`;
    }

    return null;
}

// =========================================================
// PASSWORD VALIDATION
// =========================================================
// Checks whether a password:
// - contains at least 8 characters
// - contains at least one uppercase letter
// - contains at least one lowercase letter
// - contains at least one number
// - contains at least one special character

export function isValidPassword(
    value: string
): boolean {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*?]).{8,}$/.test(
        value
    );
}

// =========================================================
// PASSWORD VALIDATION WITH ERROR MESSAGE
// =========================================================
// Used by forms where we want to show the user a specific
// validation message.
//
// Returns:
// - null when the password is valid
// - an error message when the password is invalid

export function validatePassword(
    value: string
): string | null {
    if (!value.trim()) {
        return "Password is required.";
    }

    if (!isValidPassword(value)) {
        return "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.";
    }

    return null;
}

// =========================================================
// DATE OF BIRTH VALIDATION & CONVERSION
// =========================================================
// Accepts dates in the application's user-facing format:
//
// DD-MM-YYYY
//
// Example:
// 15-05-2012
//
// After validation, the date is converted to:
//
// YYYY-MM-DD
//
// This is the format expected by PostgreSQL/Supabase
// for a DATE column.

export function parseDateOfBirth(
    value: string
): string | null {
    const dob = value.trim();

    // Date of Birth is optional.
    if (!dob) {
        return null;
    }

    // Expected input format: DD-MM-YYYY
    const match =
        /^(\d{2})-(\d{2})-(\d{4})$/.exec(
            dob
        );

    if (!match) {
        return null;
    }

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);

    // Create the date and compare each part.
    // This rejects invalid dates such as:
    // 31-02-2012
    // 32-01-2012
    // 15-13-2012

    const date = new Date(
        year,
        month - 1,
        day
    );

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    // Convert DD-MM-YYYY to YYYY-MM-DD
    // for Supabase/PostgreSQL.

    return `${year
        .toString()
        .padStart(4, "0")}-${month
        .toString()
        .padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")}`;
}

// =========================================================
// GENDER VALIDATION
// =========================================================
// Allows only the gender values supported by the
// application:
//
// Male
// Female
// Other
//
// Validation is case-insensitive.

export function isValidGender(
    value: string
): boolean {
    return [
        "male",
        "female",
        "other",
    ].includes(
        value.trim().toLowerCase()
    );
}

// =========================================================
// REQUIRED FIELD VALIDATION
// =========================================================
// Checks whether a required text field contains a value.
//
// Whitespace-only input is considered empty.

export function isRequired(
    value: string
): boolean {
    return value.trim() !== "";
}

// =========================================================
// DATE RANGE VALIDATION
// =========================================================
// Both dates are optional.
//
// If both dates are provided, End Date cannot be before
// Start Date.
//
// Example:
// Start Date: 01-04-2026
// End Date:   31-03-2027
// → valid
//
// Start Date: 01-04-2026
// End Date:   01-03-2026
// → invalid

export function validateDateRange(
    startDate: string,
    endDate: string
): string | null {
    if (!startDate || !endDate) {
        return null;
    }

    if (endDate < startDate) {
        return "End Date cannot be before Start Date.";
    }

    return null;
}