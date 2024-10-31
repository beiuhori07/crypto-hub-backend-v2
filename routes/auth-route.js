const express = require('express')
const router = express.Router()

const login = require('../controllers/auth')
const verify = require('../controllers/verify')

router.post('/login', login)
router.post('/verify', verify)

module.exports = router