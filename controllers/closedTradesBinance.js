
const { createRequest, buildQueryString, buildTimeObject } = require('../utils/utils')
const crypto = require('crypto');
var moment = require('moment')

const BinanceFuturesStillOpenTrades = require('../models/Binance-Futures-Still-Open-Trades')
const ClosedTrades = require('../models/Closed-Trades')
const TradingDBInfo = require('../models/Trading-DB-Info')
const BinanceFuturesLastId = require('../models/Binance-Futures-Last-Id');
const ErrorModel = require('../models/Errors');

const baseURLBinance = 'https://fapi.binance.com/'
const apiKeyBinance = process.env.API_KEY_BINANCE;
const apiSecretBinance = process.env.API_SECRET_BINANCE;


const getSymbolNewClosedPNLBinance = async (symbol, userId, envName) => {
    const apiKeyBinance = process.env[`API_KEY_BINANCE_${envName}`];
    const apiSecretBinance = process.env[`API_SECRET_BINANCE_${envName}`];

    const url = '/fapi/v1/userTrades'
    const method = 'get'

    let lastId = -1;
    let findId = await BinanceFuturesLastId.findOne({
        userId: userId,
        symbol: symbol
    })
    if(findId == null) {
        lastId = 0;
    } else {
        lastId = findId.id
    }
    let timestamp = Date.now();
    let params;
    if(lastId == 0) {
        params = {
            symbol: symbol,
            recvWindow: 50000
        }
    } else {
        params = {
            symbol: symbol,
            fromId: lastId, //205246306,//lastId, //203222668, //203634606
            recvWindow: 50000
        }
    }
    // let ts = Date.now()
    // startTime = timestamp - (t * 7 + 2) * 24 * 60 * 60 * 1000;
    // endTime = timestamp - (((t - 1) * 7) + 2) * 24 * 60 * 60 * 1000;
    // params = {
    //     endTime: endTime,
    //     recvWindow: 50000,
    //     symbol: symbol,
    //     startTime: startTime,
    //     timestamp: ts
    // }

    console.log("--------------------------------------- STARTING SEARCH FOR CLOSED TRADES ----------------------------------------")
    try {
        
        const queryString = buildQueryString({...params, timestamp})
        const signature = crypto.createHmac('sha256', apiSecretBinance).update(queryString).digest('hex');
        const data = await createRequest({
            baseURL: baseURLBinance,
            apiKey: apiKeyBinance,
            url: `${url}?${queryString}&signature=${signature}`,
            method: method
        })
    
        const trade = data.data
        for(let i = 0; i < trade.length; i++) {
            if(i == 0 && lastId != 0) continue; 
            const tradeAlreadyOpen = await BinanceFuturesStillOpenTrades.findOne({ 
                userId: userId,
                symbol: trade[i].symbol
            })
            // console.log('this is tradeALreadyOpen', tradeAlreadyOpen);
            let newPrice = -1;
            let newQty = -1;
            let oldPrice = -1;
            let newValue = -1;
            if(tradeAlreadyOpen == null) {
                await BinanceFuturesStillOpenTrades.create({
                    userId: userId,
                    symbol: trade[i].symbol,
                    quantity: trade[i].side === 'BUY' ? (Number) (trade[i].qty) : (Number) (trade[i].qty * (-1)),
                    price: (Number) (trade[i].price),
                    value: (Number) (trade[i].price) * (Number) (trade[i].qty),
                    realizedPnl: 0
                })
            } else {
                const qty = (Number) (trade[i].side === 'BUY' ? trade[i].qty : ((Number) (trade[i].qty) * (-1)))
                console.log('this is qty = ', qty)
                newQty = (Number) (tradeAlreadyOpen.quantity) + (Number) (qty);
                console.log('this is newQty = ', newQty)
                
                
                if(checkIfAlmostZero(qty, tradeAlreadyOpen.quantity)) {
                    console.log('we deletin still open trade now ', trade[i].symbol)
                    await BinanceFuturesStillOpenTrades.deleteOne({ 
                        userId: userId,
                        symbol: trade[i].symbol
                    })
                    newPrice = tradeAlreadyOpen.price
                    newValue = tradeAlreadyOpen.value;
                } else {   
                    oldPrice = tradeAlreadyOpen.price;
                    
                    // price interpolation to compute 'avg' price -------------// can the division be < 0 ???
                    newPrice = ((Number) (trade[i].realizedPnl) == 0) ? oldPrice * (tradeAlreadyOpen.quantity / newQty) + ((Number)(trade[i].price)) * (1 - tradeAlreadyOpen.quantity / newQty) : oldPrice 
                    newValue = ((Number) (trade[i].realizedPnl) == 0) ? (newQty * newPrice) : tradeAlreadyOpen.value;  // still not really work if you realize some pnl and then you add back some margin to the trade - workaround - keep boolean flag - if realizedPnlPulled and added margin - then maybe create a separate entry for last, then calculate fields for a new trade based on remaining qty and price of last trade
                    await BinanceFuturesStillOpenTrades.updateOne({
                        userId: userId,
                        symbol: tradeAlreadyOpen.symbol
                    },
                    {quantity: newQty, price: newPrice, value: newValue, $inc: { realizedPnl: (Number)(trade[i].realizedPnl) }}) 
                }
                
                let entryPrice = newPrice;
                if(checkIfAlmostZero(qty, tradeAlreadyOpen.quantity)) {  
                    await ClosedTrades.create({ 
                        userId: userId,
                        symbol: trade[i].symbol,
                        direction: trade[i].side === 'BUY' ? 'Short' : 'Long',
                        quantity: newQty == 0 ? tradeAlreadyOpen.quantity : newQty,  // ------------------------ compute this
                        closed_quantity: trade[i].side !== 'BUY' ? (Number) (trade[i].qty) : (((Number) (trade[i].qty)) * (-1)), 
                        entryValue: newValue > 0 ? newValue : (newValue * (-1)), 
                        exitValue: trade[i].quoteQty,
                        entryPrice: entryPrice, 
                        exitPrice: trade[i].price,
                        closedPnL:  (Number)((Number)(trade[i].realizedPnl) + (Number)(tradeAlreadyOpen.realizedPnl)),
                        closedPnLID: trade[i].id,
                        exchange: 'Binance',
                        date: moment(trade[i].time).format(),
                        time: buildTimeObject(timestamp)
                    })
        
                    await TradingDBInfo.updateOne({ userId: userId }, { $inc: { numberOfTrades: 1, totalValueOfTrades: (Number)(newValue > 0 ? newValue : (newValue * (-1))).toFixed(2) }})
                }
            }
            if(i == 0 && lastId == 0) {      
                await BinanceFuturesLastId.create({
                    userId: userId,
                    symbol: trade[i].symbol,
                    id: trade[i].id
                })
            } else {
                await BinanceFuturesLastId.updateOne({
                    userId: userId,
                    symbol: trade[i].symbol
                }, {id: trade[i].id})
            }
        }
        if(trade.length == 1 && lastId != 0) {
            console.log('no new trades on symbol', symbol)
        } else {
            console.log(data.data)
        }
    } catch(error) {
        const timestamp = Date.now()
        await ErrorModel.create({
            timestamp: timestamp,
            time: buildTimeObject(timestamp),
            message: error
        })
        console.log("---------------------------------------- err --------------------------")
        console.log(error)
        console.log("---------------------------------------- err --------------------------")
    }
    console.log("--------------------------------------- ENDING SEARCH FOR CLOSED TRADES ----------------------------------------")
}

