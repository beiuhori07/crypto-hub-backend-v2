const express = require('express')
const router = express.Router()

const { getTradingDBInfo, getCurrentAssetsInfo } = require('../controllers/generalInfo')

router.get('/closedTrades/:userId', getTradingDBInfo)
router.get('/currentAssets/:userId', getCurrentAssetsInfo)

module.exports = router