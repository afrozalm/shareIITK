// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var Schema   = mongoose.Schema;

var itemSchema = new Schema({

    name        : { type: String, required: true  },                                    // item name
    username    : { type : mongoose.Schema.Types.ObjectId, ref: userSchema  },          // owner name
	category    : { type: String, required: true  },                                    // category
    request_notification : { type : mongoose.Schema.Types.ObjectId, default: null },    // id of user which requested this item
	requester_name       : { type : String, default : null },

	item_status : Number, // 0 for delete, 1 for invisible, 2 for visible
	//category    : {
		//book		 : Boolean,
		//cycle        : Boolean,
		//mattress     : Boolean
	//},
    description : String
});

// define the schema for our user model
var userSchema = new Schema({

    local           : {
        name            : { type: String, required: true  }, 
        email           : { type: String, required: true  },
        password        : { type: String, required: true  },
    },
    google          : {
        id              : String,
        token           : String,
        email           : String,
        name            : String
    },
	notification : {type: String, default: null},
	itemList        : [itemSchema]
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

userSchema.methods.getItemsByCategory = function( category ) {
    matchingList = [];
    for ( var i = 0; i < this.itemList.length; i++ ){
        if ( category.localCompare( this.itemList[i].category ) == 0 )
            matchingList.push(this.itemList[i]);
    }

    return matchingList;
}
// create the model for users and expose it to our app
module.exports = {User: mongoose.model('User', userSchema),
                  Item: mongoose.model('Item', itemSchema)};
