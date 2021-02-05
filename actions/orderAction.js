const orderService = require('../services/orderService')
let config = require('../conf');
const requestPromise = require('request-promise');
const moment = require('moment');

const OrderAction = function (app){
    this.app = app;
    this.orderServiceInstance = new orderService(app);
};
OrderAction.prototype.orderCreation = function (input){

    let productData = {
        "productName":input.productName,
        "productModel": input.productModel,
        "productColor": input.productColor,
        "productBrand":input.productBrand
    }
    let response = {
        status: "FAILURE",
        data:{},
        err:{}
    }
    return new Promise((resolve,reject)=>{
        let options = {
            method: 'GET',
            qs: productData,
            uri: config.productServiceUrl,
            json: true // Automatically stringifies the body to JSON
        }
        return requestPromise(options)
            .then((productResponse)=>{
                if(productResponse){
                    console.log("productResponse",productResponse.status)
                    let productId = productResponse.data.product ? productResponse.data.product.productId ? productResponse.data.product.productId: null :null
                    input['productId'] = productId;
                    return this.orderServiceInstance.orderCreation(input)
                        .then((result)=>{
                              if(result){
                                    response['status'] ="SUCCESS"
                                    response['data'] ="Order Created Successfully";
                              }
                              else{
                                  response['data']['message'] ="Order IS NOT Created ";
                              }
                              resolve(response)
                        })
                }
                else{
                    response['data']['message'] ="Order IS NOT Created ";
                    return response;
                }

            })
            .catch((e)=>{
                console.log("Error in Order Creation",e)
                reject(e);
            })

    })
}
OrderAction.prototype.orderCancellation = function (input){

    let response = {
        status: "FAILURE",
        data:{},
        err:{}
    }
    return new Promise((resolve,reject)=>{

        return this.orderServiceInstance.orderCancellation(input)
            .then((cancellationResult)=>{
                if(cancellationResult && cancellationResult.cancellation){
                    response['status'] ="SUCCESS"
                    response['data'] ="Order Cancelled Successfully";
                }
                else{
                    response['data']['message'] = "Customer Doesn't have this Order";
                }
                resolve(response);
            })

            .catch((e)=>{
                console.log("Error in Order Cancellation",e)
                reject(e);
            })

    })
}
OrderAction.prototype.orderUpdation = function (input){

    let response = {
        status: "FAILURE",
        data:{},
        err:{}
    }
    return new Promise((resolve,reject)=>{

        return this.orderServiceInstance.orderDetails(input)

            .then((orderResponse) =>{
                console.log("orderResponse",orderResponse);
                if(orderResponse && orderResponse.productColor){
                    // let color= productResponse.data.product.productColor;
                    // console.log("Color",color);
                    input['orderId']= orderResponse.orderId;
                    if(input.productColor === orderResponse.productColor ){

                        response['status'] ="SUCCESS"
                        response['data'] ="Already Have the same Order";
                        resolve(response)
                    }
                    else{
                        let inputData = {
                            productColor: input.productColor,
                            productName:input.productName,
                            productBrand:input.productBrand,
                            productModel:input.productModel}

                        let options = {
                            method: 'GET',
                            qs: inputData,
                            uri: config.productServiceUrl,
                            json: true // Automatically stringifies the body to JSON
                        }
                        return requestPromise(options)
                            .then((result)=>{
                                console.log("result",result)
                                if(result && result.status === "SUCCESS"){
                                    input['productId'] = result.data.product.productId
                                    return this.orderServiceInstance.orderUpdation(input)
                                }else{
                                    return null
                                }

                            })
                            .then((updationResponse)=>{

                                if(updationResponse){
                                    response['status'] ="SUCCESS"
                                    response['data'] ="Order be updated";                            }
                                else{
                                    response['status'] ="Failure"
                                    response['data'] ="Order Is not updated";
                                }
                                resolve(response)
                            })
                    }

                }
            })

            .catch((e)=>{
                response['err']['message'] =e;
                reject(response)
            })

    })
}

OrderAction.prototype.orderList = function (input){

    let response = {
        status: "FAILURE",
        data:{},
        err:{}
    }

    return new Promise((resolve,reject)=>{
        this.orderServiceInstance.orderList(input.customerId)
            .then((result)=>{
                response['status'] ="SUCCESS";
                if(result && result.length>0){
                    response['data']['orders'] = result;
                    response['data']['messages'] = "Customers Purchased Orders";
                } else{
                    response['data']['messages'] = "Customers doesn't have Orders";
                }
                resolve(response)
            })
            .catch((e)=>{
                console.log("Error in Customer Order List",e)
                reject(e);
            })
    })
}

OrderAction.prototype.orders = function (input){
    let response = {
        status: "FAILURE",
        data:{},
        err:{}
    }
    console.log("Input for Order Result",input)
    return new Promise((resolve,reject)=>{
       return this.orderServiceInstance.orders(input)
            .then((result)=>{
                if(result && result.length >0){
                    response['status'] ="SUCCESS";
                    response['data']['orders'] = result;
                    response['data']['message'] = "Customer Purchased Order";
                }
                else{
                    response['status'] ="SUCCESS";
                    response['data']['orders'] = [];
                    response['data']['message'] = "Customer Doesn't Purchase Anything";
                }
                resolve(response)
            })
           .catch((e)=>{
               response['err']['message'] = e;
               reject(response)
           })

    })

}

OrderAction.prototype.orderbyCount = function(input){
    let response = {
        status: "FAILURE",
        data:{},
        err:{}
    }
    return new Promise((resolve,reject)=>{
        if(input && input.from && input.to){
            return this.timeConversion(input)
                .then((timeResponse)=>{
                    console.log("time Response",timeResponse)
                    return this.orderServiceInstance.orderCountbyDate(timeResponse)
                })
                .then((countRes)=>{
                    if(countRes && countRes.length>0){
                        response['status'] = "SUCCESS";
                        response['data']['from']= input.from;
                        response['data']['to']= input.to;
                        response['data']['OrderedCount']= countRes.length;
                        response['data']['message']="Order Count by date";
                    }
                    else{
                        response['data']['message']="No Order for particular Date";
                    }
                    resolve(response)
                })
        }
        else{
            response['data']['message']="No Date is in Input"
            resolve(response)
        }
    })


}

OrderAction.prototype.timeConversion = function (input){
    let timeMillis ={}
    if(input && input.from && input.to){
        return new Promise((resolve,reject)=>{
            let startTimeMillis= new Date(input.from).setHours(0,0,0)
            let endTimeMillis = new Date(input.to).setHours(23,59,59)
            timeMillis['startTimeMillis'] = startTimeMillis
            timeMillis['endTimeMillis'] = endTimeMillis;
            resolve(timeMillis) ;
        })
    }
    else{
        return timeMillis;
    }

}

module.exports = OrderAction;