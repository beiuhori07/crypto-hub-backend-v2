
const crypto = require('crypto');
const axios = require('axios')

var moment = require('moment');
const AssetsByTime = require('../models/Assets-By-Time');
const ErrorModel = require('../models/Errors');
const { buildTimeObject } = require('../utils/utils')


const getBitgetAssetPrice = async (envName, symbol) => {
    if(symbol == 'USDT') return {
        price: 1,
        change24h: 0
    };

    const apiKeyBitget = process.env[`API_KEY_BITGET_${envName}`];
    const apiSecretBitget = process.env[`API_SECRET_BITGET_${envName}`];

    const bitgetDomain = 'https://api.bitget.com';
    const url = '/api/v2/spot/market/tickers'
    const timestamp = Date.now();

    const preHash = String(timestamp) + "GET" + url + `symbol=${symbol}USDT`
    const max = crypto.createHmac('sha256', apiSecretBitget)
    const preHashToMacBuffer = max.update(preHash).digest()
    const signature = preHashToMacBuffer.toString('base64')

    try {

        const data = await axios.get(`${bitgetDomain}${url}?symbol=${symbol}USDT`,
            {
            })

        console.log(data.data.data[0].lastPr);
        console.log(data.data.data[0].changeUtc24h * 100);

        return {
            price: (Number)(data.data.data[0].lastPr),
            change24h: (Number)(data.data.data[0].changeUtc24h * 100)
        }

    } catch (err) {
        console.log(err.response.data);

    }
}

const getAssetsByTime = async (userId, envName) => {
    const apiKeyBitget = process.env[`API_KEY_BITGET_${envName}`];
    const apiSecretBitget = process.env[`API_SECRET_BITGET_${envName}`];
    
    if(!apiKeyBitget || !apiSecretBitget) return


    console.log(`----------------------- STARTING getAssetsByTimeBitget for ${userId} -----------------------------`)


    const bitgetDomain = 'https://api.bitget.com';
    const url = '/api/v2/spot/account/assets';
    const timestamp = Date.now();

    const preHash = String(timestamp) + "GET" + url // + qsorbodystr
    const max = crypto.createHmac('sha256', apiSecretBitget)
    const preHashToMacBuffer = max.update(preHash).digest()
    const signature = preHashToMacBuffer.toString('base64')

    try {

        const data = await axios.get(`${bitgetDomain}${url}`,
            {
                headers: {
                    "ACCESS-KEY": apiKeyBitget,
                    "ACCESS-SIGN": signature,
                    "ACCESS-PASSPHRASE": 'bitgetapicryptohub',
                    "ACCESS-TIMESTAMP": timestamp,
                    "locale": 'en-US',
                    "Content-Type": 'application/json'
                }
            })

        console.log(data.data);

        let assets = data.data.data



        for (let i = 0; i < assets.length; i++) {
            let asset = assets[i]


            console.log(asset);

            let { price: assetPrice } = await getBitgetAssetPrice(envName, asset.coin)

            let priceWith2Decimal = (Number)(assetPrice * asset.available).toFixed(2)
            console.log(`${asset.coin} => ${asset.available} and price = ${assetPrice} valuing = ${priceWith2Decimal}`);

            if (assetPrice === undefined || priceWith2Decimal < 0.01) {
                // skip creating mongo document
            } else {
                await AssetsByTime.create({
                    userId: userId,
                    name: asset.coin,
                    symbol: asset.coin,
                    quantity: asset.available,
                    currentPrice: assetPrice,
                    currentValue: priceWith2Decimal,
                    exchange: 'bitget',
                    date: moment(timestamp).utcOffset(3).format(),
                    time: buildTimeObject(timestamp)
                })
            }
        }
        console.log(`----------------------- ENDING getAssetsByTimeBitget for ${userId} -----------------------------`)
    } catch(err) {
        console.log(err)

        // todo: insert into error model
    }
    

}



module.exports = getAssetsByTime