const mongoose = require('mongoose')

const BinanceFuturesStillOpenTradesSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'Please provide userId'],
    },
    symbol: {
        type: String,
        required: [true, 'Please provide symbol'],
    },
    quantity: {
        type: Number,
        required: [true, 'Please provide quantity']
    },
    price: {
        type: Number,
        required: [true, 'Please provide price']
    },
    value: {
        type: Number,
        required: [true, 'Please provide value']
    },
    realizedPnl: {
        type: Number,
        required: [true, 'Please provide realizedPnl']
    },

    // might need to compute value of trade

})

module.exports = mongoose.model('BinanceFuturesStillOpenTrades', BinanceFuturesStillOpenTradesSchema)
