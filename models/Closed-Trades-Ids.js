const mongoose = require('mongoose')

const ClosedTradesIDsSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'Please provide userId'],
    },
    symbol: {
        type: String,
        required: [true, 'Please provide symbol'],
    },
    lastId: {
        type: Number,
        required: [true, 'Please provide closed-pnl-id']
    }
})

module.exports = mongoose.model('ClosedTradesIds', ClosedTradesIDsSchema)
