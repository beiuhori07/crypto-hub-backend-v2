const express = require('express')
const router = express.Router()


const { fixNoPriceIssue, saveChartEntries } = require('../controllers/fixing')

router.get('/assets', fixNoPriceIssue)
router.get('/chart', saveChartEntries)
// router.get('/currentAssets/:userId', getCurrentAssetsInfo)

module.exports = router