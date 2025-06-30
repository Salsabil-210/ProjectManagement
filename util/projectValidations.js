const Joi = require("joi");

name: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
        "string.empty": "Name of project is required",
        "string.min": "Name must be at least 1 character",
        "string.max": "Name must be less than or equal to 50 characters",
        "any.required": "Name is required"
    })

