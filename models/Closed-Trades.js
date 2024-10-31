const mongoose = require('mongoose')

const ClosedTradesSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'Please provide userId'],
    },
    symbol: {
        type: String,
        required: [true, 'Please provide symbol'],
    },
    direction: {
        type: String,
        required: [true, 'Please provide direction']
    },
    quantity: {
        type: Number,
        required: [true, 'Please provide quantity']
    },
    closed_quantity: {
        type: Number,
        required: [true, 'Please provide closed quantity']
    },
    entryValue: {
        type: Number,
        required: [true, 'Please provide entry value']
    },
    exitValue: {
        type: Number,
        required: [true, 'Please provide exit value']
    },
    entryPrice: {
        type: Number,
        required: [true, 'Please provide entry price']
    },
    exitPrice: {
        type: Number,
        required: [true, 'Please provide exit price']
    },
    closedPnL: {
        type: Number,
        required: [true, 'Please provide closed P&L']
    },
    closedPnLID: {
        type: Number,
        required: [true, 'Please provide closed P&L ID'],
    },
    // feesPaid: {
    //     type: Number,
    //     required: [true, 'Please provide fees paid']
    // },
    exchange: {
        type: String,
        required: [true, 'Please provide exchange']
    },
    date: {
        type: Date, // ?????
        required: [true, 'Please provide date']
        // default: Date.now()
    },
    time: {
        year: {
            type: Number,
            required: [true, 'Please provide year']
        },
        month: {
            type: Number,
            required: [true, 'Please provide month']
        },
        weekOfYear: {
            type: Number,
            required: [true, 'Please provide week of year']
        },
        // weekOfMonth: {
        //     type: Number,
        //     required: [true, 'Please provide week of month']
        // },
        dayOfYear: {
            type: Number,
            required: [true, 'Please provide day of year']
        },
        dayOfMonth: {
            type: Number,
            required: [true, 'Please provide day of month']
        },
        dayOfWeek: {
            type: Number,
            required: [true, 'Please provide day of week']
        },
        hour: {
            type: Number,
            required: [true, 'Please provide hour']
        }
    }
})

module.exports = mongoose.model('ClosedTrades', ClosedTradesSchema)
