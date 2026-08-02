const express = require('express');
const router = express.Router();
const { logon } = require('../controllers/auth.controller');

router.post('/logon', logon);

module.exports = router;
