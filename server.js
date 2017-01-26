var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var path = require('path');
var mongoose = require('mongoose');
var fs = require("fs");

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var listOfZapisy = [];
var listOfZapisyGraficzne = [];

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;

db.once('open', function () {
  console.log('Connected to mongo');
})

var normalSchema = mongoose.Schema({
  i_from: String,
  i_osoba1: String,
  e_osoba1: String,
  i_osoba2: String,
  e_osoba2: String
});

var normalModel = mongoose.model('Normal', normalSchema);

var graphicSchema = mongoose.Schema({
  i_from: String,
  i_osoba1: String,
  e_osoba1: String,
});

var graphicModel = mongoose.model('Graphic', graphicSchema);

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname+'/index.html'));
})

app.get('/regulamin', function (req, res) {
  
  res.end();
})

app.get('/zapisy', function (req, res) {
  res.sendFile(path.join(__dirname+'/zapisy.html'));
})

app.get('/zgloszone', function (req, res) {
  res.sendFile(path.join(__dirname+'/zgloszone.html'))
})

app.post('/submit_zapis', function (req, res) {  
  listOfZapisy.push(req.body);
  var t = new normalModel({i_from: req.body.i_skad, i_osoba1: req.body.i_osoba1, e_osoba1: req.body.e_osoba1, i_osoba2: req.body.i_osoba2, e_osoba2: req.body.e_osoba2})
  t.save(function (err, fluffy) {if(err) return console.error(err); console.log("Saved to DB");});
  res.redirect('/zgloszone');
})

app.post('/submit_zapis_graficzny', function (req, res) {  
  listOfZapisyGraficzne.push(req.body);
  var t = new graphicModel({i_from: req.body.i_skad, i_osoba1: req.body.i_osoba1, e_osoba1: req.body.e_osoba1})
  t.save(function (err, fluffy) {if(err) return console.error(err); console.log("Saved to DB");});
  res.redirect('/zgloszone');
})

app.get("/api/z/n", function (req, res) {
  res.set({'Content-Type':'application/json', 'Charset':'utf-8'})
  normalModel.find(function (err, normals) {  
    if (err) return console.error(err);
    console.log(JSON.stringify(normals));
    res.json(normals);
    res.end();
  });
})

app.get("/api/z/g", function (req, res) {
  res.set({'Content-Type':'application/json', 'Charset':'utf-8'})
  graphicModel.find(function (err, normals) {  
    if (err) return console.error(err);
    console.log(JSON.stringify(normals));
    res.json(normals);
    res.end();
  });
})

app.get('/zapisy_graficzne', function (req, res) {
  res.sendFile(path.join(__dirname+'/zapisy_graficzne.html'))
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})