
$(function(){


    $('#regist .hint a').on('click', function(){
        $('#login').addClass('panel-show')
        $('#regist').removeClass('panel-show')
    })
    $('#login .hint a').on('click', function(){
        $('#regist').addClass('panel-show')
        $('#login').removeClass('panel-show')
    })
    //注册
    $('#registSubmit').on('submit', function(event){
        registSubmit();
        event.preventDefault();
    })
    function registSubmit() {
        $.ajax({
           type: "post",
           url: "/api/user/register",
           data: $('#registSubmit').serialize(),
           dataType: "json"
       }).success(function(data) {
            if(!data.code) {
                setTimeout(function(){
                    $('#login').addClass('panel-show')
                    $('#regist').removeClass('panel-show')
                },500)
            }
            $("#registSubmit .message").html(data.message)
       }).fail(function(err){
          $("#registSubmit .message").html(err)
       }) 
    }
     //登陆
     $('#loginSubmit').on('submit', function(event){
        //console.log($('#loginSubmit').serialize())
        loginSubmit();
        event.preventDefault();
    })
    function loginSubmit() {
        $.ajax({
           type: "post",
           url: "/api/user/login",
           data: {
                username:  $('#username').val(),
                password:  $('#password').val()
           },
           dataType: "json"
       }).success(function(data) {
            $("#loginSubmit .message").html(data.message)
            if(!data.code) {
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
       }).fail(function(err){
            $("#loginSubmit .message").html(err)
       }) 
    }
    //退出
    $('.logout').on('click', function(){
        $.ajax({
            type: 'get',
            url: '/api/user/logout'
        }).success(function(data){
            if(!data.code) {
                window.location.reload();
            }
        }).fail(function(){})
    })
})