function alignParts() {
    $(".left-nav").css("height", $(".main-area").css("height"));
}

$(document).ready(function () {
    alignParts();
});
$(document).resize(function () { 
    alignParts();
});