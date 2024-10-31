const crypto = require('crypto');
const axios = require('axios')

var moment = require('moment');
const AssetsByTime = require('../models/Assets-By-Time');
const ErrorModel = require('../models/Errors');
const { buildTimeObject } = require('../utils/utils')


const getKucoinAssetPrice = async (symbol) => {
    if(symbol == 'USDT') return {
        price: 1,
        change24h: 0
    };

    const bitgetDomain = 'https://api.kucoin.com';
    const url = '/api/v1/market/stats'

    try {

        const data = await axios.get(`${bitgetDomain}${url}?symbol=${symbol}-USDT`)

        return {
            price: (Number)(data.data.data.last),
            change24h: (Number)(data.data.data.changeRate * 100)
        }

    } catch (err) {
        console.log(err.response.data);

    }
}


const getAssetsByTimeKucoin = async (userId, envName) => {

    const apiKeyKucoin = process.env[`API_KEY_KUCOIN_${envName}`];
    const apiSecretKucoin = process.env[`API_SECRET_KUCOIN_${envName}`];

    if(!apiKeyKucoin || !apiSecretKucoin) return


    console.log(`----------------------- STARTING getAssetsByTimeKucoin for ${userId} -----------------------------`)


    const bitgetDomain = 'https://api.kucoin.com';
    const url = '/api/v1/accounts?type=trade';
    timestamp = Date.now();

    const preHash = String(timestamp) + "GET" + url // + qsorbodystr
    const max = crypto.createHmac('sha256', apiSecretKucoin)
    const preHashToMacBuffer = max.update(preHash).digest()
    const signature = preHashToMacBuffer.toString('base64')

    try {

        const data = await axios.get(`${bitgetDomain}${url}`,
            {
                headers: {
                    "KC-API-KEY": apiKeyKucoin,
                    "KC-API-SIGN": signature,
                    "KC-API-PASSPHRASE": 'kucoinapicryptohub',
                    "KC-API-TIMESTAMP": timestamp,
                    "KC-API-KEY-VERISON": 0
                }
            })

        let assets = data.data.data

        for (let i = 0; i < assets.length; i++) {

            const { price: assetPrice, change24h: priceChange24h } = await getKucoinAssetPrice(assets[i].currency)
            console.log(assetPrice)

            let formattedPrice = -1;
            if (assetPrice > 10) {
                formattedPrice = (Number)(assetPrice).toFixed(2)
            } else {
                formattedPrice = (Number)(assetPrice)
            }
            let priceWith2Decimal = (Number)(assetPrice * assets[i].available).toFixed(2)
            console.log(`[kucoin]->${assets[i].currency} => ${assets[i].available} and price = ${assetPrice} valuing = ${priceWith2Decimal}`);

            
            if (assetPrice === undefined || priceWith2Decimal < 0.01) {
                // skip creating mongo document
            } else {
                await AssetsByTime.create({
                    userId: userId,
                    name: assets[i].currency,
                    symbol: assets[i].currency,
                    quantity: assets[i].available,
                    currentPrice: assetPrice,
                    currentValue: priceWith2Decimal,
                    exchange: 'kucoin',
                    date: moment(timestamp).utcOffset(3).format(),
                    time: buildTimeObject(timestamp)
                })
            }
        }
        console.log(`----------------------- ENDING getAssetsByTimeKucoin for ${userId} -----------------------------`)

    } catch (err) {
        console.log(err);
    }
}

module.exports = getAssetsByTimeKucoin