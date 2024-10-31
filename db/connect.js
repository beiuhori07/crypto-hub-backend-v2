const mongoose = require('mongoose')

const connectDB = (url) => {
    return mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: false
    })
}

module.exports = connectDB