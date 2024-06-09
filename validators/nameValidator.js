// Validate name field for a user. Returns an array of error messages if validation fails.
function validateName(name) {
    const errors = [];

    if (!name) {
        errors.push('Validation error: \'name\' field is required.');
    }
    if (typeof name === 'number' || !isNaN(name)) {
        errors.push('Validation error: \'name\' must be a string.');
    }
    if (name === "") {
        errors.push('Validation error: \'name\' cannot be an empty string.');
    }
    if (name.length > 100) {
        errors.push('Validation error: \'name\' cannot exceed 100 characters.');
    }
    return errors;
}


module.exports = validateName;