
const AssetsByTime = require('../models/Assets-By-Time')
const UserApiMap = require('../models/User-Api-Map')
const AssetsChartEntries = require('../models/Assets-Chart-Entries')
const { buildTimeObject } = require('../utils/utils')

const getAssetsByTimeBybit = require('./assetsByTimeBybit')
const getAssetsByTimeBinance = require('./assetsByTimeBinance')
const getXExchangeAssets = require('./assetsByTimeXExchange')
const getETHAssets = require('./assetsByTimeByETHAddress')
const getBTCAssets = require('./assetsByTimeByBTCAddress')
const getAssetsByTimeBitget = require('./assetsByTimeBitget')
const getAssetsByTimeKucoin = require('./assetsByTimeKucoin')



const hourlyJob = async () => {
    let envObjects = await UserApiMap.find({})

    for(let i = 0; i < envObjects.length; i++) {
        // let assetArray = []

        // await getAssetsByTimeBybit(envObjects[i].userId, envObjects[i].name)

        await getAssetsByTimeBinance(envObjects[i].userId, envObjects[i].name)
        await getXExchangeAssets(envObjects[i].userId, envObjects[i].name)
        await getETHAssets(envObjects[i].userId, envObjects[i].name)
        await getBTCAssets(envObjects[i].userId, envObjects[i].name)
        await getAssetsByTimeBitget(envObjects[i].userId, envObjects[i].name)
        await getAssetsByTimeKucoin(envObjects[i].userId, envObjects[i].name)


        // query the new documents and aggregate to create the new chart entry


        let timestamp = Date.now();
        let time = buildTimeObject(timestamp)
        
        // todo: to be tested
        const newAssets = await AssetsByTime.find({ 
            'time.year': time.year,
            'time.month': time.month,
            'time.dayOfMonth': time.dayOfMonth,
            'time.hour': time.hour,
            userId: envObjects[i].userId
        })

        console.log("--> new assets for which a new asset chart entry will be created")
        console.log(newAssets)
        console.log("---------------")
        
        const totalValue = newAssets.reduce((accumulator, asset) => {
            return accumulator + asset.currentValue;
        }, 0);

        await AssetsChartEntries.create({
            userId: envObjects[i].userId,
            totalValue: totalValue,
            label: `${time.year % 100}/${time.dayOfMonth}/${time.month}-${time.hour}`
        })
        





        // await getAssetsByTimeBinance(assetArray, envObjects[i].userId, envObjects[i].name)
        // await getAssetsByTimeBybit(assetArray, envObjects[i].userId, envObjects[i].name)
        // await getXExchangeAssets(assetArray, envObjects[i].userId, envObjects[i].name)
        // await getETHAssets(assetArray, envObjects[i].userId, envObjects[i].name)
        
        
        // let symbolReducedArray = []
        // let idx = 0;
        // while(assetArray.length != 0) {
            
        //     symbolReducedArray.push(assetArray[0])
        //     const firstItem = assetArray.shift();
            
        //     let indexesToRemove = []
        //     for(let i = 0; i < assetArray.length; i++) {
        //         if(assetArray[i].symbol === firstItem.symbol) {
        //             symbolReducedArray[idx].quantity += assetArray[i].quantity;
        //             symbolReducedArray[idx].currentValue = symbolReducedArray[idx].quantity * symbolReducedArray[idx].currentPrice
        //             indexesToRemove.push(i);
        //         }
        //     }
        //     for(let i = 0; i < indexesToRemove.length; i++) {
        //         assetArray.slice(indexesToRemove[i] - i, 1)
        //     }
        //     idx++;
        // }
        
        // let timestamp = Date.now()
        // timestamp = timestamp - 60 * 60 * 1000

        // const previousProfits = await AssetsProfit.findOne({
        //     userId: envObjects[i].userId,
        //     time: {
        //         year: moment(timestamp).utcOffset(3).format('y'), // de testat !!
        //         month: moment(timestamp).utcOffset(3).format('M'),
        //         weekOfYear: moment(timestamp).utcOffset(3).format('w'),
        //         dayOfYear: moment(timestamp).utcOffset(3).format('DDD'),
        //         dayOfMonth: moment(timestamp).utcOffset(3).format('D'),
        //         dayOfWeek: moment(timestamp).utcOffset(3).format('E'),
        //         hour: moment(timestamp).utcOffset(3).format('H')
        //     }
        // })
        

        // let newEntry = {}
        // for(let i = 0; i < symbolReducedArray.length; i++) {
        //     const previousProfitsAssetStats = previousProfits.assetList.find(item => symbolReducedArray[i].symbol === item.symbol )
        //     if(previousProfitsAssetStats == undefined) {
        //         // make sure to add this asset to new entry
        //     } else {
        //         if(previousProfitsAssetStats.quantity != symbolReducedArray[i].quantity) {
        //             //update bought value and quantity
        //         }                
        //     }
        // }
        // get asset array after these last calls
        // then reduce the array to per-symbol entries
        // check with AssetsProfit model, to see if diff quantities
        // if so, update bought value and make new AssetProfit entry


        await delay(2000);
    }
}
const hourlyJobRequest = async (req, res) => {
    // TODO : do this only by userId - envName
    hourlyJob();
    res.status(200).json("all good")
}

