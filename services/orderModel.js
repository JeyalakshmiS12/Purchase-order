

const mongoose = require('mongoose');
const  orderSchema = mongoose.Schema({
    customerName : String,
    email : String,
    productName : String,
    productBrand: String,
    productModel: String,
    customerId : String,
    productId: String,
    orderState:String,
    orderedTime: Number,
    orderId: String,
    cancelledTime: Number,
    updated:String,
    updatedTime: Number,
    productColor: String
})
const orderModel = mongoose.model('purchaseOrder',orderSchema)
module.exports = orderModel;