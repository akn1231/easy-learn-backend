const router = require('express').Router();
const ctrl = require('../controllers/sentenceController');
const { authenticate, optionalAuthenticate, requireRole } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const {
  sentenceBodyRules,
  listQueryRules,
  handleValidation,
} = require('../validators/sentenceValidators');

router.use(apiLimiter);

// Public reads — but optionally authenticate so visibility filtering works
router.get('/', optionalAuthenticate, listQueryRules, handleValidation, ctrl.getAll);
router.get('/:id', optionalAuthenticate, ctrl.getOne);

// Auth-required writes
router.post('/', authenticate, sentenceBodyRules, handleValidation, ctrl.create);
router.put('/:id', authenticate, sentenceBodyRules, handleValidation, ctrl.update);
router.delete('/:id', authenticate, ctrl.remove);

// Admin-only bulk operations
router.post('/import', authenticate, requireRole('admin'), ctrl.bulkImport);
router.delete('/', authenticate, requireRole('admin'), ctrl.bulkDelete);

// Admin-only approval toggle
router.patch('/:id/approve', authenticate, requireRole('admin'), ctrl.approve);

module.exports = router;
