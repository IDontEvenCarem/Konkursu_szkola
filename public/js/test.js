var client = new Faye.Client('/faye', {timeout: 120, retry: 5});

var hasItStart = false;
var hasItEnd = false;
var isReady = false;

var klasa = '';

var testId = "";

var identifier;

if(localStorage && "testId" in localStorage){
    testId = localStorage.testId;
    console.log(testId);
}else{
    testId = Math.random().toString(36).replace(/[^a-z]+/g, '');
    localStorage && (localStorage.testId = testId);
    console.log(testId);
}

var adminSubscription = client.subscribe('/admin', function (message) {  
    console.log(message);
    if(message.t == 'msg'){
        window.alert(message.text)
    }
    if(message.t == "start"){
        $('#lock_div').hide(600);
        $("#content").show(600);
        if(hasItStart == false){
            $.get("/api/zadania", function (data) { $("#content").html(data); });
        }
    }
    if(message.t == "pause"){
        $('#lock_div').show(600);
        $('#content').hide(600);
    }
    if(message.t == "fsave"){
        SendData();
    }
    if(message.t == 'fin'){
        if(message.id == identifier){
        console.log(message.val);
        var s = '<h1 class="text-center">Gratulacje, zdobyłeś ' + message.val +'/30 punktów!</h1>';
        console.log(s);
        $('#lock_div').html(s);
        $('#lock_div').show(600);
        $('#content').hide(600);
        }
    }
});

$(function () {  
    $('#gotowy').click(function () {  
        klasa = $('#i_klasa').val();
        identifier = klasa + '#' + testId;
        console.log(klasa);
        $('#lock_div').hide(600);
        $("#content").show(600);
    });
    $('#saveData').click(function () {  
        SendData();
    });
    $('#endTest').click(function () {  
        $(this).html('Wysyłanie danych...')
        SendData();
        console.log("Sending data to finalize");
        clearInterval(autoSend);
        var z = setInterval(function () {client.publish('/admin', {t: 'sum', id: identifier, c: klasa}); clearInterval(z);}, 5000);
        
        
    });
})

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

var autoSend = setInterval(function () {SendData();  }, 180000);

function SendData() {
    var d = getFormData()
    for (var key in d){
        if(!d.hasOwnProperty(key)) continue;

        $.get('/api/test/submit/'+ klasa+'/' +testId+'/'+d[key].name+'/'+d[key].value)
    }
}

function getFormData() {
    var data = $('#main_form').serializeArray();
    console.log(data);
    return data;
}