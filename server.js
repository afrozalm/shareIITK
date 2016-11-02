const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const passport = require('passport')
const session = require('express-session')  
//const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

app.set('view engine', 'ejs')

var MongoClient = require('mongodb').MongoClient
  , Server = require('mongodb').Server;

var assert = require('assert');
var morgan = require('morgan');
var db
var url = 'mongodb://localhost:3000/UserItem';
var mongoClient = new MongoClient(new Server('localhost', 27017));

mongoClient.open(function(err, mongoClient) {
    if(err) {
            console.log(err);
    }

    var userDB = mongoClient.db("users");
    var itemsDB = mongoClient.db("items");

    app.listen(3001, function(){
        console.log('listening on 3001')
    })

    app.use(bodyParser.urlencoded({extended: true}))

    app.use(morgan('dev')); // log every request to the console
    app.use(cookieParser()); // read cookies (needed for auth)
    // required for passport
    app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
    app.use(passport.initialize());
    app.use(passport.session()); // persistent login sessions
    app.use(flash()); //

    app.use(session({ cookie: { maxAge: 60000 }, 
                      secret: 'woot',
                      resave: false, 
                      saveUninitialized: false}));

    require('./app/routes.js')(app, passport); 
});
