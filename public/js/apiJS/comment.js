var limit = 2;
var page = 1;
var comments = [];
function commentSubmit() {
    if($('#commentcontent').val() == '') {
        $('#messagetitle').removeClass('hide')
        return
    }
    $('#messagetitle').addClass('hide')
    $.ajax({
       type: "post",
       url: "/api/comment/post",
       data: {
           content: $('#commentcontent').val(),
           contentid: $('#contentid').val()
       },
       dataType: "json"
   }).success(function(result) {
       if(result.code == 0) {
            //console.log(result.message)
            comments = result.data.comments.reverse()
            createComment()
            $('#commentcontent').val('')
            $('#contentid').val('')
       }
        
   }).fail(function(err){
      console.log(err)
   }) 
}

$('.page-prev').on('click', 'a', function (){
    page--;
    createComment()
})
$('.page-next').on('click', 'a', function (){
    page++;
    createComment()
})
function createComment () {
    var pages = Math.ceil(comments.length /limit);
    $('.page-count').html(page+'/'+pages)
    var start = Math.max(0, (page-1)*limit);
    var end = Math.min((start + limit), comments.length);
    if( page <= 1 ) {
        page = 1;
        $('.page-prev').html('<span>没有上一页</span>')
    } else {
        $('.page-prev').html('<a href="javascript:;">上一页</a>')
    }

    if( page >= pages ) {
        page = pages;
        $('.page-next').html('<span>没有上一页</span>')
    } else {
        $('.page-next').html('<a href="javascript:;">下一页</a>')
    }

    var html = '';
    $('.total').html(`一共有${comments.length}条评论`);
    if(comments.length == 0) {
        html = '<div class="alert alert-danger" role="alert">目前没有评论</div>';
        $('.pager').hide();
    } else {
        $('.pager').show();
        for (var i = start ; i<end; i++) {
            html += `<div class="panel panel-default">
                        <div class="panel-heading view-info">
                            <h3 class="panel-title">
                                昵称：<span>${comments[i].username}</span>
                                时间：<span>${formatDate(comments[i].postTime)}</span>
                            </h3>
                        </div>
                        <div class="panel-body view-content">
                            ${comments[i].content}
                        </div>
                    </div>`
        }
    }
    $('.total-comment').html(html)
}

$.ajax({
    type: "get",
    url: "/api/comment",
    data: {
        contentid: $('#contentid').val()
    }
}).success(function(result) {
    if(result.code == 0) {
        comments = result.data.comments.reverse()
        createComment()
    }
}).fail(function(err){
    console.log(err)
})
function fillZero (num) {
    return num < 10 ? '0'+num : num
}
function formatDate (d) {
    var date = new Date(d);
    return date.getFullYear() +'年'+fillZero(date.getMonth()+1)+'月'+date.getDate()+'日 '+fillZero(date.getHours())+':'+fillZero(date.getMinutes())+':'+fillZero(date.getSeconds())
}
$('#commit-btn').on('click',function(){
    commentSubmit()
    window.location.reload();
})
$('#commentcontent').on('keydown', function(ev){
    var oEvent = ev || event;
    if(oEvent.keyCode == 13) {
        commentSubmit()
        window.location.reload();
    }
})