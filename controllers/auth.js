const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } = require('../errors')

const login = async(req, res) => {
    const { email, password } = req.body;

    if(!email || !password) {
        throw new BadRequestError('Please provide email and password')
    }

    const user = await User.findOne({email})

    if(!user) {
        throw new UnauthenticatedError('invalid credentials')
    }

    const isPasswordCorrect = await user.comparePassword(password)
    if(!isPasswordCorrect) {
        throw new UnauthenticatedError('invalid credentials')
    }

    const token = user.createJWT()
    res.status(StatusCodes.OK).json({user: { name: user.name, id: user._id }, token })
}

module.exports = login