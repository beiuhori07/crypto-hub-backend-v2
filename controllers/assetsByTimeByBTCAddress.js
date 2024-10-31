const axios = require('axios');
var moment = require('moment');

const AssetsByTime = require('../models/Assets-By-Time')
const ErrorModel = require('../models/Errors');
const { buildTimeObject } = require('../utils/utils');

const blockchainInfoAPIBalanceUrl = 'https://blockchain.info/q/addressbalance'
const blockchainInfoAPIPriceUrl = 'https://blockchain.info/ticker'

const getBTCAssets = async (userId, envName) => {
    const btcAddress = process.env[`BTC_ADDRESS_${envName}`];

    if(btcAddress == "") return;

    try {
        console.log("----------------------------- TRYING TO GET BTC PRICE AND BALANCE -------------------")
        const { 
            data: btcAmount
        } = await axios.get(`${blockchainInfoAPIBalanceUrl}/${btcAddress}`)

        let btcBalance = (Number)(btcAmount) / 10**8

        console.log("btc balance = ", btcBalance)

        const { 
            data: { USD: { last: btcPrice } }
        } = await axios.get(`${blockchainInfoAPIPriceUrl}`)


        console.log("btc price = ", btcPrice)
        console.log("btc value = ", (Number)(btcPrice) * (Number)(btcBalance))
        console.log("----------------------------- END TRYING TO GET BTC PRICE AND BALANCE -------------------")
    
        const timestamp = Date.now();

        await AssetsByTime.create({
            userId: userId,
            name: "BTC",
            symbol: "BTC",
            quantity: btcBalance,
            currentPrice: btcPrice,
            currentValue: (Number)(btcPrice) * (Number)(btcBalance),
            exchange: 'xexchange',
            date: moment(timestamp).utcOffset(3).format(),
                time: buildTimeObject(timestamp)
            })
    } catch(err) {
        const timestamp = Date.now()
        await ErrorModel.create({
            timestamp: timestamp,
            time: buildTimeObject(timestamp),
            message: err
        })
        console.log("----------------------------- ERROR TRYING TO GET BTC PRICE AND BALANCE -------------------")
        console.log(err)
        console.log("----------------------------- ERROR TRYING TO GET BTC PRICE AND BALANCE -------------------")

    }
    
}

module.exports = getBTCAssets