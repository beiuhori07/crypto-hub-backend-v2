const axios = require('axios')
var moment = require('moment');

const AssetsByTime = require('../models/Assets-By-Time')
const ErrorModel = require('../models/Errors');
const { buildTimeObject } = require('../utils/utils');

const ethplorerBaseurl = "https://api.ethplorer.io"

const getETHAssets = async (userId, envName) => {
    const ethAddress = process.env[`ETH_ADDRESS_${envName}`]

    if(ethAddress == "") return;

    try {
        console.log("----------------------------- TRYING TO GET ETH PRICE AND BALANCE -------------------")
        const { 
            data: 
            { 
                ETH:
                {
                    price: {
                        rate: ethPrice
                    },
                    balance: ethBalance
                }
                
            }
        } = await axios.get(`${ethplorerBaseurl}/getAddressInfo/${ethAddress}?apiKey=freekey`)
        console.log("eth price = ", ethPrice)
        console.log("eth balance = ", ethBalance)
        console.log("eth value = ", ethPrice * ethBalance)
        console.log("----------------------------- END TRYING TO GET ETH PRICE AND BALANCE -------------------")

        const timestamp = Date.now();

        await AssetsByTime.create({
            userId: userId,
            name: "ETH",
            symbol: "ETH",
            quantity: ethBalance,
            currentPrice: ethPrice,
            currentValue: ethPrice * ethBalance,
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
        console.log("----------------------------- ERROR TRYING TO GET ETH PRICE AND BALANCE -------------------")
        console.log(err)
        console.log("----------------------------- ERROR TRYING TO GET ETH PRICE AND BALANCE -------------------")
    }
}


module.exports = getETHAssets