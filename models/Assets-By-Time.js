const mongoose = require('mongoose')

const AssetsByTimeSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'Please provide userId']
    },
    name: {
        type: String,
        required: [true, 'Please provide name']
    },
    symbol: {
        type: String,
        required: [true, 'Please provide symbol']
    },
    quantity: {
        type: Number,
        required: [true, 'Please provide number']
    },
    currentPrice: {
        type: Number,
        required: [true, 'Please provide current price']
    },
    currentValue: {
        type: Number,
        required: [true, 'Please provide current value']
    },
    exchange: {
        type: String,
        required: [true, 'Please provide exchange']
    },
    date: {
        type: Date, // ?????
        default: Date.now()
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

module.exports = mongoose.model('AssetsByTime', AssetsByTimeSchema)
