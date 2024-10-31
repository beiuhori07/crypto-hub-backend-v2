const mongoose = require('mongoose')

const ErrorSchema = new mongoose.Schema({
    timestamp: {
        type: Number,
        required: [true, 'Please provide timestamp']
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
    },
    message: {
        type: String,
        required: [true, 'Please provide error message']
    }
})

module.exports = mongoose.model('ErrorStorage', ErrorSchema)
