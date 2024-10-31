const express = require('express')
const router = express.Router()

const { getSingleCurrentAssets, getAllCurrentAssets } = require('../controllers/assetsCurrent')

router.get('/:userId', getAllCurrentAssets)
router.get('/:symbol/:userId', getSingleCurrentAssets)

module.exports = router