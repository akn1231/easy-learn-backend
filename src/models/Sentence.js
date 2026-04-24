const mongoose = require('mongoose');

const CATEGORIES = [
  'Greeting',
  'Daily Conversation',
  'Business',
  'Education',
  'Travel',
  'Food',
  'Health',
  'Technology',
  'Sports',
  'Culture',
  'Religion',
  'Family',
  'Nature',
  'Emotion',
  'Other',
];

const otherLangSchema = new mongoose.Schema(
  {
    lang: { type: String, required: true, trim: true, lowercase: true },
    text: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const sentenceSchema = new mongoose.Schema(
  {
    sentences: {
      en: {
        type: String,
        required: [true, 'English sentence is required'],
        trim: true,
        minlength: [2, 'English sentence is too short'],
      },
      bn: {
        type: String,
        required: [true, 'Bangla sentence is required'],
        trim: true,
        minlength: [1, 'Bangla sentence is too short'],
      },
      others: {
        type: [otherLangSchema],
        default: [],
        validate: {
          validator(arr) {
            const langs = arr.map((o) => o.lang);
            return langs.length === new Set(langs).size;
          },
          message: 'Duplicate language entries in others',
        },
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: { values: CATEGORIES, message: 'Invalid category' },
    },
    tags: {
      type: [String],
      default: [],
      set: (tags) => [...new Set(tags.map((t) => t.toLowerCase().trim()))],
    },
    additionalInfo: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Additional info cannot exceed 1000 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

sentenceSchema.index({ 'sentences.en': 'text', 'sentences.bn': 'text' });
sentenceSchema.index({ tags: 1 });
sentenceSchema.index({ category: 1 });
sentenceSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Sentence', sentenceSchema);
module.exports.CATEGORIES = CATEGORIES;
