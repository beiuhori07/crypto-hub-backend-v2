const express = require('express')
const router = express.Router()

const getChartEntries = require('../controllers/assetsChart')


router.get('/entries/:userId', getChartEntries)

module.exports = router
