const mongoose = require('mongoose');
const mongodb = "mongodb://localhost:27017/CustomerProductManagement"
mongoose.connect(mongodb,{useNewUrlParser :true,useUnifiedTopology: true})
const connection = mongoose.connection
mongoose.set('useFindAndModify',false)

const orderModel = require('./orderModel')
const lookupModel = require('./lookupModel')



connection.once('open',()=>{
    console.log(`Mongo Instance Connected Successully`)})

connection.on('error', ()=> {
    console.error.bind(console, 'MongoDB connection error:')});

const OrderService = function (app){
    this.app = app;
}

OrderService.prototype.orderCreation = function(input){

    console.log("Input for the OrderCreation",input)
    if(input){

        // let orderObj = {
        //     customerId:input.customerId,
        //     productId:input.productId,
        //     orderState : "ORDERED",
        //     orderedTime : new Date().getTime(),
        // }

        input['orderState'] = "ORDERED";
        input['orderedTime'] = new Date().getTime();
        return lookupModel.findOne({"type":"ORDER"})
            .then((res)=>{
                // orderObj.orderId ="ORD"+res.id;
                input.orderId ="ORD"+res.id;
                let orderModelInstance = new orderModel(input)
                return lookupModel.findOneAndUpdate({"type":"ORDER"},{$inc:{id:1}},{new:true})
                    .then((updatedResult)=>{
                        return orderModelInstance.save()
                    })
                    .then((response)=>{
                        console.log("response",response);
                        return response;
                    })
                    .catch((err) =>{return err})
            })
    } else{
        return input
    }


}
OrderService.prototype.orderCancellation = function(input){

    console.log("Input for the order cancellation",input)
    // let cancellation = false;
    if(input){
        let query = {
            productName: input.productName,
            customerId:input.customerId,
            productModel:input.productModel,
            productBrand:input.productBrand,
            productColor:input.productColor
        }

        input['orderState'] = "CANCELLED";
        input['cancelledTime'] = new Date().getTime();
        let orderModelInstance = new orderModel(input)
        return orderModel.find(query,{}).sort({_id:-1})
            .then((findResult)=>{
                if(findResult && findResult.length>0){
                    return orderModel.findOneAndUpdate({_id:findResult[0]._id},{$set:input},{upsert:true})
                } else{
                    return findResult;
                }

            })
            .then((response)=>{
                // if(response){
                    response.cancellation = true;
                    console.log(response,"Response");
                    return response;
                // }
                // return response
            })
            .catch((e)=>{
                console.log(e)
                return e;
            })

    } else{
        return input
    }


}
OrderService.prototype.orderDetails = function(input){

    console.log("Input for the order Details",input)
    // let cancellation = false;
    if(input){

        return orderModel.find({customerId:input.customerId,productModel:input.productModel,orderState:"ORDERED"},{_id:0,__v:0}).sort({_id:-1})
            .then((findResult)=>{
                console.log("Order Information",findResult[0])
                return findResult[0];
            })
            .catch((e)=>{
                return e
            })


    } else{
        return input
    }


}
OrderService.prototype.orderUpdation = function (input){
    console.log("Order Updation",input)

    if(input){
        let updateObj ={
            "updated":true,
            "updatedTime" : new Date().getTime()
        }
        return orderModel.findOneAndUpdate({customerId:input.customerId,orderId:input.orderId},{$set:{"updated":true, "updatedTime" : new Date().getTime()}},{new:true})
            .then((response)=>{
                response.update = true;
                console.log("res",response)
                return response;
            })
    }else{
        return null;
    }


}
OrderService.prototype.orderList = function (input){

        if(input && input.length >0){
            return new Promise((resolve,reject)=>{
              return orderIteration(input)
                  .then((customerOrderRes)=>{
                        console.log("customerOrderRes",JSON.stringify(customerOrderRes));
                        resolve(customerOrderRes)
                  })
                  .catch((e)=>{
                      console.log("Error in Customers Order List Call",e)
                      reject(e)
                  })
            })
        } else{
            return null
        }
}
async function orderIteration(input){
    let orderObject = {
        orderCount :0,
        orderObj :[]
    }
    const response =[]
    let promises = input.map(function(id){
        return orderModel.find({customerId:id},{productModel:1,productBrand:1,productModel:1,_id:0,orderedTime:1})
            .then((res)=>{
                // console.log("res",res)
                if(res && res.length>0){
                    let orderObject = {
                        orderCount :0,
                        orderObj :[]
                    }
                    orderObject['customerId']=id
                    orderObject['orderCount']=res.length
                    orderObject['orderObj']=res
                    response.push(orderObject)
                }
                return orderObject;
            })

    })
    let orderResult = await Promise.all(promises)
    return response;
}

OrderService.prototype.orders = function(input){

    let query ={
        customerId:input.customerId,orderState:"ORDERED"
    };
    let sortInput ={}
    if(input && input.searchFor && input.searchValue){
        query[input.searchFor]= input.searchValue
    }
    if(input.sortBy){
         sortInput[input.sortBy] = 1
    }
   return orderModel.find(query,{_id:0,__v:0,productId:0,customerId:0,orderId:0,email:0,customerName:0,orderState:0}).sort(sortInput)
       .then((orderResult)=>{
           console.log("orderResult",orderResult)
           return orderResult;
       })
}
OrderService.prototype.orderCountbyDate = function(input){

   return orderModel.find({orderedTime:{$gt:input.startTimeMillis,$lte:input.endTimeMillis},orderState:"ORDERED"})
       .then((orderResult)=>{
           console.log("Order Count for Particular Date",orderResult.length)
           return orderResult;
       })
}

module.exports = OrderService;