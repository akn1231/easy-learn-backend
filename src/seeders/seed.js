require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Sentence = require('../models/Sentence');

const FRESH = process.argv.includes('--fresh');

const USERS = [
  { name: 'Admin User', email: 'admin@easylearn.app', password: 'admin123', role: 'admin' },
  { name: 'Demo User', email: 'demo@easylearn.app', password: 'demo123', role: 'user' },
];

const SENTENCES = (adminId) => [
  {
    sentences: {
      en: 'Good morning, how are you?',
      bn: 'শুভ সকাল, আপনি কেমন আছেন?',
      others: [{ lang: 'hi', text: 'शुभ प्रभात, आप कैसे हैं?' }],
    },
    category: 'Greeting',
    tags: ['formal', 'morning', 'common'],
    additionalInfo: 'Used in daily conversation to greet someone in the morning.',
    createdBy: adminId,
  },
  {
    sentences: {
      en: 'What is your name?',
      bn: 'আপনার নাম কী?',
      others: [{ lang: 'ar', text: 'ما اسمك؟' }],
    },
    category: 'Daily Conversation',
    tags: ['introduction', 'question', 'basic'],
    additionalInfo: 'A fundamental question for introductions.',
    createdBy: adminId,
  },
  {
    sentences: {
      en: 'Please speak slowly, I am learning.',
      bn: 'অনুগ্রহ করে ধীরে কথা বলুন, আমি শিখছি।',
      others: [],
    },
    category: 'Education',
    tags: ['learning', 'request', 'polite'],
    additionalInfo: 'Useful when speaking with native speakers.',
    createdBy: adminId,
  },
  {
    sentences: {
      en: 'Where is the nearest hospital?',
      bn: 'নিকটতম হাসপাতাল কোথায়?',
      others: [{ lang: 'fr', text: 'Où est l\'hôpital le plus proche?' }],
    },
    category: 'Health',
    tags: ['emergency', 'location', 'hospital'],
    additionalInfo: 'Critical sentence for emergencies.',
    createdBy: adminId,
  },
  {
    sentences: {
      en: 'How much does this cost?',
      bn: 'এটার দাম কত?',
      others: [{ lang: 'es', text: '¿Cuánto cuesta esto?' }],
    },
    category: 'Travel',
    tags: ['shopping', 'price', 'market'],
    additionalInfo: 'Commonly used when shopping or traveling.',
    createdBy: adminId,
  },
  {
    sentences: {
      en: 'I would like to order food, please.',
      bn: 'আমি খাবার অর্ডার করতে চাই, অনুগ্রহ করে।',
      others: [],
    },
    category: 'Food',
    tags: ['restaurant', 'order', 'polite'],
    additionalInfo: 'Use in restaurants or food stalls.',
    createdBy: adminId,
  },
  {
    sentences: {
      en: 'Can you help me with this project?',
      bn: 'আপনি কি এই প্রকল্পে আমাকে সাহায্য করতে পারবেন?',
      others: [],
    },
    category: 'Business',
    tags: ['work', 'collaboration', 'request'],
    additionalInfo: 'Professional context usage.',
    createdBy: adminId,
  },
  {
    sentences: {
      en: 'The weather is very nice today.',
      bn: 'আজকের আবহাওয়া খুব সুন্দর।',
      others: [{ lang: 'de', text: 'Das Wetter ist heute sehr schön.' }],
    },
    category: 'Daily Conversation',
    tags: ['weather', 'casual', 'smalltalk'],
    additionalInfo: 'Common small-talk starter.',
    createdBy: adminId,
  },
  {
    sentences: {
      en: 'I am studying computer science.',
      bn: 'আমি কম্পিউটার বিজ্ঞান পড়ছি।',
      others: [],
    },
    category: 'Education',
    tags: ['study', 'technology', 'introduction'],
    additionalInfo: '',
    createdBy: adminId,
  },
  {
    sentences: {
      en: 'Do you use social media?',
      bn: 'আপনি কি সোশ্যাল মিডিয়া ব্যবহার করেন?',
      others: [],
    },
    category: 'Technology',
    tags: ['internet', 'social', 'modern'],
    additionalInfo: 'Modern conversation about digital life.',
    createdBy: adminId,
  },
  {
    sentences: {
      en: 'My family is very important to me.',
      bn: 'আমার পরিবার আমার কাছে খুব গুরুত্বপূর্ণ।',
      others: [{ lang: 'ar', text: 'عائلتي مهمة جداً بالنسبة لي.' }],
    },
    category: 'Family',
    tags: ['values', 'family', 'personal'],
    additionalInfo: '',
    createdBy: adminId,
  },
  {
    sentences: {
      en: 'Thank you for your kindness.',
      bn: 'আপনার দয়ার জন্য ধন্যবাদ।',
      others: [
        { lang: 'ja', text: 'ご親切にありがとうございます。' },
        { lang: 'ko', text: '친절에 감사합니다.' },
      ],
    },
    category: 'Greeting',
    tags: ['gratitude', 'polite', 'common'],
    additionalInfo: 'Universal expression of thanks.',
    createdBy: adminId,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[seed] Connected to MongoDB');

  if (FRESH) {
    await User.deleteMany({});
    await Sentence.deleteMany({});
    console.log('[seed] Cleared existing data');
  }

  // Upsert users
  const createdUsers = [];
  for (const u of USERS) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      console.log(`[seed] User already exists: ${u.email}`);
      createdUsers.push(existing);
    } else {
      const user = await User.create(u);
      console.log(`[seed] Created user: ${u.email}`);
      createdUsers.push(user);
    }
  }

  const adminUser = createdUsers.find((u) => u.role === 'admin');

  // Seed sentences only if collection is empty
  const count = await Sentence.countDocuments();
  if (count === 0) {
    await Sentence.insertMany(SENTENCES(adminUser._id));
    console.log(`[seed] Inserted ${SENTENCES(adminUser._id).length} sample sentences`);
  } else {
    console.log(`[seed] Skipping sentences — ${count} already exist (use --fresh to reset)`);
  }

  await mongoose.disconnect();
  console.log('[seed] Done');
}

seed().catch((err) => {
  console.error('[seed] Failed:', err.message);
  process.exit(1);
});
