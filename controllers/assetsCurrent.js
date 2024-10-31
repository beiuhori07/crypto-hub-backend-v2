
const { createRequest, buildQueryString, buildTimeObject } = require('../utils/utils')
const crypto = require('crypto');
const axios = require('axios')
var moment = require('moment');

const UserApiMap = require('../models/User-Api-Map')
const ErrorModel = require('../models/Errors')

const baseURLBybit = 'https://api.bybit.com'
const xexchangeBaseUrl = "https://api.multiversx.com"
const ethplorerBaseurl = "https://api.ethplorer.io"
const blockchainInfoAPIBalanceUrl = 'https://blockchain.info/q/addressbalance'


/*

i need a map <userIr, userName> to know for which id, what env var to acces dynamically - process.env[`API-key-binance + ${map.get(1)}`]

*/

const method = 'get'

// let assetArray = []

let BTCpriceBinance;
let BNBpriceBinance;

const getPriceForAssetBinance = async (assetName, envName) => {

    const apiKeyBinance = process.env[`API_KEY_BINANCE_${envName}`];
    const apiSecretBinance = process.env[`API_SECRET_BINANCE_${envName}`];

    // TODO all stables ? how ?

    if (assetName === 'USDT' || assetName === 'BUSD' || assetName === 'USDC') {
        return {
            price: 1,
            priceChange24h: 0
        };
    }

    const baseURL = 'https://api.binance.com/'
    const url = '/api/v3/avgPrice';
    const method = 'get'

    const params = {
        symbol: `${assetName}USDT`
    }
    let queryString = buildQueryString({ ...params })
    let dataFromUSDT;
    let dataFromBUSD;
    let dataFromBTC;
    try {
        console.log("binance trying to find symbol with USDT pair for", assetName)

        dataFromUSDT = await createRequest({
            baseURL: baseURL,
            apiKey: apiKeyBinance,
            url: `${url}?${queryString}`,
            method: method
        })

        console.log('got price from USDT conversion');
        const change24hUrl = '/api/v3/ticker/24hr'
        let paramsChange24h = {
            symbol: `${assetName}USDT`
        }
        queryString = buildQueryString({ ...paramsChange24h })
        let priceChangeData = await createRequest({
            baseURL: baseURL,
            apiKey: apiKeyBinance,
            url: `${change24hUrl}?${queryString}`,
            method: method
        })
        console.log('binance -> this is 24h change', priceChangeData.data.priceChangePercent);
        return {
            price: dataFromUSDT.data.price,
            priceChange24h: priceChangeData.data.priceChangePercent
        }
    } catch (errorUSDT) {
        console.log("binance trying to find symbol with BUSD pair for", assetName, errorUSDT)

        const params = {
            symbol: `${assetName}BUSD`
        }
        queryString = buildQueryString({ ...params })

        try {


            const dataFromBUSD = await createRequest({
                baseURL: baseURL,
                apiKey: apiKeyBinance,
                url: `${url}?${queryString}`,
                method: method
            })
            console.log('got price from BUSD conversion')
            const change24hUrl = '/api/v3/ticker/24hr'
            const paramsChange24h = {
                symbol: `${assetName}BUSD`
            }
            queryString = buildQueryString({ ...paramsChange24h })
            let priceChangeData = await createRequest({
                baseURL: baseURL,
                apiKey: apiKeyBinance,
                url: `${change24hUrl}?${queryString}`,
                method: method
            })
            console.log('binance -> this is 24h change', priceChangeData.data.priceChangePercent);

            return {
                price: dataFromBUSD.data.price,
                priceChange24h: priceChangeData.data.priceChangePercent
            }

        } catch (errorBUSD) {
            console.log("binance trying to find symbol with BTC pair for", assetName) // ------------------- de testat pair cu BTC again(PHB?) si BNB 

            const url = '/api/v3/avgPrice';

            const timestamp = Date.now();
            const params = {
                symbol: `${assetName}BTC`
            }
            queryString = buildQueryString({ ...params })

            try {

                const { data: dataFromBTC } = await createRequest({
                    baseURL: baseURL,
                    apiKey: apiKeyBinance,
                    url: `${url}?${queryString}`,
                    method: method
                })
                console.log('got price from BTC conversion')

                // TODO IMPLEMENT 24H CHANGE FOR BTC AND BNB -> GET 24CHANGE FOR BTC AND BNB AND THEN CONVERT

                return {
                    price: dataFromBTC.price * BTCpriceBinance,
                    priceChange24h: 0
                }

            } catch (errorBTC) {
                console.log("binance trying to find symbol with BNB pair for", assetName)

                const url = '/api/v3/avgPrice';

                const timestamp = Date.now();
                const params = {
                    symbol: `${assetName}BNB`
                }
                queryString = buildQueryString({ ...params })

                try {

                    const { data } = await createRequest({
                        baseURL: baseURL,
                        apiKey: apiKeyBinance,
                        url: `${url}?${queryString}`,
                        method: method
                    })
                    console.log('got price from BNB conversion')

                    // TODO IMPLEMENT 24H CHANGE FOR BTC AND BNB -> GET 24CHANGE FOR BTC AND BNB AND THEN CONVERT

                    return {
                        price: data.price * BNBpriceBinance,
                        priceChange24h: 0
                    }

                } catch (finalError) {
                    await ErrorModel.create({
                        timestamp: timestamp,
                        time: buildTimeObject(timestamp),
                        message: finalError
                    })
                    console.log("cannot find symbol")

                    return {
                        price: 0,
                        priceChange24h: 0
                    }
                }
            }
        }
    }
}

