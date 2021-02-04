const orderAction = require('../actions/orderAction')

const OrderRoute = function (app){
    this.app = app;
    this.orderActionInstance = new orderAction(app);
}

OrderRoute.prototype.init = function(){

    this.app.get("/",(request,response) => {
        response.send({"test":"OK"})
    })
    this.app.post("/order/creation",(req,res)=>{
        console.log(new Date(),`Input for Order Creation`,req.body)
        return this.orderActionInstance.orderCreation(req.body)
            .then((response)=>{
                console.log(new Date(),`Response for Order Creation`,response)
                res.send(response);
            })
            .catch((e)=>{
                console.log(`Error In Order Creation`,e)
                res.send(e)
            })
    })
    this.app.put("/order/cancellation",(req,res)=>{
        console.log(new Date(),`Input for the Order Cancellation`,req.body)
        return this.orderActionInstance.orderCancellation(req.body)
            .then((response)=>{
                console.log(new Date(),`Response for Order Cancellation`,response)
                res.send(response);
            })
            .catch((e)=>{
                console.log(`Error In Order Cancellation`,e)
                res.send(e)
            })
    })
    this.app.put("/order/updation",(req,res)=>{
        console.log(new Date(),`Input for the Order Updation`,req.body);
        return this.orderActionInstance.orderUpdation(req.body)
            .then((response)=>{
                console.log(new Date(),`Response for Order Updation`,response)
                res.send(response);
            })
            .catch((e)=>{
                console.log(`Error In Order Updation`,e)
                res.send(e)
            })
    })
    this.app.get("/order/list",(req,res)=>{
        console.log(new Date(),`Input for the Order List`,req.query);
        this.orderActionInstance.orderList(req.query)
            .then((response)=>{
                console.log(new Date(),`Response for Customers Orders`,response)
                res.send(response);
            })
            .catch((e)=>{
                console.log(`Error In  Customers Orders`,e)
                res.send(e)
            })
    })

    // Create an API to list purchased Product based on Customer
    this.app.get("/orders",(req,res)=>{
        console.log(new Date(),`Input for the Order List`,req.query);
        this.orderActionInstance.orders(req.query)
            .then((response)=>{
                console.log(new Date(),`Response for customer Order`,response)
                res.send(response);
            })
            .catch((e)=>{
                console.log(`Error In customer Order`,e)
                res.send(e)
            })
    })

    this.app.get("/order/countByDate",(req,res)=>{
        console.log(new Date(),`Input for the count of order by Date`,req.query);
        this.orderActionInstance.orderbyCount(req.query)
            .then((response)=>{
                console.log(new Date(),`Response for Order COunt By Date`,response)
                res.send(response);
            })
            .catch((e)=>{
                console.log(`Error In Order COunt By Date`,e)
                res.send(e)
            })
    })
}
module.exports = OrderRoute;