const getAllAssetsByYear = async (req, res) => {
    const { year, interval, userId } = req.params
    console.log(req.params);
    console.log(year);
    const data = await AssetsByTime.find({
        'time.year': year,
        userId: userId
    })
    res.status(200).json(data)
}
const getSingleAssetByYear = async (req, res) => {
    const { year, symbol, interval, userId } = req.params
    const data = await AssetsByTime.find({
        symbol: symbol,
        'time.year': year,
        userId: userId
    })
    res.status(200).json(data)
}

const getAllAssetsByMonthOfYear = async (req, res) => {
    const { year, month, interval, userId } = req.params
    const data = await AssetsByTime.find({
        'time.year': year,
        'time.month': month,
        userId: userId
    })
    res.status(200).json(data)
}
const getSingleAssetByMonthOfYear = async (req, res) => {
    const { year, month, symbol, interval, userId } = req.params
    const data = await AssetsByTime.find({
        symbol: symbol,
        'time.year': year,
        'time.month': month,
        userId: userId
    })
    res.status(200).json(data)
}
const getAllAssetsByWeekOfYear = async (req, res) => {
    const { year, weekOfYear, interval, userId } = req.params
    const data = await AssetsByTime.find({
        'time.year': year,
        'time.weekOfYear': weekOfYear,
        userId: userId
    })
    res.status(200).json(data)
}
const getSingleAssetByWeekOfYear = async (req, res) => {
    const { year, weekOfYear, symbol, interval, userId } = req.params
    const data = await AssetsByTime.find({
        symbol: symbol,
        'time.year': year,
        'time.weekOfYear': weekOfYear,
        userId: userId
    })
    res.status(200).json(data)
}
const getAllAssetsByDayOfYear = async (req, res) => {
    const { year, dayOfYear, interval, userId } = req.params
    const data = await AssetsByTime.find({
        'time.year': year,
        'time.dayOfYear': dayOfYear,
        userId: userId
    })
    res.status(200).json(data)
}
const getSingleAssetByDayOfYear = async (req, res) => {
    const { year, dayOfYear, symbol, interval, userId } = req.params
    const data = await AssetsByTime.find({
        symbol: symbol,
        'time.year': year,
        'time.dayOfYear': dayOfYear,
        userId: userId
    })
    res.status(200).json(data)
}
const getAllAssetsByDayOfMonth = async (req, res) => {
    const { year, month, dayOfMonth, interval, userId } = req.params
    const data = await AssetsByTime.find({
        'time.year': year,
        'time.month': month,
        'time.dayOfMonth': dayOfMonth,
        userId: userId
    })
    res.status(200).json(data)
}
const getSingleAssetByDayOfMonth = async (req, res) => {
    const { year, month, dayOfMonth, symbol, interval, userId } = req.params
    const data = await AssetsByTime.find({
        symbol: symbol,
        'time.year': year,
        'time.month': month,
        'time.dayOfMonth': dayOfMonth,
        userId: userId
    })
    res.status(200).json(data)
}
const getAllAssetsByDayOfWeek = async (req, res) => {
    const { year, weekOfYear, dayOfWeek, userId } = req.params
    const data = await AssetsByTime.find({
        'time.year': year,
        'time.weekOfYear': weekOfYear,
        'time.dayOfWeek': dayOfWeek,
        userId: userId
    })
    res.status(200).json(data)
}
const getSingleAssetByDayOfWeek = async (req, res) => {
    const { year, weekOfYear, dayOfWeek, symbol, interval, userId } = req.params
    const data = await AssetsByTime.find({
        symbol: symbol,
        'time.year': year,
        'time.weekOfYear': weekOfYear,
        'time.dayOfWeek': dayOfWeek,
        userId: userId
    })
    res.status(200).json(data)
}

