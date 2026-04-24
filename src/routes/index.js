const router = require('express').Router();

router.use('/auth', require('./auth'));
router.use('/sentences', require('./sentences'));

module.exports = router;
