const Joi = require("joi");

const projectSchema = Joi.object({
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
        }),
    description: Joi.string()
        .trim()
        .min(1)
        .max(255)
        .required()
        .messages({
            "string.empty": "Description is required",
            "any.required": "Description is required",
            "string.max": "Description must be less than or equal to 255 characters",
            "string.min": "Description must be less than or equal to 50 characters",

        }),
    start_date: Joi.date()
        .iso()
        .required()
        .messages({
            "date.base": "Start date must be a valid date",
            "any.required": "Start date is required",
            "date.format": "Start date must be in ISO format (YYYY-MM-DD)"
        }),
    end_date: Joi.date()
        .iso()
        .required()
        .messages({
            "date.base": "End date must be a valid date",
            "any.required": "End date is required",
            "date.format": "End date must be in ISO format (YYYY-MM-DD)"
        }),
    user_id: Joi.number()
        .integer()
        .required()
        .messages({
            "number.base": "User ID must be a number",
            "any.required": "User ID is required"
        })
}).custom((value, helpers) => {
    if (value.start_date && value.end_date && new Date(value.start_date) > new Date(value.end_date)) {
        return helpers.message('Start date cannot be after end date');
    }
    return value;
});

module.exports = { projectSchema };

