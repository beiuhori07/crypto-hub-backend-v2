const mongoose = require('mongoose')

const UserApiMapSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'Please provide userId']
    },
    name: {
        type: String,
        required: [true, 'Please provide name']
    }
})

module.exports = mongoose.model('UserApiMap', UserApiMapSchema)
