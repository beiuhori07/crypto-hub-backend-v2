const express = require('express')
const router = express.Router()

// const { hourlyJob } = require('../controllers/closedTrades')

const {
    getAllSymbols,
    hourlyJob,                         hourlyJobRequest,
    getAllClosedTradesSinceUntilDate,  getSingleClosedTradesSinceUntilDate,
    getAllClosedTradesSinceDate,       getSingleClosedTradesSinceDate,
    getAllClosedTradesAT,              getSingleClosedTradesAT,
    getAllClosedTradesByYear,          getSingleClosedTradeByYear,
    getAllClosedTradesByMonthOfYear,   getSingleClosedTradeByMonthOfYear,
    getAllClosedTradesByWeekOfYear,    getSingleClosedTradeByWeekOfYear,
    getAllClosedTradesByDayOfYear,     getSingleClosedTradeByDayOfYear,
    getAllClosedTradesByDayOfMonth,    getSingleClosedTradeByDayOfMonth,
    getAllClosedTradesByDayOfWeek,     getSingleClosedTradeByDayOfWeek
} = require('../controllers/closedTrades')

router.get('/refresh/:userId', hourlyJobRequest)

router.get('/symbol/list/:userId', getAllSymbols)

router.get('/since/:year/:month/:dayOfMonth/:userId', getAllClosedTradesSinceDate)
router.get('/since/:year/:month/:dayOfMonth/:symbol/:userId', getSingleClosedTradesSinceDate)

router.get('/since/until/:year1/:month1/:dayOfMonth1/to/:year2/:month2/:dayOfMonth2/:userId', getAllClosedTradesSinceUntilDate)
router.get('/since/until/:year1/:month1/:dayOfMonth1/to/:year2/:month2/:dayOfMonth2/:symbol/:userId', getSingleClosedTradesSinceUntilDate)

router.get('/:userId', getAllClosedTradesAT)
router.get('/:symbol/:userId', getSingleClosedTradesAT)

router.get('/year/:year/:userId', getAllClosedTradesByYear)
router.get('/year/:year/:symbol/:userId', getSingleClosedTradeByYear)

router.get('/monthOfYear/:year/:month/:userId', getAllClosedTradesByMonthOfYear)
router.get('/monthOfYear/:year/:month/:symbol/:userId', getSingleClosedTradeByMonthOfYear)

router.get('/weekOfYear/:year/:weekOfYear/:userId', getAllClosedTradesByWeekOfYear)
router.get('/weekOfYear/:year/:weekOfYear/:symbol/:userId', getSingleClosedTradeByWeekOfYear)


router.get('/dayOfYear/:year/:dayOfYear/:userId', getAllClosedTradesByDayOfYear)
router.get('/dayOfYear/:year/:dayOfYear/:symbol/:userId', getSingleClosedTradeByDayOfYear)
router.get('/dayOfMonth/:year/:month/:dayOfMonth/:userId', getAllClosedTradesByDayOfMonth)
router.get('/dayOfMonth/:year/:month/:dayOfMonth/:symbol/:userId', getSingleClosedTradeByDayOfMonth)
router.get('/dayOfWeek/:year/:weekOfYear/:dayOfWeek/:userId', getAllClosedTradesByDayOfWeek)
router.get('/dayOfWeek/:year/:weekOfYear/:dayOfWeek/:symbol/:userId', getSingleClosedTradeByDayOfWeek)

module.exports = router