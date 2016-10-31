const express = require('express');
const bodyParser = require('body-parser')
const app = express();

app.set('view engine', 'ejs')

var MongoClient = require('mongodb').MongoClient
  , Server = require('mongodb').Server;

var assert = require('assert');
var db
var url = 'mongodb://localhost:3000/quotes';
var mongoClient = new MongoClient(new Server('localhost', 27017));

mongoClient.open(function(err, mongoClient) {
    if(err) {
            console.log(err);
    }

    var userDB = mongoClient.db("users");
    var itemsDB = MongoClient.db("items")

    app.listen(3001, function(){
        console.log('listening on 3001')
    })

    app.use(bodyParser.urlencoded({extended: true}))

    app.get( '/', function(req, res){
        res.sendFile(__dirname + '/index.html')
    } )

    //app.post('/quotes', (req, res) => {
        //db.collection('quotes').save(req.body, (err, result) => {
            //if (err) return console.log(err)

            //console.log('saved to database')
            //res.redirect('/findall')
        //})
    //})

    //app.get( '/findall', (req, res) => {
        //var cursor = db.collection('quotes').find().toArray(function(err, result){
            //console.log(result);
            //res.render('index.ejs', {quotes:result})
        //})
        //console.log("cursor declared");
    //} )

});
