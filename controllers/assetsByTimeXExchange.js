const axios = require('axios')
var moment = require('moment');

const AssetsByTime = require('../models/Assets-By-Time')
const ErrorModel = require('../models/Errors');
const { buildTimeObject } = require('../utils/utils');

const xexchangeBaseUrl = "https://api.multiversx.com"

const getXExchangeAssets = async (userId, envName) => {
    const erdAddress = process.env[`ERD_ADDRESS_${envName}`]
    if(erdAddress == "") return;

    const egldPrice = await getEGLDPrice()

    getEGLDBalance(userId, egldPrice, erdAddress)
    getEGLDStaked(userId, egldPrice, erdAddress)
}

const getEGLDPrice = async () => {
    try {
        console.log("------------------------------- TRYING TO GET EGLDPRICE -----------------")
        // const data = await axios.get(`${xexchangeBaseUrl}/economics`)
        const data = await axios.get(`${xexchangeBaseUrl}/mex/tokens/WEGLD-bd4d79`)
        // const { data: { price: egldPrice } } = await axios.get(`${xexchangeBaseUrl}/economics`)
        console.log(data)
        let egldPrice;
        if(data.data != null) {
            egldPrice = data.data.price
        }
        console.log("egld price = ", egldPrice)
        console.log("------------------------------- END TRYING EGLD PRICE -----------------")
        return egldPrice;
    } catch(err) {
        const timestamp = Date.now()
        await ErrorModel.create({
            timestamp: timestamp,
            time: buildTimeObject(timestamp),
            message: err
        })
        console.log("-------------------------------- ERR TRYING TO GET EGLD PRICE --------------")
        console.log(err)
        console.log("-------------------------------- ERR TRYING TO GET EGLD PRICE --------------")
        return 0;
    }
}

const getEGLDBalance = async (userId, egldPrice, erdAddress) => {
    try {
        const { data: { balance: egldBalance} } = await axios.get(`${xexchangeBaseUrl}/accounts/${erdAddress}`)
        const readableEgldBalance = egldBalance / (10 ** 18)
        console.log("-------------------------------- TRYING TO GET EGLD Balance --------------")
        console.log("egldBalance = ", readableEgldBalance)
        console.log("egldPrice = ", egldPrice)
        console.log("egldValue = ", egldPrice * readableEgldBalance)
        console.log("-------------------------------- TRYING TO GET EGLD Balance --------------")

        const timestamp = Date.now();

        await AssetsByTime.create({
            userId: userId,
            name: "EGLD",
            symbol: "EGLD",
            quantity: readableEgldBalance,
            currentPrice: egldPrice,
            currentValue: egldPrice * readableEgldBalance,
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
        console.log("-------------------------------- ERR TRYING TO GET EGLD Balance --------------")
        console.log(err)
        console.log("-------------------------------- ERR TRYING TO GET EGLD Balance --------------")        
    }
}

const getEGLDStaked = async (userId, egldPrice, erdAddress) => {
    try {
        const { data } = await axios.get(`${xexchangeBaseUrl}/accounts/${erdAddress}/delegation`)

        const timestamp = Date.now();

        for(let i = 0; i < data.length; i++) {
            const {
                userActiveStake: egldStaked,
                claimableRewards: egldStakedRewards
            } = data[i]
            const readableEgldStaked = ((Number) (egldStaked)) / (10 ** 18)
            const readableEgldStakedRewards = ((Number) (egldStakedRewards)) / (10 ** 18)
            console.log(`-------------------------------- TRYING TO GET EGLD Staked ${i} --------------`)
            console.log("egldStaked = ", readableEgldStaked)
            console.log("egldStakedRewards = ", readableEgldStakedRewards)
            console.log("egldPrice = ", egldPrice)
            console.log("egldStakedValue = ", egldPrice * readableEgldStaked)
            console.log("egldStakedRewardsValue = ", egldPrice * readableEgldStakedRewards)
            console.log(`-------------------------------- TRYING TO GET EGLD Staked ${i} --------------`)

            await AssetsByTime.create({
                userId: userId,
                name: "EGLD staked",
                symbol: "EGLD",
                quantity: readableEgldStaked,
                currentPrice: egldPrice,
                currentValue: egldPrice * readableEgldStaked,
                exchange: 'xexchange',
                date: moment(timestamp).utcOffset(3).format(),
                    time: buildTimeObject(timestamp)
                })
            
            await AssetsByTime.create({
                userId: userId,
                name: "EGLD staked rewards",
                symbol: "EGLD",
                quantity: readableEgldStakedRewards,
                currentPrice: egldPrice,
                currentValue: egldPrice * readableEgldStakedRewards,
                exchange: 'xexchange',
                date: moment(timestamp).utcOffset(3).format(),
                    time: buildTimeObject(timestamp)
                })
        }
        
    } catch(err) {
        const timestamp = Date.now()
        await ErrorModel.create({
            timestamp: timestamp,
            time: buildTimeObject(timestamp),
            message: err
        })
        console.log("-------------------------------- ERR TRYING TO GET EGLD Staked --------------")
        console.log(err)
        console.log("-------------------------------- ERR TRYING TO GET EGLD Staked --------------")        
    }
}

module.exports = getXExchangeAssets