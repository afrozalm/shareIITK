// app/routes.js
//var Item = require('../app/models/items.js');
var UserSchema_complete = require('../app/models/user.js');
var UserSchema = UserSchema_complete.User;
var Item = UserSchema_complete.Item;
var dialog = require('dialog');

module.exports = function(app, passport) {

	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
        if ( req.user == null ){
            res.render('index.ejs', { message: req.flash('loginMessage'), home : 1 });
        }
        else
            res.render('profile.ejs', { user : req.user });
	});

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	//app.get('/login', function(req, res) {
        
         //render the page and pass in any flash data if it exists
        //res.render('login.ejs', { message: req.flash('loginMessage') });
	//});

	// process the login form
    app.post('/', function(req, res, next){
        if ( req.body.action == 0 )
            res.render('index.ejs', { message: req.flash('loginMessage'), home : 0 });
    });

    app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/', // redirect to the secure profile section
            failureRedirect : '/', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
    }));

    // =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// PROFILE SECTION =====================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res) {
        if ( req.user == null ){
            res.render('login.ejs', { message: req.flash('loginMessage') });
        }
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
	});

// LOGOUT ==============================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	// =====================================
	// ACCEPT SECTION ======================
	// =====================================
	// this section holds the required things to be done while accepting a request
		//console.log("mera user");
        //console.log(req.user._id);
		//var item_id = req.body.request_button_itemid;
         app.post('/accept', function(req, res){
        
		var Requester = req.body.User_Requested;
	   Item.findById(req.body.itemID,function(err,item){
		   if(err)
				console.log(err);
			UserSchema.findById(Requester, function(err,requester)
			{
                {
                    requester.notification.push( "Sorry your request for the item \"" + item.name + "\" has been rejected." ); 
                    requester.save();
                }
				requester.save();
			})
		});

		console.log(req.body.itemID);
        Item.findByIdAndUpdate(req.body.itemID,{
            item_status : 0
        }, function(err){
            if (err){
                console.log('cannout update item db');
                throw err;
            }
        });

        req.user.itemList.filter( function(a){
            if ( a.id == req.body.itemID ){
                a.item_status = 0;
                a.save();
            }
        } );
        req.user.save();
        res.render('profile.ejs',{user: req.user});
    });
	// =====================================
	// DELETE SECTION ======================
	// =====================================
	// this section holds the required things to be done while accepting a request
    app.post('/delete', function(req, res ){
        var owner_id = req.body.request_button_ownerid;
        var item_id = req.body.request_button_itemid;
    	Item.findByIdAndRemove(item_id,function(err,item){
			if(err)
				console.log(err);
			//console.log("HERE2");
		});

        Item.findByIdAndRemove(item_id);
		UserSchema.findOneAndUpdate({'_id' : owner_id},
                    {$pull: {itemList: {'_id': item_id}}},
                    {new: true},
					function(err, a) {
						if (err)
							console.log(err);
					});	
		res.redirect('/profile');
    });

    app.post('/clearall', function(req, res){
        UserSchema.findById(req.user, function(err, user){
           if(err)
                console.log(err);
            while(user.notification.length > 0) {
                    user.notification.pop();
            }
            user.save();
        });
        res.redirect('/');
    });

// SEARCH ===============================
	// show the search form
	app.get('/search', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('search.ejs', { message: req.flash('loginMessage') });
	});

    app.post('/search',function(req,res){ 
			var keyword = require('string');
			keyword = req.body.search;
			Item.find().or([{
			'name': { '$regex' : new RegExp(keyword, "i")}},
			{'description' : {'$regex' : new RegExp(keyword, "i")}}]).exec(

			function(err, itemList){
				console.log("Printing");
				if(err) throw err;
				res.render('searchFound.ejs', {itemList: itemList, user: req.user});
			});
//app.User.find().or([{ 'firstName': { $regex: re }}, { 'lastName': { $regex: re }}]).sort('title', 1).exec(function(err, users) {
    //res.json(JSON.stringify(users));
//});
		//var query = UserSchema.find({'itemList.name' : req.body.search});
		//query.select("itemList").populate("itemList");
		//query.exec(function(err,results){
			//console.log(results);
			//var itemList = results.map(function(r){	res.render('searchFound.ejs', {userList: r.itemList, user: req.user});});
		//console.log(itemList);
			//});
});

