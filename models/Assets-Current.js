const mongoose = require('mongoose')

const CurrentAssetsSchema = new mongoose.Schema({
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
    exchanges: {
        type: [{                    // --> Array of this type of Objects
            exchange: {
                type: String,
                required: [true, 'Please provide exchange']
            },
            quantity: {
                type: Number,
                required: [true, 'Please provide quantity']
            }
        }],
        required: [true, 'Please provide array of exchanges']
    }
})

module.exports = mongoose.model('CurrentAssets', CurrentAssetsSchema)
