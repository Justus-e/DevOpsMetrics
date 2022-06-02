require('dotenv').config()

const express = require('express');
const cors = require('cors');
const auth = require('./auth');
const influx = require('./influx')


const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());
app.options('/api*', cors());
app.use('/api/*', auth());

//----------------------------------------------------------------------------------------------------------------------

const ENDPOINT = './endpoints/'

app.get('/', (_req, res) => {
    res.send('DevOpsMetrics Api is Running');
});
app.use(require(ENDPOINT + 'swagger'));

influx.writeDeployEvent()

influx.flush()

influx.queryDeployEvents()

//----------------------------------------------------------------------------------------------------------------------

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('server running at port: ' + port);
    if (!process.env.PORT) {
        console.log("Root: http://localhost:3000/");
        console.log("Docs: http://localhost:3000/swagger");
    }
});

