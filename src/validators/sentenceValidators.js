const { body, query, validationResult } = require('express-validator');
const { CATEGORIES } = require('../models/Sentence');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const sentenceBodyRules = [
  body('sentences.en')
    .trim()
    .isLength({ min: 2 })
    .withMessage('English sentence must be at least 2 characters'),
  body('sentences.bn')
    .trim()
    .notEmpty()
    .withMessage('Bangla sentence is required'),
  body('sentences.others')
    .optional()
    .isArray()
    .withMessage('others must be an array'),
  body('sentences.others.*.lang')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Language code is required in others'),
  body('sentences.others.*.text')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Text is required in others'),
  body('category')
    .isIn(CATEGORIES)
    .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be 1-30 characters'),
  body('additionalInfo')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Additional info cannot exceed 1000 characters'),
];

const listQueryRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
];

module.exports = { sentenceBodyRules, listQueryRules, handleValidation };
