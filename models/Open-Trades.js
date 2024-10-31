const mongoose = require('mongoose')

const OpenTradesSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: [true, 'Please provide symbol'],
    },
    direction: {
        type: String,
        required: [true, 'Please provide direction']
    },
    leverage: {
        type: Number,
        required: [true, 'Please provide leverage']
    },
    quantity: {
        type: Number,
        required: [true, 'Please provide quantity']
    },
    entryPrice: {
        type: Number,
        required: [true, 'Please provide entry price']
    },
    exitPrice: {
        type: Number,
        required: [true, 'Please provide exit price']
    },
    unrealizedPnL: {
        type: Number,
        required: [true, 'Please provide closed P&L']
    },
    exchange: {
        type: String,
        required: [true, 'Please provide exchange']
    },
    time: {             // actually useful ??????????????? 
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('OpenTrades', OpenTradesSchema)

