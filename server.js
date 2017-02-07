var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var fs = require("fs");
var faye = require("faye");
var morgan = require("morgan");

var hasItStart = false;

app.use(express.static("public"));
app.use(express.static("regulamin"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
var server = http.createServer(app);
var bayeux = new faye.NodeAdapter({mount:'/faye', timeout: 90});
bayeux.attach(server);
var listOfZapisy = [];
var listOfZapisyGraficzne = [];

var testResults = {};

var poprawne = JSON.parse('[{"name":"a_1","value":"4"},{"name":"a_2","value":"1"},{"name":"a_3","value":"2"},{"name":"a_4_1","value":"Poeta"},{"name":"a_4_2","value":"Pan Młody"},{"name":"a_4_3","value":"Gospodarz"},{"name":"a_4_4","value":"Czepiec"},{"name":"a_5","value":"3"},{"name":"a_6","value":"2"},{"name":"a_7","value":"4"},{"name":"a_8_1","value":"1"},{"name":"a_8_2","value":"4"},{"name":"a_8_3","value":"2"},{"name":"a_8_4","value":"3"},{"name":"a_9","value":"3"},{"name":"a_10","value":"4"},{"name":"a_11","value":"3"},{"name":"a_12_1","value":"1"},{"name":"a_12_2","value":"3"},{"name":"a_12_3","value":"2"},{"name":"a_13_1","value":"1"},{"name":"a_13_2","value":"6"},{"name":"a_13_3","value":"3"},{"name":"a_13_4","value":"7"},{"name":"a_14","value":"4"},{"name":"a_15","value":"1"},{"name":"a_16_1","value":"5"},{"name":"a_16_2","value":"7"},{"name":"a_16_3","value":"1"},{"name":"a_16_4","value":"3"},{"name":"a_16_5","value":"1"}]');

var poprawne = {a_1: '4', a_2: '1', a_3: '2', a_4_1:'Poeta', a_4_2: 'Pan Młody', a_4_3: 'Gospodarz', a_4_4: 'Czepiec',
a_5: '3', a_6: '2', a_7: '4', a_8_1: '1', a_8_2: '4', a_8_3: '2', a_8_4: '3', a_9: '3', a_10: '4', a_11: '3',
a_12_1: '1', a_12_2: '3', a_12_3: '2', a_13_1: '1',a_13_2: '6',a_13_3: '3',a_13_4: '7', a_14: 4, a_15: '1', 
a_16_1: '5', a_16_2: '7', a_16_3: '1', a_16_4: '3', a_16_5: '1'}

console.log(poprawne);

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
    testResults[message.id].score = p;
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
  res.redirect('/regulamin.html');
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

app.get('/api/getans', function (req, res) {  
  res.json(testResults);
  res.end();
})

app.get('/api/getres/:iden', function (req, res) {
  console.log(testResults);
  console.log(req.params.iden);
  console.log(testResults[req.params.iden]);
  var r = testResults[req.params.iden]['score'].toString();
  res.write(r);
  res.end();
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

app.get('/api/test/submit/:class/:testId/:point/:ans', function (req, res) {  
  var identifier = req.params.class + '_' + req.params.testId;
  if(testResults[identifier] == null){
    testResults[identifier] = {};  
  }
  testResults[identifier][req.params.point] = req.params.ans; 
  console.log("s[" + identifier + ' :: '  + req.params.point + ' <<< ' + req.params.ans + ' ]')
  res.write('<html><head></head><body></body></html>');
  res.end();
});

app.get('/api/startuj', function (req, res) {  
  hasItStart = true;
});

app.get('/api/pauzuj', function (req, res) {  
  hasItStart = false;
});

app.get('/api/hasItStart', function (req, res) { res.json({hasItStart: hasItStart}); res.end(); });

app.get('/api/zadania', function (req, res) {  
  res.sendFile(path.join(__dirname+'/zadania2.txt'));
});

bayeux.on('handshake', function (clientId) { console.log('f[Client connected '+clientId+' ]'); });

server.listen(8080, function () {
  console.log("It has start")
})