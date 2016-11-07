// app/models/items.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var itemSchema = mongoose.Schema({
    id          : Number,
    name        : String,
    username    :String,
    category    : String,
    //category    : {
        //book         : Boolean,
        //cycle        : Boolean,   
        //mattress     : Boolean,
    //},
    description : String
});

// methods ======================
// create the model for users and expose it to our app
module.exports = mongoose.model('Item', itemSchema);
