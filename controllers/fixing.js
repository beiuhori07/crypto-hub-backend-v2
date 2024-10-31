
const AssetsByTime = require('../models/Assets-By-Time')
const AssetsChartEntries = require('../models/Assets-Chart-Entries')
const UserApiMap = require('../models/User-Api-Map')

const fixNoPriceIssue = async (req, res) => {

    for (let j = 0; j < 20; j++) {
        let assets = await AssetsByTime.find({ userId: "63bc9df2d3c8f375e8ab299e", name: "EGLD staked rewards" })


        let reducedAssets = reduceArray1h(assets).reducedArray
        // console.log(reducedAssets)

        let zeroAssets = []
        let count = 0;
        let btcCount = 0;
        // for (let i = 1; i < reducedAssets.length; i++) {
        for (let i = 1; i < assets.length; i++) {


            /*
            let extra = reducedAssets[i - 1].assets.filter(asset => asset.exchange == 'xexchange' && asset.name == 'BTC')
            if(extra.length > 1) {
                console.log("------> trying to delete")
                // await AssetsByTime.findByIdAndDelete(extra[0]._id)
            }
    
            if (reducedAssets[i].totalValue < reducedAssets[i - 1].totalValue - 300) {
                count++;
    
                let filtered = reducedAssets[i].assets.filter(asset => asset.exchange == 'xexchange' && asset.name == 'BTC')
                let filtered2 = reducedAssets[i - 1].assets.filter(asset => asset.exchange == 'xexchange' && asset.name == 'BTC')
    
                console.log('current')
                console.log(filtered)
                console.log('prev')
                console.log(filtered2)
    
                if(filtered2.length > 1) {
                    console.log("------> trying to delete")
                    // await AssetsByTime.findByIdAndDelete(filtered2[0]._id)
                }
    
                if(filtered.length == 0 && filtered2.length != 0) {
                    btcCount++;
                   
    
                    let obj = filtered2[0]
                    obj.time = reducedAssets[i].assets[0].time
                    obj.date = reducedAssets[i].assets[0].date
    
                    const { _id, __v, ...newObject } = obj._doc;
    
                    console.log("object to create")
                    console.log(newObject)
    
                    // await AssetsByTime.create(newObject)
    
                }
                */

            if (assets[i].currentPrice < 0.1) {
                count++;


                // console.log("prev--> ")
                // console.log(assets[i - 1])

                // console.log("current")
                // console.log(assets[i])
                // console.log(reducedAssets[i])


                // let doc = await AssetsByTime.findById(assets[i]._id)
                // console.log("doc ")
                // console.log(doc)
                // doc.currentPrice = assets[i - 1].currentPrice
                // doc.currentValue = assets[i - 1].currentValue

                // doc.save()

                // await AssetsByTime.findOneAndUpdate({ _id: assets[i]._id },
                //     {
                //         $set: {
                //             currentPrice: assets[i - 1].currentPrice,
                //             currentValue: assets[i - 1].currentValue
                //         }
                //     })

            }
        }

        // console.log(assets)
        // console.log(assets.length)
        console.log(count)
        // console.log(btcCount)
    }

    res.status(200).json("good")
}


const reduceArray1h = (assetsArray) => {
    if (assetsArray.length == 0) {
        return {
            reducedArray: [],
            labels: []
        }
    }
    let reducedArray = []
    let labels = []
    let symbols = [assetsArray[0].symbol]
    let assets = [assetsArray[0]]
    let sum = assetsArray[0].currentValue;
    let ok = 0
    for (let i = 0; i < assetsArray.length - 1; i++) {
        if ((assetsArray[i].time.dayOfYear == assetsArray[i + 1].time.dayOfYear) && (assetsArray[i].time.hour == assetsArray[i + 1].time.hour)) { // add year
            sum = sum + assetsArray[i + 1].currentValue
            symbols = [...symbols, assetsArray[i + 1].symbol]
            assets = [...assets, assetsArray[i + 1]]
            ok = 1
        } else {
            if (ok == 0) {
                sum = assetsArray[i].currentValue
                symbols = [assetsArray[i].symbol]
                assets = [assetsArray[i]]
            }
            let object = {
                symbols: symbols,
                assets: assets,
                time: assetsArray[i].time,
                totalValue: sum
            }
            labels = [...labels, `${assetsArray[i].time.year % 100}/${assetsArray[i].time.dayOfMonth}/${assetsArray[i].time.month}-${assetsArray[i].time.hour}`]
            reducedArray = [...reducedArray, object]
            sum = assetsArray[i + 1].currentValue
            symbols = [assetsArray[i + 1].symbol]
            assets = [assetsArray[i + 1]]
            ok = 0
            // console.log('brooooooo')
        }
    }
    if (ok == 0) {
        let object = {
            symbols: [assetsArray[assetsArray.length - 1].symbol],
            assets: [assetsArray[assetsArray.length - 1]],
            time: assetsArray[assetsArray.length - 1].time,
            totalValue: assetsArray[assetsArray.length - 1].currentValue
        }
        labels = [...labels, `${assetsArray[assetsArray.length - 1].time.year % 100}/${assetsArray[assetsArray.length - 1].time.dayOfMonth}/${assetsArray[assetsArray.length - 1].time.month}-${assetsArray[assetsArray.length - 1].time.hour}`]
        reducedArray = [...reducedArray, object]
    } else {
        let object = {
            symbols: symbols,
            assets: assets,
            time: assetsArray[assetsArray.length - 1].time,
            totalValue: sum
        }
        labels = [...labels, `${assetsArray[assetsArray.length - 1].time.year % 100}/${assetsArray[assetsArray.length - 1].time.dayOfMonth}/${assetsArray[assetsArray.length - 1].time.month}-${assetsArray[assetsArray.length - 1].time.hour}`]
        reducedArray = [...reducedArray, object]
    }
    return { reducedArray: reducedArray, labels: labels };
}


const saveChartEntries =  async (req, res) => {

    // needs to be done on each user
    const userApiMap = await UserApiMap.find({name: 'hori'})
    userApiMap.forEach(async (user) => {
        let assets = await AssetsByTime.find({ userId: user.userId})

        assets.sort((a, b) => a.date - b.date)

        const { reducedArray, labels } = reduceArray1h(assets);

        const totalValues = reducedArray.map(entry => entry.totalValue)

        console.log(totalValues.length)
        console.log(labels.length)
        
        for(let i = 0; i < totalValues.length; i++) {
            await AssetsChartEntries.create({
                userId: user.userId,
                label: labels[i],
                totalValue: totalValues[i]
            })
        }

    })


    res.status(200).json("good")
}






module.exports = { 
    fixNoPriceIssue,
    saveChartEntries
}