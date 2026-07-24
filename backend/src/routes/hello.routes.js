const express = require('express');
const router = express.Router();
const { getHello } = require('../controllers/hello.controller');
const { validateHelloQuery } = require('../validations/hello.validation');

router.get('/', validateHelloQuery, getHello);

module.exports = router;
