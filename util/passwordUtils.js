const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Joi = require("joi");

// Enhanced password validation schema
const strictPasswordSchema = Joi.string()
  .pattern(/^(?=.*[A-Za-z])[A-Za-z\d\W]{8,20}$/)
  .required()
  .messages({
    "string.pattern.base": "Password must be 8-20 characters, contain at least one letter, and not be only digits or symbols.",
    "any.required": "Password is required"
  });

// Additional password complexity check
const checkPasswordComplexity = (password) => {
    const checks = {
        length: password.length <= 8,
        hasLetter: /[A-Za-z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        noCommonPatterns: !/(123|abc|password|qwerty|admin)/i.test(password),
        noRepeatingChars: !/(.)\1{2,}/.test(password)
    };

    const failedChecks = Object.entries(checks)
        .filter(([_, passed]) => !passed)
        .map(([check, _]) => check);

    return {
        isValid: failedChecks.length === 0,
        failedChecks,
        score: Object.values(checks).filter(Boolean).length
    };
};

// Password validation function using Joi + complexity check
const validatePassword = (password) => {
    const { error, value } = strictPasswordSchema.validate(password);
    
    if (error) {
        return {
            isValid: false,
            errors: [error.details[0].message]
        };
    }

    // Then check complexity
    const complexity = checkPasswordComplexity(password);
    
    if (!complexity.isValid) {
        const errorMessages = {
            length: 'Password must be at least 8 characters long',
            hasLetter: 'Password must contain at least one letter',
            hasNumber: 'Password must contain at least one number',
            hasSpecial: 'Password must contain at least one special character',
            noCommonPatterns: 'Password cannot contain common patterns',
            noRepeatingChars: 'Password cannot have repeating characters'
        };

        return {
            isValid: false,
            errors: complexity.failedChecks.map(check => errorMessages[check])
        };
    }
    
    return {
        isValid: true,
        errors: [],
        score: complexity.score
    };
};


// Secure password comparison using timing-safe comparison
const comparePassword = async (candidatePassword, hashedPassword) => {
    try {
        // Use bcrypt.compare which is already timing-safe
        return await bcrypt.compare(candidatePassword, hashedPassword);
    } catch (error) {
        // In case of error, return false instead of throwing
        // This prevents timing attacks by not revealing if the hash is valid
        return false;
    }
};

// Secure string comparison using crypto.timingSafeEqual
const secureStringCompare = (str1, str2) => {
    try {
        // Convert strings to buffers for timing-safe comparison
        const buf1 = Buffer.from(str1, 'utf8');
        const buf2 = Buffer.from(str2, 'utf8');
        
        // Ensure both buffers have the same length to prevent timing attacks
        if (buf1.length !== buf2.length) {
            // Create a dummy comparison with same length to maintain timing consistency
            const dummyBuf = Buffer.alloc(buf1.length);
            crypto.timingSafeEqual(buf1, dummyBuf);
            return false;
        }
        
        return crypto.timingSafeEqual(buf1, buf2);
    } catch (error) {
        // In case of error, return false to prevent timing attacks
        return false;
    }
};

// Secure token comparison
const secureTokenCompare = (token1, token2) => {
    if (!token1 || !token2) {
        return false;
    }
    return secureStringCompare(token1, token2);
};

// Generate secure random password
const generateSecurePassword = (length = 12) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one character from each category
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // uppercase
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // lowercase
    password += '0123456789'[Math.floor(Math.random() * 10)]; // number
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // special
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
};

// Generate cryptographically secure random token
const generateSecureToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

// Generate secure random string
const generateSecureString = (length = 16) => {
    return crypto.randomBytes(length).toString('base64url');
};

module.exports = {
    validatePassword,
    comparePassword,
    secureStringCompare,
    secureTokenCompare,
    generateSecurePassword,
    generateSecureToken,
    generateSecureString,
    strictPasswordSchema,
    checkPasswordComplexity
}; 