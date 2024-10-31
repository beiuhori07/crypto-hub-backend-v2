

const { getSymbolListBinance, getSymbolNewClosedPNLBinance } = require('./closedTradesBinance')
const { getSymbolListBybit, getSymbolNewClosedPNLBybit } = require('./closedTradesBybit')
const ClosedTrades = require('../models/Closed-Trades')
const UserApiMap = require('../models/User-Api-Map')

const hourlyJobBybit = async (userId, envName) => {
    let symbolListBybit = await getSymbolListBybit(envName)

    for(let i = 0; i < symbolListBybit.length; i++) {
        await getSymbolNewClosedPNLBybit(symbolListBybit[i], userId, envName)
    }
}
const hourlyJobBinance = async (userId, envName) => {
    let symbolListBinance = await getSymbolListBinance(envName)
    
    for(let i = 0; i < symbolListBinance.length; i++) {
        await getSymbolNewClosedPNLBinance(symbolListBinance[i], userId, envName)
    }
}
const hourlyJob = async () => {
    let envObjects = await UserApiMap.find({})

    for(let i = 0; i < envObjects.length; i++) {
        await hourlyJobBinance(envObjects[i].userId, envObjects[i].name)
        await hourlyJobBybit(envObjects[i].userId, envObjects[i].name)

        await delay(1000);
    }
}

const hourlyJobRequest = async (req, res) => {
    const { userId } = req.params
    let envObject = await UserApiMap.findOne({ userId: userId })

    hourlyJobBybit(envObject.userId, envObject.name)
    hourlyJobBinance(envObject.userId, envObject.name)
    res.status(200).json('Closed trades db refreshed successfully')
}

