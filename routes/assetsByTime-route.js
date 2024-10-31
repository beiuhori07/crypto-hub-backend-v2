const express = require('express')
const router = express.Router()

const {
    hourlyJobRequest,            hourlyJob,
    getAllAssetsAT,              getSingleAssetAT,
    getAllAssetsByYear,          getSingleAssetByYear,
    getAllAssetsByMonthOfYear,   getSingleAssetByMonthOfYear,
    getAllAssetsByWeekOfYear,    getSingleAssetByWeekOfYear,
    getAllAssetsByDayOfYear,     getSingleAssetByDayOfYear,
    getAllAssetsByDayOfMonth,    getSingleAssetByDayOfMonth,
    getAllAssetsByDayOfWeek,     getSingleAssetByDayOfWeek
} = require('../controllers/assetsByTime')


router.get('/refresh', hourlyJobRequest) // TODO : add :userId


// router.get('/symbol/list', getAllSymbols)

// router.get('/since/:year/:month/:dayOfMonth', getAllClosedTradesSinceDate)
// router.get('/since/:year/:month/:dayOfMonth/:symbol', getSingleClosedTradesSinceDate)

// router.get('/since/until/:year1/:month1/:dayOfMonth1/to/:year2/:month2/:dayOfMonth2', getAllClosedTradesSinceUntilDate)
// router.get('/since/until/:year1/:month1/:dayOfMonth1/to/:year2/:month2/:dayOfMonth2/:symbol', getSingleClosedTradesSinceUntilDate)

router.get('/:interval/:userId', getAllAssetsAT)
router.get('/:symbol/:interval/:userId', getSingleAssetAT)

router.get('/year/:year/:interval/:userId', getAllAssetsByYear)
router.get('/year/:year/:symbol/:interval/:userId', getSingleAssetByYear)

router.get('/monthOfYear/:year/:month/:interval/:userId', getAllAssetsByMonthOfYear)
router.get('/monthOfYear/:year/:month/:symbol/:interval/:userId', getSingleAssetByMonthOfYear)

router.get('/weekOfYear/:year/:weekOfYear/:interval/:userId', getAllAssetsByWeekOfYear)
router.get('/weekOfYear/:year/:weekOfYear/:symbol/:interval/:userId', getSingleAssetByWeekOfYear)

router.get('/dayOfYear/:year/:dayOfYear/:interval/:userId', getAllAssetsByDayOfYear)
router.get('/dayOfYear/:year/:dayOfYear/:symbol/:interval/:userId', getSingleAssetByDayOfYear)
router.get('/dayOfMonth/:year/:month/:dayOfMonth/:interval/:userId', getAllAssetsByDayOfMonth)
router.get('/dayOfMonth/:year/:month/:dayOfMonth/:symbol/:interval/:userId', getSingleAssetByDayOfMonth)
router.get('/dayOfWeek/:year/:weekOfYear/:dayOfWeek/:interval/:userId', getAllAssetsByDayOfWeek)
router.get('/dayOfWeek/:year/:weekOfYear/:dayOfWeek/:symbol/:interval/:userId', getSingleAssetByDayOfWeek)


module.exports = router