import Joi from "joi";

export const registrationValidation = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.empty": "Please enter your name.",
    "any.required": "Please enter your name.",
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .trim()
    .required()
    .messages({
      "string.email": "Please enter a valid email.",
      "string.empty": "Please enter your email.",
      "any.required": "Please enter your email.",
    }),
  password: Joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters.",
    "string.empty": "Please enter a password.",
    "any.required": "Please enter a password.",
  }),
});

export const loginValidation = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .trim()
    .required()
    .messages({
      "string.email": "Please enter a valid email.",
      "string.empty": "Please enter your email.",
      "any.required": "Please enter your email.",
    }),
  password: Joi.string().required().messages({
    "string.empty": "Please enter your password.",
    "any.required": "Please enter your password.",
  }),
});
