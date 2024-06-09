// Validate age field for a user. Returns an array of error messages if validation fails.
function validateAge(age) {
    const errors = [];

    if (!age) {
        errors.push('Validation error: \'age\' field is required.');
    }
    if (age === "" || age === null) {
        errors.push('Validation error: \'age\' cannot be an empty string or null.');
    }
    if (isNaN(age)) {
        errors.push('Validation error: \'age\' must be a number.');
    }
    if (age <= 0 || age > 120) {
        errors.push('Validation error: \'age\' must be a positive number between 1 and 120.');
    }
    return errors;
}

module.exports = validateAge;