// INSERT  ===============================
	app.get('/insert', function(req, res) {
		// render the page and pass in any flash data if it exists
        res.render('insert.ejs', { message: req.flash('loginMessage'), user: req.user });
	});

    app.post('/insert',function(req,res){
        try { 
            var name=req.user.local.name;
        }
        catch(err) {
            name=req.user.google.name;
        }

        var newItem = new Item({
            name: req.body.name,
            username: req.user._id,
			category: req.body.category,
            description: req.body.description,
			item_status: 2
        });   
		newItem.save();
        UserSchema.findByIdAndUpdate(
                req.user._id,
                {$push: {
                    "itemList": newItem
                }},
                function(err){
                    if (err) {
                        dialog.err('Please login to Continue','Login Error',function(err){throw err;});
                    };
                    res.render('newItem.ejs', { item: newItem })
                }
        );
    });
//=========REJECT=====================
    app.post('/reject', function(req, res ){
		var owner_id = req.body.request_button_ownerid;
		var Requester = req.body.User_Requested;
		//console.log("mera user");
        //console.log(req.user._id);
		var item_id = req.body.request_button_itemid;
           Item.findById(item_id,function(err,item){
               
                //console.log("HERE"+ item_id);
               if(err)
                    console.log(err);
                item.request_notification = null;
                item.requester_name = null;
                item_status = 2;
                UserSchema.findById(Requester, function(err,requester)
                {
                    requester.notification.push( "Sorry your request for the item \"" + item.name + "\" has been rejected." ); 
                    requester.save();
                })
                item.save();
            });
   
        UserSchema.findById(req.user._id,function(err,owner){

            for(var i=0;i<owner.itemList.length;i++){
                if(owner.itemList[i]._id==item_id){
                    owner.itemList[i].request_notification = null;
					owner.itemList[i].requester_name = null;
                    owner.itemList[i].item_status = 2;
					owner.itemList[i].save();
                    owner.save();
                }
            }
          	res.redirect('/profile');
        });
    });


//=========REQUEST=====================
    app.post('/request', function(req, res ){
        var owner_id = req.body.request_button_ownerid;
        var item_id = req.body.request_button_itemid;
			 
		Item.findById(item_id,function(err,item){
			item.request_notification = req.user._id;
			item.requester_name = req.user.local.name;
			item_status = 1;
			console.log("HERE");
			item.save();
		});

        UserSchema.findById(owner_id,function(err,owner){

            for(var i=0;i<owner.itemList.length;i++){
                if(owner.itemList[i]._id==item_id){
                    owner.itemList[i].request_notification = req.user._id;
					owner.itemList[i].requester_name = req.user.local.name;
					owner.itemList[i].item_status = 1;
                    owner.itemList[i].save();
                    owner.save();
                    console.log(owner.itemList[i].item_status);
                }
            }
            res.render("tmp.ejs",{user: owner, owner_id: "@34"});
        });
    });

//=========update==================
    app.get('/update', function(req,res){
        res.render('update.ejs',{user: req.user});
    });

    app.post('/update', function(req,res){
        UserSchema.findById(req.user._id,function(err, user){
            if(err) 
                throw err;
            //if(user.local.name != null)
                user.local.name=req.body.name;
            //else
                //user.google.name=req.body.name;
            user.save();
            res.redirect('/profile');
        });
    });
//=========Delete all users=========
    app.get('/remove_content',function(req,res){
        UserSchema.remove({},function(err){
           if(err) throw err; 
        });
        Item.remove({},function(err){
            if(err) throw err;
        });
        res.render( 'index.ejs' );
    });
//==========GOOGLE===================
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
            passport.authenticate('google', {
                    successRedirect : '/profile',
                    failureRedirect : '/'
            }));
};


// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
