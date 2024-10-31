const User = require('../models/User')
const jwt = require('jsonwebtoken')
const { UnauthenticatedError } = require('../errors')

const ErrorModel = require('../models/Errors')

const verify = async (req, res) => {
    //check header
    const authHeader = req.headers.authorization
    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthenticatedError('authentication failed')
    }
    const token = authHeader.split(' ')[1]
    try {
        jwt.verify(token, process.env.JWT_SECRET)
        res.status(200).json('Passed authorization layer');
    } catch (error) {
        const timestamp = Date.now()
        await ErrorModel.create({
            timestamp: timestamp,
            time: {
                year: moment(timestamp).utcOffset(3).format('y'), 
                month: moment(timestamp).utcOffset(3).format('M'),
                weekOfYear: moment(timestamp).utcOffset(3).format('w'),
                dayOfYear: moment(timestamp).utcOffset(3).format('DDD'),
                dayOfMonth: moment(timestamp).utcOffset(3).format('D'),
                dayOfWeek: moment(timestamp).utcOffset(3).format('E'),
                hour: moment(timestamp).utcOffset(3).format('H')
            },
            message: error
        })
        // res.status(401).json('UnAuthorized token');
        throw new UnauthenticatedError('authentication failed')
    }
}

module.exports = verify