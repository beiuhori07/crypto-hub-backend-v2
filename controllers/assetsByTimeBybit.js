
const { createRequest, buildQueryString, buildTimeObject } = require('../utils/utils')
const crypto = require('crypto');
var moment = require('moment');

const AssetsByTime = require('../models/Assets-By-Time');
const ErrorModel = require('../models/Errors');

const baseURLBybit = 'https://api.bybit.com'

const method = 'get'
let timestamp = Date.now();


let BTCpriceBybit = 0;

const getPriceForAsset = async (assetName, envName) => {

    const apiKeyBybit = process.env[`API_KEY_BYBIT_${envName}`];
    const apiSecretBybit = process.env[`API_SECRET_BYBIT_${envName}`];

    // TODO all stables ? how ?

    if(assetName == 'USDT' || assetName == 'BUSD' || assetName == 'USDC') {
        return 1;
    }

    const url = '/spot/quote/v1/ticker/price';
    const method = 'get'
    
    const params = {
        symbol: `${assetName}USDT`
    }
    timestamp = Date.now();
    const queryString = buildQueryString({...params, timestamp})
    const signature = crypto.createHmac('sha256', apiSecretBybit).update(queryString).digest('hex');
    let dataFromUSDT;
    let dataFromUSDC;
    let dataFromBTC;
    let dataFromDAI;
    try {

        dataFromUSDT = await createRequest({
            baseURL: baseURLBybit,
            apiKey: apiKeyBybit,
            url: `${url}?${queryString}&sign=${signature}`,
            method: method
        })

        console.log('got price from USDT conversion')

        return dataFromUSDT.data.result.price

    } catch(errorUSDT) {
        console.log("trying to find symbol with USDC pair") // ------------------------ USDC AND BTC NOT TESTED AND NOT CAREFULLY CRAFTED :)

            const params = {
                api_key: apiKeyBybit,
                recv_window: 50000,
                symbol: `${assetName}USDC`
                }
            const queryString = buildQueryString({...params})
            const signature = crypto.createHmac('sha256', apiSecretBybit).update(queryString).digest('hex');

            try {


                const dataFromUSDC = await createRequest({
                    baseURL: baseURLBybit,
                    apiKey: apiKeyBybit,
                    url: `${url}?${queryString}&sign=${signature}`,
                    method: method
                })
                console.log('got price from USDC conversion')
                return dataFromUSDC.data.result.price;



            } catch(errorUSDC) {
                console.log("trying to find symbol with BTC pair") // --------------------- de testat pe toate in afara de USDT
                
                const params = {
                    symbol: `${assetName}BTC`
                }
                const queryString = buildQueryString({...params})
                const signature = crypto.createHmac('sha256', apiSecretBybit).update(queryString).digest('hex');
                try { 
                    const { data: dataFromBTC } = await createRequest({
                        baseURL: baseURLBybit,
                        apiKey: apiKeyBybit,
                        url: `${url}?${queryString}&sign=${signature}`,
                        method: method
                    })
                    console.log('got price from BTC conversion')
                    return dataFromBTC.data.result.price * BTCpriceBybit;
                } catch(errorBTC) {
                    console.log("trying to find symbol with DAI pair")
                
                    const params = {
                        symbol: `${assetName}DAI`
                    }
                    const queryString = buildQueryString({...params})
                    const signature = crypto.createHmac('sha256', apiSecretBybit).update(queryString).digest('hex');
                    try { 
                        const { data: dataFromDAI } = await createRequest({
                            baseURL: baseURLBybit,
                            apiKey: apiKeyBybit,
                            url: `${url}?${queryString}&sign=${signature}`,
                            method: method
                        })
                        console.log('got price from DAI conversion')
                        return dataFromDAI.data.result.price * BTCpriceBybit;
                    } catch(finalError) {
                        const timestamp = Date.now()
                        await ErrorModel.create({
                            timestamp: timestamp,
                            time: buildTimeObject(timestamp),
                            message: finalError
                        })
                        console.log("cannot find symbol price")
                        return 0;
                    }
                }
            }
        }

}


const getAssetsByTimeBybit = async (userId, envName) => {
    console.log(`----------------------- STARTING getAssetsByTimeBybit for ${userId} -----------------------------`)

    const apiKeyBybit = process.env[`API_KEY_BYBIT_${envName}`];
    const apiSecretBybit = process.env[`API_SECRET_BYBIT_${envName}`];
    
    const url = '/spot/v1/account';
    const params = {
        api_key: apiKeyBybit,
        recv_window: 50000,
    }

    timestamp = Date.now();
    const queryString = buildQueryString({...params, timestamp})
    const signature = crypto.createHmac('sha256', apiSecretBybit).update(queryString).digest('hex');
    

    const data = await createRequest({
        baseURL: baseURLBybit,
        apiKey: apiKeyBybit,
        url: `${url}?${queryString}&sign=${signature}`,
        method: method
    })
    

    if(data.data.result != null) {

        const assets = data.data.result.balances
        if(assets != null) {

            for(let i = 0; i < assets.length; i++) {
                let asset = assets[i]

                let assetPrice = await getPriceForAsset(asset.coin, envName)
                let priceWith2Decimal = (Number)(assetPrice * asset.free).toFixed(2)
                console.log(`${asset.coin} => ${asset.free} and price = ${assetPrice} valuing = ${priceWith2Decimal}`);

                if(assetPrice === undefined || priceWith2Decimal < 0.01) {
                    // skip creating mongo document
                } else {
                    console.log(assetPrice);
                    await AssetsByTime.create({
                        userId: userId,
                        name: asset.coin,
                        symbol: asset.coin,
                        quantity: asset.free,
                        currentPrice: assetPrice,
                        currentValue: priceWith2Decimal,
                        exchange: 'bybit',
                        date: moment(timestamp).utcOffset(3).format(),
                        time: {
                            year: moment(timestamp).utcOffset(3).format('y'), // de testat !!
                            month: moment(timestamp).utcOffset(3).format('M'),
                            weekOfYear: moment(timestamp).utcOffset(3).format('w'),
                            // weekOfMonth: Math.ceil( moment(timestamp).format('D') / 7 ), // ---------- change this
                            dayOfYear: moment(timestamp).utcOffset(3).format('DDD'),
                            dayOfMonth: moment(timestamp).utcOffset(3).format('D'),
                            dayOfWeek: moment(timestamp).utcOffset(3).format('E'),
                            hour: moment(timestamp).utcOffset(3).format('H')
                        }
                        })

                }

            }
        }
    }
    console.log(`----------------------- ENDING getAssetsByTimeBybit for ${userId} -----------------------------`)
}

// app.get('/', (req, res) => {
//     res.send('Hello World')
// })

// app.listen(port, async () => {
//     try {
//         await connectDB(process.env.MONGO_URI)

//         console.log(`app listening ${port}...`)

//         BTCprice = await getPriceForAsset('BTC')

//         if(BTCprice === undefined) {
//             console.log('could not find btc price');
//         }


//         console.log(`btc price = ${BTCprice}`)
//         let price = await getPriceForAsset('EGLD')
//         console.log(`price === ${price}`)

//         // getPriceForAsset('bruh');

//         getAssetsByTimeBybit()

//     } catch (error) {
//         console.log(error);
//     }    
// })

module.exports = getAssetsByTimeBybit