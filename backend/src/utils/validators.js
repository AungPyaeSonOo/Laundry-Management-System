const { validationResult } = require('express-validator');

// Check if email is valid
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Check if phone number is valid
const isValidPhone = (phone) => {
    const phoneRegex = /^[0-9+\-\s()]+$/;
    return phoneRegex.test(phone);
};

// Check if date is valid
const isValidDate = (date) => {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
};

// Check if date is in future
const isFutureDate = (date) => {
    const d = new Date(date);
    return d > new Date();
};

// Check if date is in past
const isPastDate = (date) => {
    const d = new Date(date);
    return d < new Date();
};

// Validate Myanmar phone numbers
const isValidMyanmarPhone = (phone) => {
    // Myanmar phone numbers: 09XXXXXXXXX
    const myanmarPhoneRegex = /^(09|\+?959)\d{7,9}$/;
    return myanmarPhoneRegex.test(phone);
};

// Check if string is empty
const isEmpty = (str) => {
    return !str || str.trim().length === 0;
};

// Check if string length is within range
const isLengthBetween = (str, min, max) => {
    if (!str) return false;
    const len = str.trim().length;
    return len >= min && len <= max;
};

// Validate order number format
const isValidOrderNumber = (orderNumber) => {
    const orderRegex = /^ORD-\d{6}-\d{4}$/;
    return orderRegex.test(orderNumber);
};

// Validate employee code format
const isValidEmployeeCode = (code) => {
    const codeRegex = /^EMP-\d{13}-\d{1,3}$/;
    return codeRegex.test(code);
};

// Sanitize input (remove extra spaces, HTML tags)
const sanitizeInput = (str) => {
    if (!str) return '';
    return str.trim().replace(/<[^>]*>/g, '');
};

// Format phone number (remove spaces and special chars)
const formatPhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/[\s\-()]/g, '');
};

// Get validation errors
const getValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return errors.array().map(err => ({
            field: err.path,
            message: err.msg,
            value: err.value
        }));
    }
    return null;
};

// Check if has validation errors
const hasValidationErrors = (req) => {
    const errors = validationResult(req);
    return !errors.isEmpty();
};

// Validate required fields
const validateRequired = (data, fields) => {
    const errors = [];
    for (const field of fields) {
        if (!data[field] || data[field].trim().length === 0) {
            errors.push(`${field} is required`);
        }
    }
    return errors;
};

// Validate numeric range
const isNumericRange = (value, min, max) => {
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    return num >= min && num <= max;
};

// Validate percentage (0-100)
const isValidPercentage = (value) => {
    return isNumericRange(value, 0, 100);
};

// Validate positive number
const isPositiveNumber = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
};

// Validate non-negative number
const isNonNegativeNumber = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
};

// Validate Myanmar currency (Kyat)
const formatKyat = (amount) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '0 MMK';
    return `${num.toLocaleString()} MMK`;
};

// Generate random string
const generateRandomString = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// Truncate text
const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

module.exports = {
    isValidEmail,
    isValidPhone,
    isValidDate,
    isFutureDate,
    isPastDate,
    isValidMyanmarPhone,
    isEmpty,
    isLengthBetween,
    isValidOrderNumber,
    isValidEmployeeCode,
    sanitizeInput,
    formatPhone,
    getValidationErrors,
    hasValidationErrors,
    validateRequired,
    isNumericRange,
    isValidPercentage,
    isPositiveNumber,
    isNonNegativeNumber,
    formatKyat,
    generateRandomString,
    truncateText
};