const getCurrentAssetsByTimeBinance = async (assetArray, envName) => {
    const baseURL = 'https://api.binance.com/'
    // const baseURL = 'https://binance.com/'
    // const baseURL = 'https://data.binance.com/'
    const url = 'api/v3/account';
    const method = 'get'

    const apiKeyBinance = process.env[`API_KEY_BINANCE_${envName}`];
    const apiSecretBinance = process.env[`API_SECRET_BINANCE_${envName}`];

    const timestamp = Date.now();
    const params = {
        recvWindow: 50000,
        timestamp: timestamp,
    }
    const queryString = buildQueryString({ ...params, timestamp })
    const signature = crypto.createHmac('sha256', apiSecretBinance).update(queryString).digest('hex');


    const { data: initialData } = await createRequest({
        baseURL: baseURL,
        apiKey: apiKeyBinance,
        url: `${url}?${queryString}&signature=${signature}`,
        method: method
    })

    if (initialData != null) {

        // need to validate further for nulls? YES
        const assets = initialData.balances.filter(e => e.free > 0)

        for (let i = 0; i < assets.length; i++) {
            let asset = assets[i]

            console.log(asset);

            let { price: assetPrice, priceChange24h: priceChange24h } = await getPriceForAssetBinance(asset.asset, envName)
            let formattedPrice = -1;
            if (assetPrice > 10) {
                formattedPrice = (Number)(assetPrice).toFixed(2)
            } else {
                formattedPrice = (Number)(assetPrice) // todo : cast to (Number) needed?
            }
            let priceWith2Decimal = (Number)(assetPrice * asset.free).toFixed(2)
            console.log(`binance->${asset.asset} => ${asset.free} and price = ${assetPrice} valuing = ${priceWith2Decimal}`);

            if (assetPrice === undefined || priceWith2Decimal < 0.01) {
                // skip creating mongo document
            } else {
                let assetObject = {
                    name: asset.asset,
                    symbol: asset.asset,
                    quantity: asset.free,
                    currentPrice: formattedPrice,
                    currentValue: priceWith2Decimal,
                    priceChange24h: priceChange24h,
                    exchange: 'binance',
                }
                assetArray.push(assetObject)
            }
        }
        console.log('finished in binance!');
    } else {
        console.log('getCurrentAssetsByTimeBinance has null response!')
    }
}



