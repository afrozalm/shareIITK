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
		res.render('index.ejs'); // load the index.ejs file
	});

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {
        
        //UserSchema.find({},function(err,user){
            //res.send(user);
        //});
         //render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/login', // redirect back to the signup page if there is an error
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
    app.post('/accept', function(req, res){
        console.log(req.body.itemID);
        Item.findByIdAndUpdate(req.body.itemID,{
            item_status : 1
        }, function(err){
            if (err){
                console.log('cannout update item db');
                throw err;
            }
        });

        req.user.itemList.filter( function(a){
            if ( a.id == req.body.itemID ){
                a.item_status = 1;
            }
        } );
        req.user.save();
        res.render('profile.ejs',{user: req.user});
    });

// SEARCH ===============================
	// show the search form
	app.get('/search', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('search.ejs', { message: req.flash('loginMessage') });
	});

    app.post('/search',function(req,res){ 
		Item.find({
			'name': req.body.search},
			function(err, itemList){
				console.log("Printing");
				if(err) throw err;
				//console.log(itemList);
				res.render('searchFound.ejs', {itemList: itemList, user: req.user});
			});

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

//=========REQUEST=====================
    app.post('/request', function(req, res ){
        var user_id = req.body.reqbtn;
        UserSchema.findByIdAndUpdate(user_id,
            {
                request_notification: user_id 
            }
            );
        res.render("tmp.ejs",{user_id: req.body.reqbtn});
        //res.send(req.called_from_item)
        //res.render("profile.ejs",{user: req.user});
    });


//==========RETURN_TO_DASHBOARD========
    app.post('/return_to_dashboard',function(req, res) {
        res.render('profile.ejs',{user: req.user});
    });

//=========Delete all users=========
    app.get('/remove_content',function(req,res){
        UserSchema.remove({},function(err){
           if(err) throw err; 
        });
        Item.remove({},function(err){
            if(err) throw err;
        });
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
