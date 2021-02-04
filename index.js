const express = require('express');
const bodyParser = require('body-parser');
const app =express()
app.use(bodyParser.json());
const config = require('./conf')


const orderRoute = require('./routes/orderRoute')
const orderRouteInstance = new orderRoute(app);
orderRouteInstance.init();

app.listen(config.api.port, ()=>{
    console.log(new Date(),`Server is Listening on Port: ${config.api.port}`)
})