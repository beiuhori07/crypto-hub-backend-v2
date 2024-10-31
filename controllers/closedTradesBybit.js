
const { createRequest, buildQueryString } = require('../utils/utils')
const crypto = require('crypto');
var moment = require('moment')

const ClosedTradesIds = require('../models/Closed-Trades-Ids')
const ClosedTrades = require('../models/Closed-Trades');
const TradingDBInfo = require('../models/Trading-DB-Info')
const ErrorModel = require('../models/Errors')


const baseURLBybit = 'https://api.bybit.com'
const apiKeyBybit = process.env.API_KEY_BYBIT;
const apiSecretBybit = process.env.API_SECRET_BYBIT;
const method = 'get'
let startTime = new Date()
let endTime = new Date()


// TODO : no try-catches here ?!?!


const getSymbolListBybit = async (envName) => {
    const apiKeyBybit = process.env[`API_KEY_BYBIT_${envName}`];
    const apiSecretBybit = process.env[`API_SECRET_BYBIT_${envName}`];

    let symbolListBybit = []

    const url = '/v2/public/symbols';
    const params = {
        api_key: apiKeyBybit,
        recv_window: 50000,
    }
    let timestamp = Date.now()
    const queryString = buildQueryString({...params, timestamp})
    const signature = crypto.createHmac('sha256', apiSecretBybit).update(queryString).digest('hex');
    

    const data = await createRequest({
        baseURL: baseURLBybit,
        apiKey: apiKeyBybit,
        url: `${url}?${queryString}&sign=${signature}`,
        method: method
    })


    // console.log(data.status, data.data.result.length, timestamp)
    
    data.data.result.forEach(/*async*/ asset => {
        if(asset.name.endsWith('USDT')) {
            symbolListBybit.push(asset.name)

            // await ClosedTradesIds.create({
            //     symbol: asset.name,
            //     lastId: 0
            // })
        }
    });
    
    // console.log(symbolListBybit, symbolListBybit.length)
    return symbolListBybit
}


