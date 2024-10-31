const { REQUEST_HEADER_FIELDS_TOO_LARGE } = require('http-status-codes')
const mongoose = require('mongoose')

const TradingDBInfoSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'Please provide userId'],
    },
    numberOfTrades: {
        type: Number,
        required: [true, 'Please provide nubmerOfTrades'],
    },
    totalValueOfTrades: {
        type: Number,
        required: [true, 'Please provide totalValueOfTrades']
    }
})

module.exports = mongoose.model('TradingDBInfo', TradingDBInfoSchema)
