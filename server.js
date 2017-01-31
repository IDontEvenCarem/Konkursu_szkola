var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var fs = require("fs");
var faye = require("faye");
var morgan = require("morgan");

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
var server = http.createServer(app);
var bayeux = new faye.NodeAdapter({mount:'/faye', timeout: 90});
bayeux.attach(server);
var listOfZapisy = [];
var listOfZapisyGraficzne = [];

var testResults = {};

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;

db.once('open', function () {
  console.log('Connected to mongo');
})

var poprawne = {
  a_1: 'Pastel',
  a_2: '1',
  a_3: 'Rydla',
  a_4: 'Życie',
  a_5: 'Poeta',
  a_6: 'Pan Młody',
  a_7: 'Gospodarz',
  a_8: 'Czepiec',
  a_9: '4',
  a_10: '2',
  a_11: '1898',
  a_12: '1901',
  a_13: '1904',
  a_14: '1903',
  a_15: '2',
  a_16: '3',
  a_17: '1',
  a_18: '2',
  a_19: '1',
  a_20: '3',
  a_21: '2',
  a_22: '4',
  a_23: '3',
  a_24: '6',
  a_25: '4',
  a_26: '2',
  a_27: '3',
  a_28: '1',
  a_29: '2',
  a_30: '3',
  a_31: '2',
  a_32: '5',
  a_33: '2',
  a_34: '3',
  a_35: '1',
  a_36: '3',
  a_37: '1',
  a_38: '6',
  a_39: '3',
  a_40: '7'
}

var fClient = new faye.Client('http://localhost:8080/faye');
fClient.subscribe('/admin', function (message) {  
  if(message.t == 'sum'){
    var p = 0;
    console.log(testResults[message.id])
    for(var key in testResults[message.id]){
      if(testResults[message.id][key] == poprawne[key]){
        p = p + 1;
      }
    }
    fClient.publish('/admin', {t: 'fin', id: message.id, val: p});
    console.log('final[ '+message.id + ' >>' + p +' ]');
  }
});

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
  res.status(200);
  res.sendFile(path.join(__dirname+'/index.html'));
})

app.get('/regulamin', function (req, res) {
  res.status(200);
  res.end();
})

app.get('/zapisy', function (req, res) {
  res.status(200);
  res.sendFile(path.join(__dirname+'/zapisy.html'));
})

app.get('/zgloszone', function (req, res) {
  res.status(200);
  res.sendFile(path.join(__dirname+'/zgloszone.html'))
})

app.post('/submit_zapis', function (req, res) {  
  res.status(200);
  listOfZapisy.push(req.body);
  var t = new normalModel({i_from: req.body.i_skad, i_osoba1: req.body.i_osoba1, e_osoba1: req.body.e_osoba1, i_osoba2: req.body.i_osoba2, e_osoba2: req.body.e_osoba2})
  t.save(function (err, fluffy) {if(err) return console.error(err); console.log("Saved to DB");});
  res.redirect('/zgloszone');
})

app.post('/submit_zapis_graficzny', function (req, res) {  
  res.status(200);
  listOfZapisyGraficzne.push(req.body);
  var t = new graphicModel({i_from: req.body.i_skad, i_osoba1: req.body.i_osoba1, e_osoba1: req.body.e_osoba1})
  t.save(function (err, fluffy) {if(err) return console.error(err); console.log("Saved to DB");});
  res.redirect('/zgloszone');
})

app.get("/api/z/n", function (req, res) {
  res.status(200);
  res.set({'Content-Type':'application/json', 'Charset':'utf-8'})
  normalModel.find(function (err, normals) {  
    if (err) return console.error(err);
    
    res.json(normals);
    res.end();
  });
})

app.get('/test', function (req, res) {  
  res.status(200);
  res.sendFile(path.join(__dirname+'/test.html'))
});

app.get('/dziel/i/rzadz', function (req, res) {  
  res.status(200);
  res.sendFile(path.join(__dirname+'/admin.html'))
});

app.get("/api/z/g", function (req, res) {
  res.status(200);
  res.set({'Content-Type':'application/json', 'Charset':'utf-8'})
  graphicModel.find(function (err, normals) {  
    if (err) return console.error(err);
    
    res.json(normals);
    res.end();
  });
})

app.get('/zapisy_graficzne', function (req, res) {
  res.status(200);
  res.sendFile(path.join(__dirname+'/zapisy_graficzne.html'))
})

app.get('/api/test/submit/:testId/:point/:ans', function (req, res) {  
  if(testResults[req.params.testId] == null){
    testResults[req.params.testId] = {};  
  }
  testResults[req.params.testId][req.params.point] = req.params.ans; 
  console.log("s[" + req.params.point + ' <- ' + req.params.ans + ' ]')
  res.write('a');
  res.end();
});

app.get('/api/zadania', function (req, res) {  
  res.sendFile(path.join(__dirname+'/zadania.txt'));
});

bayeux.on('handshake', function (clientId) { console.log('f[Client connected '+clientId+' ]'); });

server.listen(8080, function () {
  console.log("It has start")
})