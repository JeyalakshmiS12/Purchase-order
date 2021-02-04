

const mongoose = require('mongoose');
const  lookupSchema = mongoose.Schema({
    type: String,
    id: Number
})
const lookupModel = mongoose.model('lookup',lookupSchema)
module.exports = lookupModel;