let timestamp = Date.now();
let BTCpriceBybit = 0;

const getPriceForAssetBybit = async (assetName, envName) => {

    const apiKeyBybit = process.env[`API_KEY_BYBIT_${envName}`];
    const apiSecretBybit = process.env[`API_SECRET_BYBIT_${envName}`];


    // TODO all stables ? how ?

    if (assetName == 'USDT' || assetName == 'BUSD' || assetName == 'USDC') { // ----DAI???
        return {
            price: 1,
            priceChange24h: 0
        };

    }

    const url = '/spot/quote/v1/ticker/price';
    const method = 'get'

    const params = {
        symbol: `${assetName}USDT`
    }
    timestamp = Date.now();
    const queryString = buildQueryString({ ...params, timestamp })
    const signature = crypto.createHmac('sha256', apiSecretBybit).update(queryString).digest('hex');
    let dataFromUSDT;
    let dataFromUSDC;
    let dataFromBTC;
    let dataFromDAI;
    let priceChangeUsefulData

    try {
        console.log("bybit trying to find symbol with USDT pair", assetName) // ------------------------ USDC AND BTC NOT TESTED AND NOT CAREFULLY CRAFTED :)

        dataFromUSDT = await createRequest({
            baseURL: baseURLBybit,
            apiKey: apiKeyBybit,
            url: `${url}?${queryString}&sign=${signature}`,
            method: method
        })

        console.log('got price from USDT conversion')
        const change24hUrl = '/derivatives/v3/public/tickers'
        const paramsChange = {
            category: 'linear',
            symbol: `${assetName}USDT`
        }
        const queryStringChange = buildQueryString({ ...paramsChange, timestamp })
        const signatureChange = crypto.createHmac('sha256', apiSecretBybit).update(queryString).digest('hex');
        const priceChangeData = await createRequest({
            baseURL: baseURLBybit,
            apiKey: apiKeyBybit,
            url: `${change24hUrl}?${queryStringChange}&sign=${signatureChange}`,
            method: method
        })

        if (priceChangeData.data.result.list.length > 0) {
            priceChangeUsefulData = priceChangeData.data.result.list[0].price24hPcnt
            console.log('bybit -------> this is price change', priceChangeData.data.result.list);
        } else {
            console.log('bybit -------> this is price change but not list', priceChangeData.data.result.list);
            priceChangeUsefulData = 0
        }
        return {
            price: dataFromUSDT.data.result.price,
            priceChange24h: (Number)(priceChangeUsefulData) * 100
        }

    } catch (errorUSDT) {
        console.log("bybit trying to find symbol with USDC pair", assetName) // ------------------------ USDC AND BTC NOT TESTED AND NOT CAREFULLY CRAFTED :)

        const params = {
            api_key: apiKeyBybit,
            recv_window: 50000,
            symbol: `${assetName}USDC`
        }
        const queryString = buildQueryString({ ...params })
        const signature = crypto.createHmac('sha256', apiSecretBybit).update(queryString).digest('hex');

        try {


            const dataFromUSDC = await createRequest({
                baseURL: baseURLBybit,
                apiKey: apiKeyBybit,
                url: `${url}?${queryString}&sign=${signature}`,
                method: method
            })
            console.log('got price from USDC conversion')
            const change24hUrl = '/derivatives/v3/public/tickers'
            const paramsChange = {
                category: 'linear',
                symbol: `${assetName}USDC`
            }
            const queryStringChange = buildQueryString({ ...paramsChange, timestamp })
            const signatureChange = crypto.createHmac('sha256', apiSecretBybit).update(queryString).digest('hex');
            const priceChangeData = await createRequest({
                baseURL: baseURLBybit,
                apiKey: apiKeyBybit,
                url: `${change24hUrl}?${queryStringChange}&sign=${signatureChange}`,
                method: method
            })
            console.log('this is price change', priceChangeData.data.result.price24hPcnt);
            if (priceChangeData.data.result.list.lenth > 0) {
                priceChangeUsefulData = priceChangeData.data.result.list[0].price24hPcnt
            } else {
                priceChangeUsefulData = 0
            }
            return {
                price: dataFromUSDC.data.result.price,
                priceChange24h: (Number)(priceChangeUsefulData) * 100
            }


        } catch (errorUSDC) {
            console.log("bybit trying to find symbol with BTC pair", assetName) // ------------------------ USDC AND BTC NOT TESTED AND NOT CAREFULLY CRAFTED :)

            const params = {
                symbol: `${assetName}BTC`
            }
            const queryString = buildQueryString({ ...params })
            const signature = crypto.createHmac('sha256', apiSecretBybit).update(queryString).digest('hex');
            try {
                const { data: dataFromBTC } = await createRequest({
                    baseURL: baseURLBybit,
                    apiKey: apiKeyBybit,
                    url: `${url}?${queryString}&sign=${signature}`,
                    method: method
                })
                console.log('got price from BTC conversion')

                // IMPLEMENT PRICE CHANGE FOR BTC AND DAI

                return {
                    price: dataFromBTC.data.result.price * BTCpriceBybit,
                    priceChange24h: 0
                }
            } catch (errorBTC) {
                console.log("bybit trying to find symbol with DAI pair", assetName) // ------------------------ USDC AND BTC NOT TESTED AND NOT CAREFULLY CRAFTED :)

                const params = {
                    symbol: `${assetName}DAI`
                }
                const queryString = buildQueryString({ ...params })
                const signature = crypto.createHmac('sha256', apiSecretBybit).update(queryString).digest('hex');
                try {
                    const { data: dataFromDAI } = await createRequest({
                        baseURL: baseURLBybit,
                        apiKey: apiKeyBybit,
                        url: `${url}?${queryString}&sign=${signature}`,
                        method: method
                    })
                    console.log('got price from DAI conversion')

                    // IMPLEMENT PRICE CHANGE FOR BTC AND DAI ----- also is this return good ?? btc price???


                    return {
                        price: dataFromDAI.data.result.price * BTCpriceBybit,
                        priceChange24h: 0
                    }
                } catch (finalError) {
                    const timestamp = Date.now()
                    await ErrorModel.create({
                        timestamp: timestamp,
                        time: buildTimeObject(timestamp),
                        message: finalError
                    })
                    console.log("cannot find symbol price")
                    return {
                        price: 0,
                        priceChange24h: 0
                    }
                }
            }
        }
    }
}