const getAllAssetsAT = async (req, res) => {
    const { interval, userId } = req.params
    let data = await AssetsByTime.find({ 
        userId: userId
    })

    if(interval === '1h') {
        // data = filterByInterval1h(data)
        // do nothing == get all of 'em
        console.log('entered 1h filter')
    }
    if(interval === '4h') {
        data = filterByInterval4h(data)
        console.log('entered 4h filter')
    }
    if(interval === '1d') {
        data = filterByInterval1d(data)
        console.log('entered 1d filter')
    }
    if(interval === '1w') {
        console.log(data)
        data = filterByInterval1w(data)
        console.log(data)
        console.log('entered 1w filter')
    }

    data.sort((a, b) => a.date - b.date)

    res.status(200).json(data)
}
const getSingleAssetAT = async (req, res) => {
    const { symbol, interval, userId } = req.params
    const data = await AssetsByTime.find({
        symbol: symbol,
        userId: userId
    })

    if(interval === '1h') {
        // data = filterByInterval1h(data)   
        // do nothing == get all of 'em
        console.log('entered 1h filter')
    }
    if(interval === '4h') {
        data = filterByInterval4h(data)
        console.log('entered 4h filter')
    }
    if(interval === '1d') {
        data = filterByInterval1d(data)
        console.log('entered 1d filter')
    }
    if(interval === '1w') {
        console.log(data)
        data = filterByInterval1w(data)
        console.log(data)
        console.log('entered 1w filter')
    }
    data.sort((a, b) => b.date - a.date)
    
    res.status(200).json(data)
}

const filterByInterval1h = (data) => {
    // do nothing
}
const filterByInterval4h = (data) => {
    return data.filter(asset => asset.time.hour == 0 || asset.time.hour == 4 || asset.time.hour == 8 || asset.time.hour == 12 || asset.time.hour == 16 || asset.time.hour == 20)
}
const filterByInterval1d = (data) => {
    return data.filter(asset => asset.time.hour == 0)
}
const filterByInterval1w = (data) => {
    return data.filter(asset => asset.time.dayOfWeek == 1 && asset.time.hour == 0)
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
} 

module.exports = { 
    hourlyJobRequest,            hourlyJob,
    getAllAssetsAT,              getSingleAssetAT,
    getAllAssetsByYear,          getSingleAssetByYear,
    getAllAssetsByMonthOfYear,   getSingleAssetByMonthOfYear,
    getAllAssetsByWeekOfYear,    getSingleAssetByWeekOfYear,
    getAllAssetsByDayOfYear,     getSingleAssetByDayOfYear,
    getAllAssetsByDayOfMonth,    getSingleAssetByDayOfMonth,
    getAllAssetsByDayOfWeek,     getSingleAssetByDayOfWeek
}
