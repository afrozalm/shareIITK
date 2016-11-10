const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const passport = require('passport')
const mongoose = require('mongoose');
const session = require('express-session')  
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

app.set('view engine', 'ejs')

var assert = require('assert');
var morgan = require('morgan');
var configDB = require('./config/database.js');

mongoose.connect(configDB.url);

app.listen(3001, function(){
    console.log('listening on 3001')
})

app.use(bodyParser.urlencoded({extended: true}));

//Added by members
app.use(express.static('public'));

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch',
                  resave: true,
                  saveUninitialized: true
})); // session secret

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); //

app.use(session({ cookie: { maxAge: 60000 }, 
                  secret: 'woot',
                  resave: false, 
                  saveUninitialized: false}));

require('./config/passport')(passport);
require('./app/routes.js')(app, passport); 
