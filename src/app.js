const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors())
app.options('/api*', cors())

//----------------------------------------------------------------------------------------------------------------------

const ENDPOINT = './endpoints/'

app.get('/', (_req, res) => {
    res.send('DevOpsMetrics Api is Running');
});
app.use(require(ENDPOINT + 'swagger'));

//----------------------------------------------------------------------------------------------------------------------

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('server running at port: ' + port);
    if (!process.env.PORT) {
        console.log("Root: http://localhost:3000/");
        console.log("Docs: http://localhost:3000/api-docs");
    }
});

