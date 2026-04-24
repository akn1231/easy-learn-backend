const Sentence = require('../models/Sentence');
const { success, created, notFound } = require('../utils/response');

async function getAll(req, res) {
  const {
    search = '',
    category = '',
    tags = '',
    lang = '',
    page = 1,
    limit = 8,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const conditions = [];

  // Visibility rules
  if (req.user?.role === 'admin') {
    // Admin sees everything
  } else if (req.user) {
    // Logged-in user sees approved sentences + their own unapproved
    conditions.push({ $or: [{ isApproved: true }, { createdBy: req.user._id }] });
  } else {
    // Guest sees approved only
    conditions.push({ isApproved: true });
  }

  if (search.trim()) {
    conditions.push({
      $or: [
        { 'sentences.en': { $regex: search.trim(), $options: 'i' } },
        { 'sentences.bn': { $regex: search.trim(), $options: 'i' } },
        { tags: { $regex: search.trim(), $options: 'i' } },
      ],
    });
  }

  if (category.trim()) conditions.push({ category: category.trim() });

  if (tags) {
    const tagList = (Array.isArray(tags) ? tags : tags.split(','))
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    if (tagList.length) conditions.push({ tags: { $in: tagList } });
  }

  if (lang && lang !== 'en' && lang !== 'bn') {
    conditions.push({ 'sentences.others.lang': lang.toLowerCase() });
  }

  const filter = conditions.length > 0 ? { $and: conditions } : {};

  const [total, data] = await Promise.all([
    Sentence.countDocuments(filter),
    Sentence.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'name email'),
  ]);

  return res.json({
    success: true,
    data,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
}

async function getOne(req, res) {
  const sentence = await Sentence.findById(req.params.id).populate('createdBy', 'name email');
  if (!sentence) return notFound(res, 'Sentence not found');
  return success(res, sentence);
}

async function create(req, res) {
  const { sentences, category, tags, additionalInfo } = req.body;

  const sentence = await Sentence.create({
    sentences,
    category,
    tags: tags || [],
    additionalInfo: additionalInfo || '',
    createdBy: req.user._id,
    isApproved: false,
  });

  return created(res, sentence, 'Sentence created and pending approval');
}

async function update(req, res) {
  const { sentences, category, tags, additionalInfo } = req.body;

  const sentence = await Sentence.findById(req.params.id);
  if (!sentence) return notFound(res, 'Sentence not found');

  const isOwner = sentence.createdBy.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to update this sentence' });
  }

  Object.assign(sentence.sentences, sentences || {});
  if (category) sentence.category = category;
  if (tags !== undefined) sentence.tags = tags;
  if (additionalInfo !== undefined) sentence.additionalInfo = additionalInfo;

  await sentence.save();
  return success(res, sentence, 'Sentence updated');
}

async function remove(req, res) {
  const sentence = await Sentence.findById(req.params.id);
  if (!sentence) return notFound(res, 'Sentence not found');

  const isOwner = sentence.createdBy.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this sentence' });
  }

  await sentence.deleteOne();
  return success(res, null, 'Sentence deleted');
}

async function approve(req, res) {
  const sentence = await Sentence.findById(req.params.id);
  if (!sentence) return notFound(res, 'Sentence not found');

  sentence.isApproved = !sentence.isApproved;
  await sentence.save();

  return success(res, sentence, sentence.isApproved ? 'Sentence approved' : 'Approval removed');
}

module.exports = { getAll, getOne, create, update, remove, approve };