const getSymbolNewClosedPNLBybit = async (symbol, userId, envName) => {
    const apiKeyBybit = process.env[`API_KEY_BYBIT_${envName}`];
    const apiSecretBybit = process.env[`API_SECRET_BYBIT_${envName}`];

    const url = '/private/linear/trade/closed-pnl/list';

    let timestamp = Date.now();
    const startTimeTimeStamp = timestamp - 2*24*60*60*1000;    // two days before date
    startTime = new Date(startTimeTimeStamp)
    // console.log('------------------------------------------------------')
    // console.log(`start time = `, startTime);
    // console.log(`end time = `, endTime);
    
    const params = {
        api_key: apiKeyBybit,
        end_time: parseInt(endTime / 1000),
        recv_window: 50000,
        start_time: parseInt(startTime / 1000),
        symbol: symbol,
    }
    const queryString = buildQueryString({...params, timestamp})
    const signature = crypto.createHmac('sha256', apiSecretBybit).update(queryString).digest('hex');
    
    const data = await createRequest({
        baseURL: baseURLBybit,
        apiKey: apiKeyBybit,
        url: `${url}?${queryString}&sign=${signature}`,
        method: method
    })
    // console.log(`url = `, data.config.url)
    // console.log(`status code = `, data.status)
    // console.log(data.data.result)



    // could be done better ????
    if(data.status == 200) {
        if(data.data.result != null) {
            if(data.data.result.data != null) {
                

                let closedTradesList = data.data.result.data
                let lastId
                let maxId = 0;
                let idToBeUpdatedAfter;
                let findId = await ClosedTradesIds.findOne({
                    userId: userId,
                    symbol: closedTradesList[0].symbol
                })

                console.log('find id', findId);
                if(findId === null) { 
                    for(let i = 0; i < closedTradesList.length; i++) {
                        let trade = closedTradesList[i]
                        const tradeDirection = ((trade.avg_exit_price - trade.avg_entry_price) * trade.closed_pnl ) > 0 ? 'Long' : 'Short' ;

                        await ClosedTrades.create({
                            userId: userId,
                            symbol: trade.symbol,
                            direction: tradeDirection,
                            quantity: trade.qty,
                            closed_quantity: trade.closed_size,  
                            entryValue: trade.cum_entry_value,
                            exitValue: trade.cum_exit_value,
                            entryPrice: trade.avg_entry_price,
                            exitPrice: trade.avg_exit_price,
                            closedPnL: trade.closed_pnl,
                            closedPnLID: trade.id,
                            exchange: 'Bybit',
                            date: moment.unix(trade.created_at).utcOffset(3).format(),
                            time: {
                                year: moment.unix(trade.created_at).utcOffset(3).format('y'),
                                month: moment.unix(trade.created_at).utcOffset(3).format('M'),
                                weekOfYear: moment.unix(trade.created_at).utcOffset(3).format('w'),
                                weekOfMonth: Math.ceil( moment.unix(trade.created_at).utcOffset(3).format('D') / 7 ),
                                dayOfYear: moment.unix(trade.created_at).utcOffset(3).format('DDD'),
                                dayOfMonth: moment.unix(trade.created_at).utcOffset(3).format('D'),
                                dayOfWeek: moment.unix(trade.created_at).utcOffset(3).format('E'),
                                hour: moment.unix(trade.created_at).utcOffset(3).format('H')
                            }
                        })

                        await TradingDBInfo.updateOne({ userId: userId }, { $inc: { numberOfTrades: 1, totalValueOfTrades: (Number)(trade.cum_entry_value).toFixed(2) } })

                        
                        if(trade.id > maxId) {
                            console.log('this is trade.id ->>>>>>>>>>>>>>>>>>', trade.id);
                            console.log('this is maxId ->>>>>>>>>>>>>>>>>>', maxId);
                            maxId = trade.id
                        }
                    }
                
                    await ClosedTradesIds.create({
                        userId: userId,
                        symbol: closedTradesList[0].symbol,
                        lastId: maxId
                    })
                } else {
                    lastId = findId.lastId
                    idToBeUpdatedAfter = findId.lastId
                    
                    
                    for(let i = 0; i < closedTradesList.length; i++) {
                        let trade = closedTradesList[i]
                        
                        if(trade.id > lastId) {
                            const tradeDirection = ((trade.avg_exit_price - trade.avg_entry_price) * trade.closed_pnl ) > 0 ? 'Long' : 'Short' ;

                            await ClosedTrades.create({
                                userId: userId,
                                symbol: trade.symbol,
                                direction: tradeDirection,
                                quantity: trade.qty,
                                closed_quantity: trade.closed_size,  
                                entryValue: trade.cum_entry_value,
                                exitValue: trade.cum_exit_value,
                                entryPrice: trade.avg_entry_price,
                                exitPrice: trade.avg_exit_price,
                                closedPnL: trade.closed_pnl,
                                closedPnLID: trade.id,
                                exchange: 'Bybit',
                                date: moment.unix(trade.created_at).utcOffset(3).format(),
                                time: {
                                    year: moment.unix(trade.created_at).utcOffset(3).format('y'),
                                    month: moment.unix(trade.created_at).utcOffset(3).format('M'),
                                    weekOfYear: moment.unix(trade.created_at).utcOffset(3).format('w'),
                                    weekOfMonth: Math.ceil( moment.unix(trade.created_at).utcOffset(3).format('D') / 7 ),
                                    dayOfYear: moment.unix(trade.created_at).utcOffset(3).format('DDD'),
                                    dayOfMonth: moment.unix(trade.created_at).utcOffset(3).format('D'),
                                    dayOfWeek: moment.unix(trade.created_at).utcOffset(3).format('E'),
                                    hour: moment.unix(trade.created_at).utcOffset(3).format('H')
                                }
                            })

                            await TradingDBInfo.updateOne({ userId: userId }, { $inc: { numberOfTrades: 1, totalValueOfTrades: (Number)(trade.cum_entry_value).toFixed(2) } })

                        
                            if(trade.id > idToBeUpdatedAfter) {
                                console.log('this is trade.id ->>>>>>>>>>>>>>>>>>', trade.id);
                                console.log('this is lastId ->>>>>>>>>>>>>>>>>>', lastId);
                                idToBeUpdatedAfter = trade.id
                            }
                        }
                    }

                    await ClosedTradesIds.findOneAndUpdate({
                        userId: userId,
                        symbol: closedTradesList[0].symbol
                    }, 
                    { lastId: idToBeUpdatedAfter })
                }
                
            }
        }
    } else {
        console.log('status code not 200 => ', data.status)
    }
}

module.exports = {
    getSymbolListBybit,
    getSymbolNewClosedPNLBybit
}