const getCurrentAssetsByTimeBybit = async (assetArray, envName) => {

    const apiKeyBybit = process.env[`API_KEY_BYBIT_${envName}`];
    const apiSecretBybit = process.env[`API_SECRET_BYBIT_${envName}`];


    const url = '/spot/v1/account';
    const params = {
        api_key: apiKeyBybit,
        recv_window: 50000,
    }

    timestamp = Date.now();
    const queryString = buildQueryString({ ...params, timestamp })
    const signature = crypto.createHmac('sha256', apiSecretBybit).update(queryString).digest('hex');


    const data = await createRequest({
        baseURL: baseURLBybit,
        apiKey: apiKeyBybit,
        url: `${url}?${queryString}&sign=${signature}`,
        method: method
    })
    // console.log('this is data from bybit current assets', data)
    if (data.data.result != null) {
        const assets = data.data.result.balances // still need to validate further??
        console.log("------------------------------------ ASSETS LOGS START------------------------------")
        console.log("assets = ", assets)
        console.log("------------------------------------ ASSETS LOGS END------------------------------")
        if (assets != null) {

            for (let i = 0; i < assets.length; i++) {
                let asset = assets[i]


                let { price: assetPrice, priceChange24h: priceChange24h } = await getPriceForAssetBybit(asset.coin, envName)
                let formattedPrice = -1;
                if (assetPrice > 10) {
                    formattedPrice = (Number)(assetPrice).toFixed(2)
                } else {
                    formattedPrice = assetPrice
                }
                let priceWith2Decimal = (Number)(assetPrice * asset.free).toFixed(2)
                console.log(`bybit->${asset.coin} => ${asset.free} and price = ${assetPrice} valuing = ${priceWith2Decimal}`);

                if (assetPrice === undefined || priceWith2Decimal < 0.01) {
                    // skip creating mongo document
                } else {
                    console.log(assetPrice);
                    let assetObject = {
                        name: asset.coin,
                        symbol: asset.coin,
                        quantity: asset.free,
                        currentPrice: formattedPrice,
                        currentValue: priceWith2Decimal,
                        priceChange24h: priceChange24h,
                        exchange: 'bybit'
                    }

                    assetArray.push(assetObject)

                }
            }
        }
        console.log('finished in bybit!');
    } else {
        console.log('getCurrentAssetsByTimeBybit has null response!')
    }
}

