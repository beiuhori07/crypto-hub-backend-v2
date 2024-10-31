const mongoose = require('mongoose')

const BinanceFuturesLastIdSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'Please provide userId'],
    },
    symbol: {
        type: String,
        required: [true, 'Please provide symbol']
    },
    id: {
        type: Number,
        required: [true, 'Please provide last id']
    }
})

module.exports = mongoose.model('BinanceFuturesLastId', BinanceFuturesLastIdSchema)
