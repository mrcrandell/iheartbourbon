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

export const bourbonValidation = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.empty": "Please enter a bourbon name.",
    "any.required": "Please enter a bourbon name.",
  }),
  imageUrl: Joi.string().uri().allow("").optional().messages({
    "string.uri": "Please enter a valid URL.",
  }),
});

export const entryValidation = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required().messages({
    "number.min": "Rating must be at least 1.",
    "number.max": "Rating must be at most 5.",
    "any.required": "Please select a rating.",
  }),
  isThumbsUp: Joi.boolean().required().messages({
    "any.required": "Please select thumbs up or down.",
  }),
  comment: Joi.string().allow("").optional(),
  bourbonId: Joi.string().uuid().required().messages({
    "any.required": "Bourbon ID is required.",
  }),
  groupIds: Joi.array().items(Joi.string()).optional(),
});

export const bourbonAndEntryValidation = bourbonValidation.concat(
  Joi.object({
    rating: Joi.number().integer().min(1).max(5).required().messages({
      "number.min": "Rating must be at least 1.",
      "number.max": "Rating must be at most 5.",
      "any.required": "Please select a rating.",
    }),
    isThumbsUp: Joi.boolean().required().messages({
      "any.required": "Please select thumbs up or down.",
    }),
    comment: Joi.string().allow("").optional(),
    groupIds: Joi.array().items(Joi.string()).optional(),
  }),
);