const getCurrentAssetsXExchange = async (assetArray, envName) => {
    const erdAddress = process.env[`ERD_ADDRESS_${envName}`]
    if (erdAddress == "") return;

    const { pairPrice: egldPrice, pairPriceChange: egldPriceChange } = await getPairPriceOnBinance("EGLDUSDT")

    await getEGLDBalance(assetArray, egldPrice, egldPriceChange, erdAddress)
    await getEGLDStaked(assetArray, egldPrice, egldPriceChange, erdAddress)
}

const getPairPriceOnBinance = async (pair) => {
    try {
        console.log(`------------------------------- TRYING TO GET CURRENT ${pair} PRICE -----------------`)
        const { data: {
            lastPrice: egldPrice,
            priceChangePercent: egldPriceChange
        } } = await axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${pair}`)
        console.log("egld price = ", egldPrice)
        console.log("egld price change= ", egldPriceChange)
        console.log(`------------------------------- END TRYING TO GET CURRENT ${pair} PRICE -----------------`)
        return { pairPrice: (Number)(egldPrice).toFixed(2), pairPriceChange: (Number)(egldPriceChange).toFixed(2) }
    } catch (err) {
        const timestamp = Date.now()
        await ErrorModel.create({
            timestamp: timestamp,
            time: buildTimeObject(timestamp),
            message: err
        })
        console.log(`-------------------------------- ERR TRYING TO GET CURRENT ${pair} PRICE --------------`)
        console.log(err)
        console.log(`-------------------------------- ERR TRYING TO GET CURRENT ${pair} PRICE --------------`)
        return { pairPrice: 0, pairPriceChange: 0 }; // TODO : is this right
    }
}

const getEGLDBalance = async (assetArray, egldPrice, egldPriceChange, erdAddress) => {
    try {
        const { data: { balance: egldBalance } } = await axios.get(`${xexchangeBaseUrl}/accounts/${erdAddress}`)
        const readableEgldBalance = egldBalance / (10 ** 18)
        console.log("-------------------------------- TRYING TO GET EGLD Balance --------------")
        console.log("egldBalance = ", readableEgldBalance)
        console.log("egldPrice = ", egldPrice)
        console.log("egldValue = ", egldPrice * readableEgldBalance)
        console.log("-------------------------------- TRYING TO GET EGLD Balance --------------")

        let assetObject = {
            name: "EGLD",
            symbol: "EGLD",
            quantity: (Number)(readableEgldBalance).toFixed(2),
            currentPrice: egldPrice,
            currentValue: (Number)((egldPrice * readableEgldBalance)).toFixed(2),
            priceChange24h: egldPriceChange,
            exchange: 'xexchange',
        }

        assetArray.push(assetObject)
    } catch (err) {
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

const getEGLDStaked = async (assetArray, egldPrice, egldPriceChange, erdAddress) => {
    try {
        const { data } = await axios.get(`${xexchangeBaseUrl}/accounts/${erdAddress}/delegation`)

        for (let i = 0; i < data.length; i++) {
            const {
                userActiveStake: egldStaked,
                claimableRewards: egldStakedRewards
            } = data[i]
            const readableEgldStaked = ((Number)(egldStaked)) / (10 ** 18)
            const readableEgldStakedRewards = ((Number)(egldStakedRewards)) / (10 ** 18)
            console.log(`-------------------------------- TRYING TO GET EGLD Staked ${i} --------------`)
            console.log("egldStaked = ", readableEgldStaked)
            console.log("egldStakedRewards = ", readableEgldStakedRewards)
            console.log("egldPrice = ", egldPrice)
            console.log("egldStakedValue = ", egldPrice * readableEgldStaked)
            console.log("egldStakedRewardsValue = ", egldPrice * readableEgldStakedRewards)
            console.log(`-------------------------------- TRYING TO GET EGLD Staked ${i} --------------`)

            let assetObjectStake = {
                name: "EGLD staked",
                symbol: "EGLD",
                quantity: (Number)(readableEgldStaked).toFixed(2),
                currentPrice: egldPrice,
                currentValue: (Number)((egldPrice * readableEgldStaked)).toFixed(2),
                priceChange24h: egldPriceChange,
                exchange: 'xexchange',
            }

            let assetObjectStakeRewards = {
                name: "EGLD staked rewards",
                symbol: "EGLD",
                quantity: (Number)(readableEgldStakedRewards).toFixed(2),
                currentPrice: egldPrice,
                currentValue: (Number)((egldPrice * readableEgldStakedRewards)).toFixed(2),
                priceChange24h: egldPriceChange,
                exchange: 'xexchange',
            }

            assetArray.push(assetObjectStake)
            assetArray.push(assetObjectStakeRewards)
        }

    } catch (err) {
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

const getCurrentAssetsByETHAddress = async (assetArray, envName) => {
    const ethAddress = process.env[`ETH_ADDRESS_${envName}`]
    if (ethAddress == "") return;

    const { pairPrice: ethPrice, pairPriceChange: ethPriceChange } = await getPairPriceOnBinance("ETHUSDT")

    await getETHAssets(assetArray, ethAddress, ethPrice, ethPriceChange);
}

const getETHAssets = async (assetArray, ethAddress, ethPrice, ethPriceChange) => {
    try {
        console.log("----------------------------- TRYING TO GET CURRENT ETH BALANCE -------------------")
        const {
            data:
            {
                ETH:
                {
                    balance: ethBalance
                }

            }
        } = await axios.get(`${ethplorerBaseurl}/getAddressInfo/${ethAddress}?apiKey=freekey`)
        console.log("eth price = ", ethPrice)
        console.log("eth balance = ", ethBalance)
        console.log("eth value = ", ethPrice * ethBalance)
        console.log("----------------------------- END TRYING TO GET CURRENT ETH BALANCE -------------------")

        let assetObject = {
            name: "ETH",
            symbol: "ETH",
            quantity: (Number)(ethBalance).toFixed(2),
            currentPrice: ethPrice,
            currentValue: (Number)((ethPrice * ethBalance)).toFixed(2),
            priceChange24h: ethPriceChange,
            exchange: 'xexchange',
        }
        assetArray.push(assetObject)
    } catch (err) {
        const timestamp = Date.now()
        await ErrorModel.create({
            timestamp: timestamp,
            time: buildTimeObject(timestamp),
            message: err
        })
        console.log("----------------------------- ERROR TRYING TO GET CURRENT ETH BALANCE -------------------")
        console.log(err)
        console.log("----------------------------- ERROR TRYING TO GET CURRENT ETH BALANCE -------------------")
    }
}

const getCurrentAssetsByBTCAddress = async (assetArray, envName) => {
    const btcAddress = process.env[`BTC_ADDRESS_${envName}`]
    if (btcAddress == "") return;

    const { pairPrice: btcPrice, pairPriceChange: btcPriceChange } = await getPairPriceOnBinance("BTCUSDT")

    await getBTCAssets(assetArray, btcAddress, btcPrice, btcPriceChange);
}


const getBTCAssets = async (assetArray, btcAddress, btcPrice, btcPriceChange) => {
    try {
        console.log("----------------------------- TRYING TO GET BTC PRICE AND BALANCE -------------------")
        const {
            data: btcAmount
        } = await axios.get(`${blockchainInfoAPIBalanceUrl}/${btcAddress}`)

        let btcBalance = (Number)(btcAmount) / 10 ** 8

        console.log("btc balance = ", btcBalance)
        console.log("btc price = ", btcPrice)
        console.log("btc value = ", (Number)(btcPrice) * (Number)(btcBalance))
        console.log("----------------------------- END TRYING TO GET BTC PRICE AND BALANCE -------------------")

        let assetObject = {
            name: "BTC",
            symbol: "BTC",
            quantity: (Number)(btcBalance).toFixed(2),
            currentPrice: (Number)(btcPrice),
            currentValue: (Number)(((Number)(btcPrice) * (Number)(btcBalance))).toFixed(2),
            priceChange24h: btcPriceChange,
            exchange: 'xexchange',
        }
        assetArray.push(assetObject)
    } catch (err) {
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

const getBitgetAssetPrice = async (envName, symbol) => {
    if(symbol == 'USDT') return {
        price: 1,
        change24h: 0
    };

    const apiKeyBitget = process.env[`API_KEY_BITGET_${envName}`];
    const apiSecretBitget = process.env[`API_SECRET_BITGET_${envName}`];

    const bitgetDomain = 'https://api.bitget.com';
    const url = '/api/v2/spot/market/tickers'
    timestamp = Date.now();

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

const getCurrentAssetsBitget = async (assetArray, envName) => {
    const apiKeyBitget = process.env[`API_KEY_BITGET_${envName}`];
    const apiSecretBitget = process.env[`API_SECRET_BITGET_${envName}`];


    const bitgetDomain = 'https://api.bitget.com';
    const url = '/api/v2/spot/account/assets';
    timestamp = Date.now();

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

        const promises = data.data.data.map(async (asset) => {
            const { price: assetPrice, change24h: priceChange24h } = await getBitgetAssetPrice(envName, asset.coin)
            console.log(assetPrice)

            let formattedPrice = -1;
            if (assetPrice > 10) {
                formattedPrice = (Number)(assetPrice).toFixed(2)
            } else {
                formattedPrice = (Number)(assetPrice)
            }
            let priceWith2Decimal = (Number)(assetPrice * asset.available).toFixed(2)
            console.log(`[bitget]->${asset.coin} => ${asset.available} and price = ${assetPrice} valuing = ${priceWith2Decimal}`);


            let assetObject = {
                name: asset.coin,
                symbol: asset.coin,
                quantity: asset.available,
                currentPrice: formattedPrice,
                currentValue: priceWith2Decimal,
                priceChange24h: priceChange24h,
                exchange: 'bitget',
            }

            assetArray.push(assetObject)
        })

        await Promise.all(promises)
    } catch (err) {
        console.log(err.response.data);

    }
}

const getKucoinAssetPrice = async (envName, symbol) => {
    if(symbol == 'USDT') return {
        price: 1,
        change24h: 0
    };

    const bitgetDomain = 'https://api.kucoin.com';
    const url = '/api/v1/market/stats'

    try {

        const data = await axios.get(`${bitgetDomain}${url}?symbol=${symbol}-USDT`,
            {
            })

        return {
            price: (Number)(data.data.data.last),
            change24h: (Number)(data.data.data.changeRate * 100)
        }

    } catch (err) {
        console.log(err.response.data);

    }
}

const getCurrentAssetsKucoin = async (assetArray, envName) => {
    const apiKeyKucoin = process.env[`API_KEY_KUCOIN_${envName}`];
    const apiSecretKucoin = process.env[`API_SECRET_KUCOIN_${envName}`];

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
        
        const promises = data.data.data.map(async (asset) => {
            const { price: assetPrice, change24h: priceChange24h } = await getKucoinAssetPrice(envName, asset.currency)
            console.log(assetPrice)

            let formattedPrice = -1;
            if (assetPrice > 10) {
                formattedPrice = (Number)(assetPrice).toFixed(2)
            } else {
                formattedPrice = (Number)(assetPrice)
            }
            let priceWith2Decimal = (Number)(assetPrice * asset.available).toFixed(2)
            console.log(`[bitget]->${asset.coin} => ${asset.available} and price = ${assetPrice} valuing = ${priceWith2Decimal}`);


            let assetObject = {
                name: asset.currency,
                symbol: asset.currency,
                quantity: asset.available,
                currentPrice: formattedPrice,
                currentValue: priceWith2Decimal,
                priceChange24h: priceChange24h,
                exchange: 'kucoin',
            }

            if(priceWith2Decimal > 0.1) {
                assetArray.push(assetObject)
            }
        })

        await Promise.all(promises)
    } catch (err) {
        console.log(err);

        // console.log(err.response.data);
    }
}




const getAllCurrentAssets = async (req, res) => {
    console.log("----------------------------------------")
    console.log("pulling userApiMap")
    console.log("----------------------------------------")
    const { userId } = req.params
    console.log("----------------------------------------")
    console.log(userId)
    console.log("----------------------------------------")

    let envObject = await UserApiMap.findOne({ userId: userId })
    console.log("----------------------------------------")
    console.log(envObject)
    console.log("----------------------------------------")
    let assetArray = []

    let promises = []
    // promises.push(getCurrentAssetsByTimeBybit(assetArray, envObject.name))

    promises.push(getCurrentAssetsBitget(assetArray, envObject.name))
    promises.push(getCurrentAssetsByTimeBinance(assetArray, envObject.name))
    promises.push(getCurrentAssetsXExchange(assetArray, envObject.name))
    promises.push(getCurrentAssetsByETHAddress(assetArray, envObject.name))
    promises.push(getCurrentAssetsByBTCAddress(assetArray, envObject.name))
    promises.push(getCurrentAssetsKucoin(assetArray, envObject.name))

    console.log(promises)

    await Promise.all(promises)

    console.log("this is assetArray");
    console.log(assetArray);

    assetArray.sort((a, b) => b.currentValue - a.currentValue)
    res.status(200).json(assetArray);
}

const getSingleCurrentAssets = async (req, res) => {

    // ADD HERE THE CHANGES THAT WERE MADE IN THE ABOVE FUNCTION -> function param

    const { symbol, userId } = req.params
    assetArray = []
    // await getCurrentAssetsByTimeBybit()
    // await getCurrentAssetsByTimeBinance()

    console.log("this is assetArray");
    console.log(assetArray);

    const filteredArray = assetArray.filter(asset => asset.symbol == symbol)
    res.status(200).json(filteredArray);
}

module.exports = {
    getCurrentAssetsByTimeBybit,
    getCurrentAssetsByTimeBinance,
    getCurrentAssetsXExchange,
    getCurrentAssetsByETHAddress,
    getCurrentAssetsByBTCAddress,
    getCurrentAssetsBitget,
    getCurrentAssetsKucoin,
    getAllCurrentAssets,
    getSingleCurrentAssets
}