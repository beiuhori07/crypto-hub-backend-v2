const mongoose = require('mongoose')

const AssetsChartEntries = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'Please provide userId']
    },
    label: {
        type: String,
        required: [true, 'Please provide label']
    },
    totalValue: {
        type: Number,
        required: [true, 'Please provide totalValue']
    }
})


module.exports = mongoose.model('AssetsChartEntries', AssetsChartEntries)