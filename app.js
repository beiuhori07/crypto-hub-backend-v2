require('dotenv').config();
require('express-async-errors');
const express = require('express')
const app = express();
const connectDB = require('./db/connect')
const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit')
const { wakeDyno } = require('heroku-keep-awake');

const DYNO_URL = 'https://crypto-hub-api.herokuapp.com';
const opts = {
    interval: 10,
    logging: true,
    stopTimes: { start: '01:05', end: '01:06' }
}


const { hourlyJob: hourlyJobAssetsByTime } = require('./controllers/assetsByTime')
const { hourlyJob: hourlyJobClosedTrades } = require('./controllers/closedTrades')

// const User =   require('./models/User')


// router
const authRouter = require('./routes/auth-route')
const assetsByTimeRouter = require('./routes/assetsByTime-route')
const assetCurrentRouter = require('./routes/assetsCurrent-route')
const closedTradesRouter = require('./routes/closedTrades-route')
const generalInfoRouter = require('./routes/generalInfo-route')
const fixingRouter = require('./routes/fixing-route')
const assetsChartRouter = require('./routes/assetsChartEntries-route')

// error handler
const authenticateUser = require('./middleware/authentication')
const errorHandlerMiddleware = require('./middleware/error-handler')
const notFoundMiddleware = require('./middleware/not-found')


var CronJob = require('cron').CronJob;
var AssetsEveryHour = new CronJob(
	'10 * * * *',
	async () => await hourlyJobAssetsByTime(),
	null,
    false,
    'America/Los_Angeles'
);

var ClosedTradesEveryHour = new CronJob(
	'0 * * * *',
	async () => await hourlyJobClosedTrades(),
	null,
    false,
    'America/Los_Angeles'
);

var PingToKeepServerUp = new CronJob(
	'*/10 * * * *',
	() => {
        console.log('ping, brudda...')
    },
	null,
    false,
    'America/Los_Angeles'
);


app.set('trust proxy', 1) // need to be set if you are behind a reverse proxy
app.use(rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 min 
    max: 1000
}))
app.use(express.json())
app.use(helmet())
app.use(cors())
app.use(xss())


app.get('/', (req, res) => 
    res.send('crypto api')   
)
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/assetsByTime', authenticateUser, assetsByTimeRouter)
app.use('/api/v1/assetsCurrent', authenticateUser, assetCurrentRouter)
app.use('/api/v1/closedTrades', authenticateUser, closedTradesRouter)
app.use('/api/v1/generalInfo', authenticateUser, generalInfoRouter)
app.use('/api/v1/assetsChart', authenticateUser, assetsChartRouter)
app.use('/fixing', fixingRouter)

app.use(errorHandlerMiddleware)
app.use(notFoundMiddleware)

const port = process.env.PORT || 3000;
const start = async () => {
    try {
        // connect to db
        await connectDB(process.env.MONGO_URI)


        app.listen(port, async () => {
            console.log(`server is listening on port ${port}...`)

            wakeDyno(DYNO_URL, opts);
            

            // hourlyJobAssetsByTime()
            // hourlyJobClosedTrades() //------------------------------- DONT FORGET TO REMOVE THIS IN ANOTHER
            // hour()x

            ClosedTradesEveryHour.start()
            AssetsEveryHour.start()
            PingToKeepServerUp.start()
        })

    } catch (error) {
        console.log(error);
    }
}

start();
