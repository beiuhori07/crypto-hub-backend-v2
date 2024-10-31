
const { createRequest, buildQueryString } = require('../utils/utils')
const crypto = require('crypto');
var moment = require('moment');
const AssetsByTime = require('../models/Assets-By-Time');
const ErrorModel = require('../models/Errors');
const { buildTimeObject } = require('../utils/utils')


let BTCprice;
let BNBprice;

const getPriceForAsset = async (assetName, envName) => {

    const apiKeyBinance = process.env[`API_KEY_BINANCE_${envName}`];
    const apiSecretBinance = process.env[`API_SECRET_BINANCE_${envName}`];
    
    // TODO all stables ? how ?

    if(assetName === 'USDT' || assetName === 'BUSD' || assetName === 'USDC') {
        return 1;
    }

    const baseURL = 'https://api.binance.com/'
    const url = '/api/v3/avgPrice';
    const method = 'get'
    
    const params = {
        symbol: `${assetName}USDT`
    }
    const queryString = buildQueryString({...params})
    let dataFromUSDT;
    let dataFromBUSD;
    let dataFromBTC;
    try {

        dataFromUSDT = await createRequest({
            baseURL: baseURL,
            apiKey: apiKeyBinance,
            url: `${url}?${queryString}`,
            method: method
        })

        console.log('got price from USDT conversion');
        return dataFromUSDT.data.price
    } catch(errorUSDT) {
        console.log("trying to find symbol with BUSD pair")

            const params = {
                symbol: `${assetName}BUSD`
            }
            const queryString = buildQueryString({...params})
            
            try {


                const dataFromBUSD = await createRequest({
                    baseURL: baseURL,
                    apiKey: apiKeyBinance,
                    url: `${url}?${queryString}`,
                    method: method
                })  
                console.log('got price from BUSD conversion')
                return dataFromBUSD.data.price;



            } catch(errorBUSD) {
                console.log("trying to find symbol with BTC pair") // ------------------- de testat pair cu BTC again(PHB?) si BNB 

                    const url = '/api/v3/avgPrice';
                
                    const timestamp = Date.now();
                    const params = {
                        symbol: `${assetName}BTC`
                    }
                    const queryString = buildQueryString({...params})
                    
                    try {
        
                        const { data: dataFromBTC } = await createRequest({
                            baseURL: baseURL,
                            apiKey: apiKeyBinance,
                            url: `${url}?${queryString}`,
                            method: method
                        })  
                        console.log('got price from BTC conversion')
                        return dataFromBTC.price * BTCprice;

                    } catch(errorBTC) {
                        console.log("trying to find symbol with BNB pair")

                            const url = '/api/v3/avgPrice';
                        
                            const timestamp = Date.now();
                            const params = {
                                symbol: `${assetName}BNB`
                            }
                            const queryString = buildQueryString({...params})
                            
                            try {
                
                                const { data } = await createRequest({
                                    baseURL: baseURL,
                                    apiKey: apiKeyBinance,
                                    url: `${url}?${queryString}`,
                                    method: method
                                })  
                                console.log('got price from BNB conversion')
                                return data.price * BNBprice;

                            } catch(finalError) {
                                await ErrorModel.create({
                                    timestamp: timestamp,
                                    time: buildTimeObject(timestamp),
                                    message: finalError
                                })          
                                console.log("cannot find symbol")
                                return 0;
                            }
                        }
                    }
                }
}

const getAssetsByTime = async (userId, envName) => {
    console.log(`----------------------- STARTING getAssetsByTimeBinance for ${userId} -----------------------------`)
    const apiKeyBinance = process.env[`API_KEY_BINANCE_${envName}`];
    const apiSecretBinance = process.env[`API_SECRET_BINANCE_${envName}`];

    const baseURL = 'https://api.binance.com/'
    const url = 'api/v3/account';
    const method = 'get'
    
    const timestamp = Date.now();
    const params = {
        recvWindow: 50000,
        timestamp: timestamp,
    }
    const queryString = buildQueryString({...params, timestamp})
    const signature = crypto.createHmac('sha256', apiSecretBinance).update(queryString).digest('hex');
    
    
    const { data: initialData } = await createRequest({
        baseURL: baseURL,
        apiKey: apiKeyBinance,
        url: `${url}?${queryString}&signature=${signature}`,
        method: method
    })
    const assets = initialData.balances.filter(e => e.free > 0)

    for(let i = 0; i < assets.length; i++) {
        let asset = assets[i]


        console.log(asset);
        
        let assetPrice = await getPriceForAsset(asset.asset, envName)

        let priceWith2Decimal = (Number)(assetPrice * asset.free).toFixed(2)
        console.log(`${asset.asset} => ${asset.free} and price = ${assetPrice} valuing = ${priceWith2Decimal}`);

        if(assetPrice === undefined || priceWith2Decimal < 0.01) {
            // skip creating mongo document
        } else {
        await AssetsByTime.create({
            userId: userId,
            name: asset.asset,
            symbol: asset.asset,
            quantity: asset.free,
            currentPrice: assetPrice,
            currentValue: priceWith2Decimal,
            exchange: 'binance',
            date: moment(timestamp).utcOffset(3).format(),
            time: buildTimeObject(timestamp)
            })
        }
    }  
    
    console.log(`----------------------- ENDING getAssetsByTimeBinance for ${userId} -----------------------------`)
    
}



module.exports = getAssetsByTime