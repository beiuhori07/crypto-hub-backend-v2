
const TradingDBInfo = require('../models/Trading-DB-Info')
const UserApiMap = require('../models/User-Api-Map')


const {
    getCurrentAssetsByTimeBybit,
    getCurrentAssetsByTimeBinance,
    getCurrentAssetsXExchange,
    getCurrentAssetsByETHAddress,
    getCurrentAssetsByBTCAddress,
    getCurrentAssetsKucoin,
    getCurrentAssetsBitget
} = require('./assetsCurrent')

const getCurrentAssetsInfo = async (req, res) => {
    let { userId } = req.params
    
    let assetArray = []
    let envObject  = await UserApiMap.findOne({ userId: userId })


    let promises = []

    // await getCurrentAssetsByTimeBybit(assetArray, envObject.name)
    promises.push(getCurrentAssetsByTimeBinance(assetArray, envObject.name))
    promises.push(getCurrentAssetsXExchange(assetArray, envObject.name))
    promises.push(getCurrentAssetsByETHAddress(assetArray, envObject.name))
    promises.push(getCurrentAssetsByBTCAddress(assetArray, envObject.name))
    promises.push(getCurrentAssetsBitget(assetArray, envObject.name))
    promises.push(getCurrentAssetsKucoin(assetArray, envObject.name))

    await Promise.all(promises)

    console.log("this is assetArray");
    console.log(assetArray);

    let sum = 0
    let avgPercentageChange = 0;
    for(let i = 0; i < assetArray.length; i++) {
        sum = sum + (Number)(assetArray[i].currentValue)
        avgPercentageChange = avgPercentageChange + (Number)(assetArray[i].currentValue) * assetArray[i].priceChange24h
    }
    avgPercentageChange = avgPercentageChange / sum;

    res.status(200).json({balance: sum, priceChange24h: avgPercentageChange})
}

const getTradingDBInfo = async (req, res) => {
    const { userId } = req.params
    const data = await TradingDBInfo.findOne({ userId: userId })


    res.status(200).json(data);
}

module.exports = {
    getTradingDBInfo,
    getCurrentAssetsInfo
}