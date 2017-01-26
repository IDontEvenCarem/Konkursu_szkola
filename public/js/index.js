$(document).ready(function () {
    ResizeNavs();
    $(window).resize(function () { 
        ResizeNavs();
    });
});



function ResizeNavs() {
    if(Modernizr.mq('(max-width: 991px)')){
        $(".left-nav").css("height", 'auto');
    }else{
        $(".left-nav").css("height", $('.main-area').css('height'));
        console.log('resized');
    }
    
}