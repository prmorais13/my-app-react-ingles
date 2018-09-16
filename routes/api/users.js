const express = require('express');
const router = express.Router();

// @route  GET api/useres/test
// @desc   Tests useres route
// @access Public
router.get('/test', (req, res) => res.json({ msg: 'Users Working' }));

module.exports = router;
