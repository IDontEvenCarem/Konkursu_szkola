var client = new Faye.Client('/faye', {timeout: 120, retry: 5});

var hasItStart = false;
var hasItEnd = false;

var testId = "";

if(localStorage && "testId" in localStorage){
    testId = localStorage.testId;
    console.log(testId);
}else{
    testId = Math.random().toString(36).replace(/[^a-z]+/g, '');
    localStorage && (localStorage.testId = testId);
    console.log(testId);
}

var adminSubscription = client.subscribe('/admin', function (message) {  
    
    if(message.t == 'msg'){
        window.alert(message.text)
    }
    if(message.t == "start"){
        $('#lock_div').hide(600);
        $("#content").show(600);
        if(hasItStart == false){
            $.get("/api/zadania", function (data) { $("#content").html(data); })
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
        if(message.id == testId){
        console.log(message.val);
        var s = '<h1 class="text-center">Gratulacje, zdobyłeś ' + message.val +'/40 punktów!</h1>';
        console.log(s);
        $('#lock_div').html(s);
        $('#lock_div').show(600);
        $('#content').hide(600);
        }
    }
});

$(function () {  
    $('#saveData').click(function () {  
        SendData();
    });
    $('#endTest').click(function () {  
        SendData();
        sleep(800);
        console.log("Sending data to finalize")
        client.publish('/admin', {t: 'sum', id: testId})
        clearInterval(autoSend);
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

        $.get('/api/test/submit/'+testId+'/'+d[key].name+'/'+d[key].value)
    }
}

function getFormData() {
    var data = $('#main_form').serializeArray();
    console.log(data);
    return data;
}