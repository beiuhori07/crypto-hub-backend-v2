const axios = require('axios')
const { timeStamp } = require('console')
const crypto = require('crypto')
var moment = require('moment');


const buildQueryString = params => {
    if (!params) return ''
    return Object.entries(params)
        .map(stringifyKeyValuePair)
        .join('&')
}

const stringifyKeyValuePair = ([key, value]) => {
    const valueString = Array.isArray(value) ? `["${value.join('","')}"]` : value
    return `${key}=${encodeURIComponent(valueString)}`
}

const getRequestInstance = (config) => {
    return axios.create({
        ...config
    })
}
    
const createRequest = (config) => {
    const { baseURL, apiKey, method, url } = config
    return getRequestInstance({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
        'X-MBX-APIKEY': apiKey,
    }
    }).request({
    method,
    url
    })
}

const buildTimeObject = (timestamp) => {
    return {
        year: moment(timestamp).utcOffset(3).format('y'), 
        month: moment(timestamp).utcOffset(3).format('M'),
        weekOfYear: moment(timestamp).utcOffset(3).format('w'),
        dayOfYear: moment(timestamp).utcOffset(3).format('DDD'),
        dayOfMonth: moment(timestamp).utcOffset(3).format('D'),
        dayOfWeek: moment(timestamp).utcOffset(3).format('E'),
        hour: moment(timestamp).utcOffset(3).format('H')
    }
}

module.exports = { createRequest, buildQueryString, buildTimeObject }