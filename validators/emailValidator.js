// Validate email field for a user. Returns an array of error messages if validation fails.
// Excludes the current user's email (if provided) to avoid duplicate email error, thus allowing the existing user to update his own email to what he initially was using before without issues.
function validateEmail(email, users = null, currentUserId = null) {
    const errors = [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
        errors.push('Validation error: \'email\' field is required.');
    }
    if (typeof email === 'number' || !isNaN(email)) {
        errors.push('Validation error: \'email\' must be a string.');
    }
    if (email === "") {
        errors.push('Validation error: \'email\' cannot be an empty string.');
    }
    if (!emailRegex.test(email)) {
        errors.push('Validation error: \'email\' must be a valid email address.');
    }
    if (email.length > 100) {
        errors.push('Validation error: \'email\' cannot exceed 100 characters.');
    }
    // Validate if email already exists, excluding the current user's email.
    if (users.find(user => user.email.toLowerCase() === email.toLowerCase() && user.id !== currentUserId)) {
        errors.push('Validation error: A user with this email already exists.');
    }
    return errors;
}

module.exports = validateEmail;