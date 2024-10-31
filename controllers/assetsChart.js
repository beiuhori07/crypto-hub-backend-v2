const AssetsChartEntries = require("../models/Assets-Chart-Entries")


// TODO :  take in consideration years!!!


const getChartEntries = async (req, res) => {
    const { userId } = req.params

    let chartEntries = await AssetsChartEntries.find({
        userId: userId
    })

    chartEntries = chartEntries.map(entry => {
        return {
            totalValue: entry.totalValue,
            label: entry.label
        }
    })

    res.status(200).json(chartEntries)
}

module.exports = getChartEntries