const Joi = require("joi");

const validateEmail = (email) => {
    const schema = Joi.string()
        .email({ tlds: { allow: false } })
        .pattern(/^[^\s@]+@[^\s@]+\.com$/) 
        .required()
        .messages({
            "string.email": "Invalid email format",
            "string.pattern.base": "Email must end with .com and contain no spaces",
            "any.required": "Email is required",
        });

    const { error } = schema.validate(email);
    return error ? error.details[0].message : null;
};

const strictPasswordSchema = Joi.string()
  .pattern(/^(?=.*[A-Za-z])[A-Za-z\d\W]{6,20}$/)
  .required()
  .messages({
    "string.pattern.base": "Password must be 6-20 characters, contain at least one letter, and not be only digits or symbols.",
    "any.required": "Password is required"
  });

const validatePassword = (password) => {
  const { error } = strictPasswordSchema.validate(password);
  return error ? error.details[0].message : null;
};

const validateResetToken = (token) => {
    const schema = Joi.string().length(6).pattern(/^[0-9]{6}$/).required();
    const { error } = schema.validate(token);
    return !error; 
};

const registerValidation = Joi.object({
    name: Joi.string()
        .min(3)
        .max(50)
        .pattern(/^\S+$/) 
        .required()
        .messages({
            "string.empty": "Name is required",
            "string.min": "Name must be at least 3 characters",
            "string.max": "Name must be less than 50 characters",
            "string.pattern.base": "Name cannot contain spaces",
            "any.required": "Name is required",
        }),
    surname: Joi.string()
        .min(3)
        .max(50)
        .pattern(/^\S+$/) 
        .required()
        .messages({
            "string.empty": "Surname is required",
            "string.min": "Surname must be at least 3 characters",
            "string.max": "Surname must be less than 50 characters",
            "string.pattern.base": "Surname cannot contain spaces",
            "any.required": "Surname is required",
        }),
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) 
        .pattern(/\.com$/) 
        .required()
        .messages({
            "string.email": "Invalid email format",
            "string.pattern.base": "Email must be a valid format and end with .com",
            "any.required": "Email is required",
        }),
     password: Joi.string()
      .pattern(/^(?=.*[A-Za-z])[A-Za-z\d\W]{6,20}$/)
      .required()
      .messages({
        "string.pattern.base": "Password must be 6-20 characters, contain at least one letter, and not be only digits or symbols.",
        "any.required": "Password is required"
      }),
    is_admin: Joi.boolean().optional()
});

const loginValidation = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) 
        .pattern(/\.com$/) 
        .required()
        .messages({
            "string.email": "Invalid email format",
            "string.pattern.base": "Email must be a valid format and end with .com",
            "any.required": "Email is required",
        }),
    password: Joi.string()
        .pattern(/^\S+$/)
        .required()
        .messages({
            "any.required": "Password is required",
        }),
});

const passwordResetValidation = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) 
        .pattern(/\.com$/) 
        .required()
        .messages({
            "string.email": "Invalid email format",
            "string.pattern.base": "Email must be a valid format and end with .com",
            "any.required": "Email is required",
        }),
});

const newPasswordValidation = Joi.object({
    token: Joi.string()
        .length(6)
        .pattern(/^[0-9]{6}$/)
        .required()
        .messages({
            "string.length": "Reset token must be exactly 6 digits",
            "string.pattern.base": "Reset token must contain only numbers",
            "any.required": "Reset token is required",
        }),
    newPassword: Joi.string()
        .pattern(/^(?=.*[A-Za-z])[A-Za-z\d\W]{6,20}$/)
        .required()
        .messages({
            "string.pattern.base": "Password must be 6-20 characters, contain at least one letter, and not be only digits or symbols.",
            "any.required": "New password is required"
        }),
});

const profileUpdateValidation = Joi.object({
    name: Joi.string()
        .min(3)
        .max(50)
        .pattern(/^\S+$/)
        .optional()
        .messages({
            "string.min": "Name must be at least 3 characters",
            "string.max": "Name must be less than 50 characters",
            "string.pattern.base": "Name cannot contain spaces",
        }),
    surname: Joi.string()
        .min(3)
        .max(50)
        .pattern(/^\S+$/) 
        .optional()
        .messages({
            "string.min": "Surname must be at least 3 characters",
            "string.max": "Surname must be less than 50 characters",
            "string.pattern.base": "Surname cannot contain spaces",
        }),
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) 
        .pattern(/\.com$/) 
        .optional()
        .messages({
            "string.email": "Invalid email format",
            "string.pattern.base": "Email must be a valid format and end with .com",
        }),
});

const changePasswordValidation = Joi.object({
    currentPassword: Joi.string()
        .pattern(/^\S+$/) 
        .required()
        .messages({
            "any.required": "Current password is required",
        }),
    newPassword: Joi.string()
        .pattern(/^(?=.*[A-Za-z])[A-Za-z\d\W]{6,20}$/)
        .required()
        .messages({
            "string.pattern.base": "Password must be 6-20 characters, contain at least one letter, and not be only digits or symbols.",
            "any.required": "New password is required"
        }),
});

const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false, 
            stripUnknown: true 
        });

        if (error) {
            const errors = error.details.map(detail => detail.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors
            });
        }

        req.body = value;
        next();
    };
};

module.exports = {
    registerValidation,
    loginValidation,
    passwordResetValidation,
    newPasswordValidation,
    profileUpdateValidation,
    changePasswordValidation,
    
    validateEmail,
    validatePassword,
    validateResetToken,
    strictPasswordSchema,
    
    // Middleware functions
    validateRegistration: validate(registerValidation),
    validateLogin: validate(loginValidation),
    validatePasswordReset: validate(passwordResetValidation),
    validateNewPassword: validate(newPasswordValidation),
    validateProfileUpdate: validate(profileUpdateValidation),
    validateChangePassword: validate(changePasswordValidation),
}; 