const getAllClosedTradesByYear = async (req, res) => {
    const { year, userId } = req.params
    const data = await ClosedTrades.find({
        'time.year': year,
        userId: userId
    })

    data.sort((a, b) => b.date - a.date)

    res.status(200).json(data)
}
const getSingleClosedTradeByYear = async (req, res) => {
    const { year, symbol, userId } = req.params
    const data = await ClosedTrades.find({
        symbol: symbol,
        'time.year': year,
        userId: userId
    })

    data.sort((a, b) => b.date - a.date)

    res.status(200).json(data)
}
const getAllClosedTradesByMonthOfYear = async (req, res) => {
    const { year, month, userId } = req.params
    const data = await ClosedTrades.find({
        'time.year': year,
        'time.month': month,
        userId: userId
    })

    data.sort((a, b) => b.date - a.date)

    res.status(200).json(data)
}
const getSingleClosedTradeByMonthOfYear = async (req, res) => {
    const { year, month, symbol, userId } = req.params
    const data = await ClosedTrades.find({
        symbol: symbol,
        'time.year': year,
        'time.month': month,
        userId: userId
    })

    data.sort((a, b) => b.date - a.date)

    res.status(200).json(data)
}
const getAllClosedTradesByWeekOfYear = async (req, res) => {
    const { year, weekOfYear, userId } = req.params
    const data = await ClosedTrades.find({
        'time.year': year,
        'time.weekOfYear': weekOfYear,
        userId: userId
    })

    data.sort((a, b) => b.date - a.date)

    res.status(200).json(data)
}
const getSingleClosedTradeByWeekOfYear = async (req, res) => {
    const { year, weekOfYear, symbol, userId } = req.params
    const data = await ClosedTrades.find({
        symbol: symbol,
        'time.year': year,
        'time.weekOfYear': weekOfYear,
        userId: userId
    })

    data.sort((a, b) => b.date - a.date)

    res.status(200).json(data)
}
const getAllClosedTradesByDayOfYear = async (req, res) => {
    const { year, dayOfYear, userId } = req.params
    const data = await ClosedTrades.find({
        'time.year': year,
        'time.dayOfYear': dayOfYear,
        userId: userId
    })

    data.sort((a, b) => b.date - a.date)

    res.status(200).json(data)
}
const getSingleClosedTradeByDayOfYear = async (req, res) => {
    const { year, dayOfYear, symbol, userId } = req.params
    const data = await ClosedTrades.find({
        symbol: symbol,
        'time.year': year,
        'time.dayOfYear': dayOfYear,
        userId: userId
    })

    data.sort((a, b) => b.date - a.date)

    res.status(200).json(data)
}
const getAllClosedTradesByDayOfMonth = async (req, res) => {
    const { year, month, dayOfMonth, userId } = req.params
    const data = await ClosedTrades.find({
        'time.year': year,
        'time.month': month,
        'time.dayOfMonth': dayOfMonth,
        userId: userId
    })

    data.sort((a, b) => b.date - a.date)

    res.status(200).json(data)
}
const getSingleClosedTradeByDayOfMonth = async (req, res) => {
    const { year, month, dayOfMonth, symbol, userId } = req.params
    const data = await ClosedTrades.find({
        symbol: symbol,
        'time.year': year,
        'time.month': month,
        'time.dayOfMonth': dayOfMonth,
        userId: userId
    })

    data.sort((a, b) => b.date - a.date)

    res.status(200).json(data)
}
const getAllClosedTradesByDayOfWeek = async (req, res) => {
    const { year, weekOfYear, dayOfWeek, userId } = req.params
    const data = await ClosedTrades.find({
        'time.year': year,
        'time.weekOfYear': weekOfYear,
        'time.dayOfWeek': dayOfWeek,
        userId: userId
    })

    data.sort((a, b) => b.date - a.date)

    res.status(200).json(data)
}
const getSingleClosedTradeByDayOfWeek = async (req, res) => {
    const { year, weekOfYear, dayOfWeek, symbol, userId } = req.params
    const data = await ClosedTrades.find({
        symbol: symbol,
        'time.year': year,
        'time.weekOfYear': weekOfYear,
        'time.dayOfWeek': dayOfWeek,
        userId: userId
    })

    data.sort((a, b) => b.date - a.date)

    res.status(200).json(data)
}
const getAllClosedTradesAT = async (req, res) => {
    const { userId } = req.params
    const data = await ClosedTrades.find({ userId: userId})

    data.sort((a, b) => b.date - a.date)

    res.status(200).json(data)
}
const getSingleClosedTradesAT = async (req, res) => {
    const { symbol, userId } = req.params
    const data = await ClosedTrades.find({
        symbol: symbol,
        userId: userId
    })
    
    data.sort((a, b) => b.date - a.date)

    res.status(200).json(data)
}

const getAllClosedTradesSinceDate = async (req, res) => {
    const {year, month, dayOfMonth, userId} = req.params
    const dataDay = await ClosedTrades.find({
        'time.year': year,
        'time.month': month,
        'time.dayOfMonth': { $gte: dayOfMonth },
        userId: userId 
    })
    const dataMonth = await ClosedTrades.find({
        'time.year': year,
        'time.month': { $gt: month},
        userId: userId
    })
    const dataYear = await ClosedTrades.find({
        'time.year': { $gt: year },
        userId: userId
    })
    const finalData = [...dataDay, ...dataMonth, ...dataYear]

    finalData.sort((a, b) => b.date - a.date)

    res.status(200).json(finalData)
}

const getSingleClosedTradesSinceDate = async (req, res) => {
    const {year, month, dayOfMonth, symbol, userId} = req.params
    const dataDay = await ClosedTrades.find({
        symbol: symbol,
        'time.year': year,
        'time.month': month,
        'time.dayOfMonth': { $gte: dayOfMonth },
        userId: userId
    })
    const dataMonth = await ClosedTrades.find({
        symbol: symbol,
        'time.year': year,
        'time.month': { $gt: month},
        userId: userId
    })
    const dataYear = await ClosedTrades.find({
        symbol: symbol,
        'time.year': { $gt: year },
        userId: userId
    })

    const finalData = [...dataDay, ...dataMonth, ...dataYear]

    finalData.sort((a, b) => b.date - a.date)

    res.status(200).json(finalData)
}

