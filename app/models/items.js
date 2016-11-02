// app/models/items.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var itemSchema = mongoose.Schema({

    id          : Number,
    name        : String,
    category    : String,
    //category    : {
        //book         : Boolean,
        //cycle        : Boolean,
        //mattress     : Boolean,
    //},
    description : String

});

// methods ======================
// generating a hash
itemSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
itemSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('Item', itemSchema);