const checkIfAlmostZero = (qty1, qty2) => {
    return ((qty1 + qty2 > -0.000000001) && (qty1 + qty2 < 0.000000001))
}

const getSymbolListBinance = async (envName) => {
    let symbolListBinance = []
    const url = '/fapi/v1/ticker/price';
    const method = 'get'
    const apiKeyBinance = process.env[`API_KEY_BINANCE_${envName}`];
    const apiSecretBinance = process.env[`API_SECRET_BINANCE_${envName}`];

    try {
        const data = await createRequest({
            baseURL: baseURLBinance,
            apiKey: apiKeyBinance,
            url: `${url}`,
            method: method
        })
        console.log("---------------------------------SYMBOL LIST BINANCE CALL LOGS START----------------------------------------------------")
        // console.log("data = ", data)
        // console.log(data.data, data.data.length)
        console.log("---------------------------------SYMBOL LIST BINANCE CALL LOGS END------------------------------------------------------")
        const symbolAndPriceArray = data.data
        const symbolArray = symbolAndPriceArray.map(e => e.symbol)
        
        symbolArray.forEach( asset => {
            if(asset.endsWith('USDT') || asset.endsWith('BUSD')) {
                symbolListBinance.push(asset)
            }
        });
        
        return symbolListBinance
    } catch (error) {
        const timestamp = Date.now()
        await ErrorModel.create({
            timestamp: timestamp,
            time: buildTimeObject(timestamp),
            message: error
        })
        console.log("error = ", error)
    }
}

module.exports = {
    getSymbolListBinance,
    getSymbolNewClosedPNLBinance
}