const getAllClosedTradesSinceUntilDate = async (req, res) => {
    const {year1, month1, dayOfMonth1, year2, month2, dayOfMonth2, userId} = req.params
    const dataDay = await ClosedTrades.find({
        'time.year': year1,
        'time.month': month1,
        'time.dayOfMonth': { $gte: dayOfMonth1 },
        userId: userId 
    })
    const dataMonth = await ClosedTrades.find({
        'time.year': year1,
        'time.month': { $gt: month1},
        userId: userId
    })
    const dataYear = await ClosedTrades.find({
        'time.year': { $gt: year1 },
        userId: userId
    })
    let finalData = [...dataDay, ...dataMonth, ...dataYear]

    finalData = finalData.filter( data => {
        if(data.time.year > year2) return false
        if(data.time.year == year2 && data.time.month > month2) return false
        if(data.time.year == year2 && data.time.month == month2 && data.time.dayOfMonth > dayOfMonth2) return false
        return true;
    })

    finalData.sort((a, b) => b.date - a.date)

    res.status(200).json(finalData)
}

const getSingleClosedTradesSinceUntilDate = async (req, res) => {
    const {year1, month1, dayOfMonth1, year2, month2, dayOfMonth2, symbol, userId} = req.params
    const dataDay = await ClosedTrades.find({
        symbol: symbol,
        'time.year': year1,
        'time.month': month1,
        'time.dayOfMonth': { $gte: dayOfMonth1 },
        userId: userId 
    })
    const dataMonth = await ClosedTrades.find({
        symbol: symbol,
        'time.year': year1,
        'time.month': { $gt: month1},
        userId: userId
    })
    const dataYear = await ClosedTrades.find({
        symbol: symbol,
        'time.year': { $gt: year1 },
        userId: userId
    })
    let finalData = [...dataDay, ...dataMonth, ...dataYear]

    finalData = finalData.filter( data => {
        if(data.time.year > year2) return false
        if(data.time.year == year2 && data.time.month > month2) return false
        if(data.time.year == year2 && data.time.month == month2 && data.time.dayOfMonth > dayOfMonth2) return false
        return true;
    })

    finalData.sort((a, b) => b.date - a.date)

    res.status(200).json(finalData)
}

const getAllSymbols = async (req, res) => {
    const { userId } = req.params
    const envObject = await UserApiMap.findOne({ userId: userId })
    let symbolList = []

    // let symbolListBinance = []
    // let symbolListBybit = []
    let symbolListBinance = await getSymbolListBinance(envObject.name)
    let symbolListBybit = await getSymbolListBybit(envObject.name)
    symbolList = [...symbolListBinance, ...symbolListBybit]
    symbolList.sort()

    for(let i = 0; i < symbolList.length - 1; i++) {
        if(symbolList[i] === symbolList[i+1]) {
            for(let j = i; j < symbolList.length - 1; j++) {
                symbolList[j] = symbolList[j+1]
            }
            symbolList.pop()
        }
    }

    // console.log('this is symbolList = ', symbolList)
    console.log('this is symbolList length = ', symbolList.length)
    res.status(200).json(symbolList)
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
} 

module.exports = {
    getAllSymbols,
    hourlyJob,                         hourlyJobRequest,
    getAllClosedTradesSinceUntilDate,  getSingleClosedTradesSinceUntilDate,
    getAllClosedTradesSinceDate,       getSingleClosedTradesSinceDate,
    getAllClosedTradesAT,              getSingleClosedTradesAT,
    getAllClosedTradesByYear,          getSingleClosedTradeByYear,
    getAllClosedTradesByMonthOfYear,   getSingleClosedTradeByMonthOfYear,
    getAllClosedTradesByWeekOfYear,    getSingleClosedTradeByWeekOfYear,
    getAllClosedTradesByDayOfYear,     getSingleClosedTradeByDayOfYear,
    getAllClosedTradesByDayOfMonth,    getSingleClosedTradeByDayOfMonth,
    getAllClosedTradesByDayOfWeek,     getSingleClosedTradeByDayOfWeek
}
