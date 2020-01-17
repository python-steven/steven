//全局变量的设置，这里主要是方便联动的查询

//NG率监控的页面的数据的分页显示效果函数
var page_ng = {'page':'1','num':'10'}
//选择一页显示数量
$(document).ready(function(){
     $("#setup_analysis_num").change(function(){
        var page_ng_number = $(this).children('option:selected').val()
        page_ng['num']=page_ng_number.toString()
        page_ng['page'] = '1'
        if(page_ng_number == 'All'){
            $("#previous_a").parent().addClass("disabled")
            $("#next_a").parent().addClass("disabled")
        }
        if(page_ng_number != 'All'){
            $("#previous_a").parent().removeClass("disabled")
            $("#next_a").parent().removeClass("disabled")
        }
        if(page_ng['page'] == '1'){
            $("#previous_a").parent().addClass("disabled")
        }
        if(JSON.stringify(query_analysis_post) == '{}' && JSON.stringify(visual_post) == '{}'){
            check_ng_ajax();
//            check_ng_change();
        }
        if(JSON.stringify(query_analysis_post) != '{}' && JSON.stringify(visual_post) == '{}'){
            select_monitor_ajax();
//            select_monitor_next();
        }
        if(JSON.stringify(visual_post) != '{}' && JSON.stringify(query_analysis_post) != '{}' ){
//            visual_data(visual_post['status']);
            visual_data_ajax();
        }
     })
})
//上一页页码的转换
function previous_analysis(){
    if(page_ng['page'] != '1' && page_ng['num'] != 'All'){
        page_ng['page']= (Number(page_ng['page'])-1).toString()
        $("#next_a").parent().removeClass("disabled")
        if(JSON.stringify(query_analysis_post) == '{}' && JSON.stringify(visual_post) == '{}'){
            check_ng_ajax();
//            check_ng_change();
        }
        if(JSON.stringify(query_analysis_post) != '{}' && JSON.stringify(visual_post) == '{}'){
            select_monitor_ajax();
//            select_monitor_next();
        }
        if(JSON.stringify(visual_post) != '{}' && JSON.stringify(query_analysis_post) != '{}' ){
//            visual_data(visual_post['status']);
            visual_data_ajax();
        }
    }
    if(page_ng['page'] == '1'){
        $("#previous_a").parent().addClass("disabled")
    }
}
//下一页的页面转换
function next_analysis(){
    if(page_ng['num'] != 'All'){
        page_ng['page']= (Number(page_ng['page'])+1).toString()
        $("#previous_a").parent().removeClass("disabled")
        if(JSON.stringify(query_analysis_post) == '{}' && JSON.stringify(visual_post) == '{}'){
            check_ng_ajax();
//            check_ng_change();
        }
        if(JSON.stringify(query_analysis_post) != '{}' && JSON.stringify(visual_post) == '{}'){
            console.log(query_analysis_post,visual_post)
            select_monitor_ajax();
//            select_monitor_next();
        }
        if(JSON.stringify(visual_post) != '{}' && JSON.stringify(query_analysis_post) != '{}' ){
//            visual_data(visual_post['status']);
            visual_data_ajax();
        }
    }
}


//NG监控的视图显示+ 获取前三个月的数据
function check_ng(){
    $(".ng").removeClass("yc")
    $(".budget").addClass("yc")
    $(".user").addClass("yc")
    $(".budgetform").addClass("yc")
    $(".merge").addClass("yc")
    $(".detail").addClass("yc")
    $(".maintain").addClass("yc")
    $(".statistic").addClass("yc")
    $(".modifypwd").addClass("yc")
    $(".main_monitor").addClass("yc")
    $("#NG_rate_query")[0].reset();
    //初始化数据
    query_analysis_post ={};
    visual_post = {};
    page_ng={'page':'1','num':'10'};
    $("#setup_analysis_num").val(10);
    $.ajax({
    type:'GET',
    data:page_ng,
    url:'/NGrate/monitor-equipment-info/',
    beforeSend :function(xmlHttp){
            xmlHttp.setRequestHeader("If-Modified-Since","0");
            xmlHttp.setRequestHeader("Cache-Control","no-cache");
    },
    success:function(result){
        if(result['code'] === 200){
            $("#monitor_detail").empty();
            monitor_data = result['data']
            select_start = (monitor_data.select_start.split("T"))[0]
            select_end = (monitor_data.select_end.split("T"))[0]
            console.log(monitor_data)
            visua(monitor_data.normal,monitor_data.warning,monitor_data.danger,select_start,select_end);
//            query_analysis_post['end_tim']=select_start
//            query_analysis_post['start_tim']=select_end
            limit_data = monitor_data.limit_value
            monitor_data =monitor_data.data
            for(var i=0; i<monitor_data.length; i++){
                var status
                var status_class
                if(limit_data[0].Max == "" && limit_data[0].Min == ""){
                    status =""
                    status_class= ""
                    var monitor_add = '<tr>'
                        +'<td class="yc">'+monitor_data[i].Id+'</td>'
                        +'<td>'+monitor_data[i].SN+'</td>'
                        +'<td>'+monitor_data[i].PartName+'</td>'
                        +'<td>'+limit_data[0].Min+'~'+limit_data[0].Max+'</td>'
                        +'<td>'+monitor_data[i].NGRate+'</td>'
                        +'<td>'+monitor_data[i].ErrorCounts+'</td>'
                        +'<td>'+monitor_data[i].UsedTimes+'</td>'
                        +'<td><span class='+status_class+'>'+status+'</span></td>'
                    +'</tr>'
                    $("#monitor_detail").append(monitor_add)
                }else{
                    if(monitor_data[i].NGRate < limit_data[0].Min){
                        status = "正常"
                        status_class ="success"
                    }
                    if(limit_data[0].Min <= monitor_data[i].NGRate && monitor_data[i].NGRate<= limit_data[0].Max){
                        status = "预警"
                        status_class = "warning"
                    }
                    if(monitor_data[i].NGRate > limit_data[0].Max){
                        status = "超标"
                        status_class ="danger"
                    }
                    var monitor_add = '<tr>'
                        +'<td class="yc">'+monitor_data[i].Id+'</td>'
                        +'<td>'+monitor_data[i].SN+'</td>'
                        +'<td>'+monitor_data[i].PartName+'</td>'
                        +'<td>'+limit_data[0].Min+'~'+limit_data[0].Max+'</td>'
                        +'<td>'+monitor_data[i].NGRate+'</td>'
                        +'<td>'+monitor_data[i].ErrorCounts+'</td>'
                        +'<td>'+monitor_data[i].UsedTimes+'</td>'
                        +'<td><span class="badge badge-'+status_class+'">'+status+'</span></td>'
                    +'</tr>'
                    $("#monitor_detail").append(monitor_add)
                }
            }

             data_count = result['data'].page_count
             console.log(data_count)
            if(page_ng['page'] == '1' && data_count<=1){
                $("#previous_a").parent().addClass("disabled")
                $("#next_a").parent().addClass("disabled")
            }
            if(Number(page_ng['page']) == data_count ){
                $("#next_a").parent().addClass("disabled")
            }
            if(Number(page_ng['page']) < data_count ){
                $("#previous_a").parent().addClass("disabled")
                $("#next_a").parent().removeClass("disabled")
            }
            if(Number(page_ng['page']) > data_count && data_count>1){
                $("#previous_a").parent().addClass("disabled")
                $("#next_a").parent().removeClass("disabled")
            }
        }else{
            $("#previous_a").parent().addClass("disabled")
            $("#next_a").parent().addClass("disabled")
        }
    }
    });

}
function check_ng_ajax(){
    $.ajax({
    type:'GET',
    data:page_ng,
    url:'/NGrate/monitor-equipment-info/',
    beforeSend :function(xmlHttp){
            xmlHttp.setRequestHeader("If-Modified-Since","0");
            xmlHttp.setRequestHeader("Cache-Control","no-cache");
    },
    success:function(result){
        if(result['code'] === 200){
            $("#monitor_detail").empty();
            monitor_data = result['data']
            console.log(monitor_data)
//            visua(monitor_data.normal,monitor_data.warning,monitor_data.danger);
            limit_data = monitor_data.limit_value
            monitor_data =monitor_data.data
            for(var i=0; i<monitor_data.length; i++){
                var status
                var status_class
                if(limit_data[0].Max == "" && limit_data[0].Min == ""){
                    status =""
                    status_class= ""
                    var monitor_add = '<tr>'
                        +'<td class="yc">'+monitor_data[i].Id+'</td>'
                        +'<td>'+monitor_data[i].SN+'</td>'
                        +'<td>'+monitor_data[i].PartName+'</td>'
                        +'<td>'+limit_data[0].Min+'~'+limit_data[0].Max+'</td>'
                        +'<td>'+monitor_data[i].NGRate+'</td>'
                        +'<td>'+monitor_data[i].ErrorCounts+'</td>'
                        +'<td>'+monitor_data[i].UsedTimes+'</td>'
                        +'<td><span class='+status_class+'>'+status+'</span></td>'
                    +'</tr>'
                    $("#monitor_detail").append(monitor_add)
                }else{
                    if(monitor_data[i].NGRate < limit_data[0].Min){
                        status = "正常"
                        status_class ="success"
                    }
                    if(limit_data[0].Min <= monitor_data[i].NGRate && monitor_data[i].NGRate<= limit_data[0].Max){
                        status = "预警"
                        status_class = "warning"
                    }
                    if(monitor_data[i].NGRate > limit_data[0].Max){
                        status = "超标"
                        status_class ="danger"
                    }
                    var monitor_add = '<tr>'
                        +'<td class="yc">'+monitor_data[i].Id+'</td>'
                        +'<td>'+monitor_data[i].SN+'</td>'
                        +'<td>'+monitor_data[i].PartName+'</td>'
                        +'<td>'+limit_data[0].Min+'~'+limit_data[0].Max+'</td>'
                        +'<td>'+monitor_data[i].NGRate+'</td>'
                        +'<td>'+monitor_data[i].ErrorCounts+'</td>'
                        +'<td>'+monitor_data[i].UsedTimes+'</td>'
                        +'<td><span class="badge badge-'+status_class+'">'+status+'</span></td>'
                    +'</tr>'
                    $("#monitor_detail").append(monitor_add)
                }
            }

             data_count = result['data'].page_count
            if(page_ng['page'] == '1' && data_count<=1){
                $("#previous_a").parent().addClass("disabled")
                $("#next_a").parent().addClass("disabled")
            }
            if(Number(page_ng['page']) == data_count ){
                $("#next_a").parent().addClass("disabled")
            }
            if(Number(page_ng['page']) < data_count ){
//                $("#previous_a").parent().addClass("disabled")
                $("#next_a").parent().removeClass("disabled")
            }
            if(Number(page_ng['page']) > data_count && data_count>1){
                $("#previous_a").parent().addClass("disabled")
                $("#next_a").parent().removeClass("disabled")
            }
        }else{
            $("#previous_a").parent().addClass("disabled")
           $("#next_a").parent().addClass("disabled")
        }
    }
    })
}

//装瓶状态的图片显示的传过来的数据
var visual_post ={}
//提供给index.js需要的函数 ajax请求
function visual_data(color){
    visual_post = query_analysis_post
    visual_post['status']=color
    visual_post['page']=page_ng['page']='1'
    visual_post['num']=page_ng['num']='10'
    query_analysis_post['page']='1'
    query_analysis_post['num']='10'
    $("#setup_analysis_num").val(10);
    console.log(visual_post)
    $.ajax({
        'type':'POST',
        'data':visual_post,
        'url':'/NGrate/visual-data/',
        success:function(result){
            if(result['code'] === 200){
                $("#monitor_detail").empty();
                visual_data_info = result['data']
                console.log(visual_data_info)
                visual_limit_data = visual_data_info.limit_value
                visual_monitor_data =visual_data_info.data
                for(var i=0; i<visual_monitor_data.length; i++){
                    var status
                    var status_class
                    if(visual_monitor_data[i][15] < visual_limit_data[0]){
                        status = "正常"
                        status_class = "badge badge-success";
                    }
                    if(visual_limit_data[0] <= visual_monitor_data[i][15] && visual_monitor_data[i][15]<= visual_limit_data[1]){
                        status = "预警"
                        status_class = "badge badge-warning";
                    }
                    if(visual_monitor_data[i][15] > visual_limit_data[1]){
                        status = "超标"
                        status_class = "badge badge-danger";
                    }
                    var visual_monitor_add = '<tr>'
                        +'<td class="yc">'+visual_monitor_data[i][0]+'</td>'
                        +'<td>'+visual_monitor_data[i][1]+'</td>'
                        +'<td>'+visual_monitor_data[i][4]+'</td>'
                        +'<td>'+visual_limit_data[0]+'~'+visual_limit_data[1]+'</td>'
                        +'<td>'+visual_monitor_data[i][15]+'</td>'
                        +'<td>'+visual_monitor_data[i][13]+'</td>'
                        +'<td>'+visual_monitor_data[i][6]+'</td>'
                        +'<td><span class="'+status_class+'">'+status+'</span></td>'
                    +'</tr>'
                    $("#monitor_detail").append(visual_monitor_add)
                }

                 data_count = result['data'].page_count
                if(page_ng['page'] == '1'){
                    $("#previous_a").parent().addClass("disabled")
                }
                if(Number(page_ng['page']) == data_count ){
                    $("#next_a").parent().addClass("disabled")
                }
                if(Number(page_ng['page']) < data_count ){
                    $("#next_a").parent().removeClass("disabled")
                }
                if(Number(page_ng['page']) > data_count && data_count>1){
                    page_ng['page'] ='1'
                    $("#previous_a").parent().addClass("disabled")
                    $("#next_a").parent().removeClass("disabled")
                }
            }else{
                $("#next_a").parent().addClass("disabled")
                $("#previous_a").parent().addClass("disabled")
            }
        }
    })
}
function visual_data_ajax(){
    visual_post['page']=page_ng['page']
    visual_post['num']=page_ng['num']
    console.log(visual_post)
    $.ajax({
        'type':'POST',
        'data':visual_post,
        'url':'/NGrate/visual-data/',
        success:function(result){
            if(result['code'] === 200){
                $("#monitor_detail").empty();
                visual_data_info = result['data']
                console.log(visual_data_info)
                visual_limit_data = visual_data_info.limit_value
                visual_monitor_data =visual_data_info.data
                for(var i=0; i<visual_monitor_data.length; i++){
                    var status
                    var status_class
                    if(visual_monitor_data[i][15] < visual_limit_data[0]){
                        status = "正常"
                        status_class = "badge badge-success";
                    }
                    if(visual_limit_data[0] <= visual_monitor_data[i][15] && visual_monitor_data[i][15]<= visual_limit_data[1]){
                        status = "预警"
                        status_class = "badge badge-warning";
                    }
                    if(visual_monitor_data[i][15] > visual_limit_data[1]){
                        status = "超标"
                        status_class = "badge badge-danger";
                    }
                    var visual_monitor_add = '<tr>'
                        +'<td class="yc">'+visual_monitor_data[i][0]+'</td>'
                        +'<td>'+visual_monitor_data[i][1]+'</td>'
                        +'<td>'+visual_monitor_data[i][4]+'</td>'
                        +'<td>'+visual_limit_data[0]+'~'+visual_limit_data[1]+'</td>'
                        +'<td>'+visual_monitor_data[i][15]+'</td>'
                        +'<td>'+visual_monitor_data[i][13]+'</td>'
                        +'<td>'+visual_monitor_data[i][6]+'</td>'
                        +'<td><span class="'+status_class+'">'+status+'</span></td>'
                    +'</tr>'
                    $("#monitor_detail").append(visual_monitor_add)
                }

                 data_count = result['data'].page_count
                if(page_ng['page'] == '1'){
                    $("#previous_a").parent().addClass("disabled")
                }
                if(Number(page_ng['page']) == data_count ){
                    $("#next_a").parent().addClass("disabled")
                }
                if(Number(page_ng['page']) < data_count ){
                    $("#next_a").parent().removeClass("disabled")
                }
                if(Number(page_ng['page']) > data_count && data_count>1){
                    page_ng['page'] ='1'
                    $("#previous_a").parent().addClass("disabled")
                    $("#next_a").parent().removeClass("disabled")
                }
            }else{
                $("#next_a").parent().addClass("disabled")
                $("#previous_a").parent().addClass("disabled")
            }
        }
    })
}

//设定之前先查一下是否之前有设定
function NG_before_setup(){
    $.ajax({
    type:'GET',
    data:{},
    url:'/NGrate/setup-before-info/',
    beforeSend :function(xmlHttp){
            xmlHttp.setRequestHeader("If-Modified-Since","0");
            xmlHttp.setRequestHeader("Cache-Control","no-cache");
        },
    success:function(result){
    if(result['code'] === 200){
        console.log(result['data'])
        $("#min_value").empty()
        $("#mail_receive").empty()
        $("#max_value").empty()
        $("#min_value").val(result['data'][0].Min)
        $("#max_value").val(result['data'][0].Max)
        var data=result['data']
        var str=result['data'][0].Reminders.split(',')
        console.log(str)
        for(var i=1; i<data.length; i++){
            user_mail = (data[i].Name)
            $("#mail_receive").append('<option value="'+user_mail+'">'+user_mail+'</option>')
        }
        console.log(str)
        $('#mail_receive').selectpicker('val',str);
        $('#mail_receive').selectpicker('refresh');
        $('#mail_receive').selectpicker('render');
    }else{
        alert(result['message'])
    }
    }
    })
}
//设定NG率的参数设置函数
function setup_monitor(){
    var min =$("#min_value").val()
    var max =$("#max_value").val()
    var mail_receiver =$("#mail_receive").val()
    if(min ==""){
        window.message.showError("min value can not empty!!!!")
        return false;
    }
    if(max ==""){
        window.message.showError("max value can not empty!!!!")
        return false;
    }
    if(max<min){
        window.message.showError("max and min value error")
        return false;
    }
    if(mail_receiver ==""){
        window.message.showError("mail receiver can not empty!!!!")
        return false;
    }
    data ={
        'min':min,
        'max':max,
        'mail_receiver':mail_receiver,
    }
    $.ajax({
        type:'POST',
        data:data,
        url:'/NGrate/setup-parameter/',
        success:function(result){
            if(result['code'] === 200){
                check_ng();
                window.message.showSuccess(result['message'])
            }else{
                window.message.showError(result['message'])
            }
        }
    })
}

//生成报表的按钮
function statement_NG_detail(){
    var li = $("#monitor_detail tr").length
    var data_td = []
    for(var i=0; i<li; i++){
        value = $("#monitor_detail tr").eq(i).find("td:first").html();
        data_td.push(value)
    }
    data = {'NG_ids':data_td,}
    $.ajax({
    'type':'POST',
    'data':data,
    'url':'/NGrate/monitor-equipment-info/',
        success:function(result){
            if(result['code'] === 200){
                window.location.href = result['data'][0]
            }else{
                window.message.showError(result['message'])
            }
        }
    })
}
var query_analysis_post = {}
//查询之前的页码初始化
function NG_monitor_initial(){
    page_ng={'page':'1','num':'10'};
    $("#setup_analysis_num").val(10);
    visual_post = {};
}
//查询函数
function select_monitor(){
    var sn = $("#NG_SN").val()
    var part_name = $("#part_name").val()
    var status = $("#status").val()
    var start_tim = $("#start_time").val()
    var end_tim = $("#end_time").val()
    var select_start=""
    var select_end=""
    if(sn=="" && part_name=="" && status=="" && start_tim =="" && end_tim ==""){
        query_analysis_post = {}
        check_ng();
        return false;
    }
    if(end_tim !=""){select_end=end_tim ,end_tim = end_tim+" 23:59:59";}
    if(start_tim !=""){select_start=start_tim}
    part_name= part_name.toUpperCase();
    data = {
        'sn':sn,
        'part_name':part_name,
        'status':status,
        'start_tim':start_tim,
        'end_tim':end_tim,
    }
    query_analysis_post = data
    data['page'] = page_ng['page']
    data['num'] = page_ng['num']
    console.log(data)
    $.ajax({
    'type':'POST',
    'data':data,
    'url':'/NGrate/monitor-query-info/',
        success:function(result){
            if(result['code'] === 200){
                $("#monitor_detail").empty();
                monitor_data = result['data']
//                console.log(monitor_data)
                visua(monitor_data.normal,monitor_data.warning,monitor_data.danger,select_end,select_start);
                limit_data = monitor_data.limit_value
                monitor_data =monitor_data.data
//                console.log(monitor_data)
                for(var i=0; i<monitor_data.length; i++){
                    var status
                    var status_class
                    if(monitor_data[i][15] < limit_data[0]){
                        status = "正常"
                        status_class = "badge badge-success";
                    }
                    if(limit_data[0] <= monitor_data[i][15] && monitor_data[i][15]<= limit_data[1]){
                        status = "预警"
                        status_class = "badge badge-warning";
                    }
                    if(monitor_data[i][15] > limit_data[1]){
                        status = "超标"
                        status_class = "badge badge-danger";
                    }
                    var monitor_add = '<tr>'
                        +'<td class="yc">'+monitor_data[i][0]+'</td>'
                        +'<td>'+monitor_data[i][1]+'</td>'
                        +'<td>'+monitor_data[i][4]+'</td>'
                        +'<td>'+limit_data[0]+'~'+limit_data[1]+'</td>'
                        +'<td>'+monitor_data[i][15]+'</td>'
                        +'<td>'+monitor_data[i][13]+'</td>'
                        +'<td>'+monitor_data[i][6]+'</td>'
                        +'<td><span class="'+status_class+'">'+status+'</span></td>'
                    +'</tr>'
                    $("#monitor_detail").append(monitor_add)
                }

                data_count = result['data'].page_count
                if(page_ng['page'] == '1' && data_count<=1){
                    $("#previous_a").parent().addClass("disabled")
                    $("#next_a").parent().addClass("disabled")
                }
                if(Number(page_ng['page']) == data_count ){
                    $("#next_a").parent().addClass("disabled")
                }
                if(Number(page_ng['page']) < data_count ){
//                    $("#previous_a").parent().addClass("disabled")
                    $("#next_a").parent().removeClass("disabled")
                }
                if(Number(page_ng['page']) > data_count && data_count>1){
                    $("#previous_a").parent().addClass("disabled")
                    $("#next_a").parent().removeClass("disabled")
                }
            }else{
                 $("#monitor_detail").empty();
                 visua([],[],[],"","");
                $("#next_a").parent().addClass("disabled")
                $("#previous_a").parent().addClass("disabled")
            }
        }
    })
}
function select_monitor_ajax(){
    var sn = $("#NG_SN").val()
    var part_name = $("#part_name").val()
    var status = $("#status").val()
    var start_tim = $("#start_time").val()
    var end_tim = $("#end_time").val()
    var select_start=""
    var select_end=""
    if(sn=="" && part_name=="" && status=="" && start_tim =="" && end_tim ==""){
        query_analysis_post = {}
        check_ng();
        return false;
    }
    if(end_tim !=""){select_end=end_tim ,end_tim = end_tim+" 23:59:59";}
    if(start_tim !=""){select_start=start_tim}
    part_name= part_name.toUpperCase();
    data = {
        'sn':sn,
        'part_name':part_name,
        'status':status,
        'start_tim':start_tim,
        'end_tim':end_tim,
    }
    query_analysis_post = data
    data['page'] = page_ng['page']
    data['num'] = page_ng['num']
    console.log(data)
    $.ajax({
    'type':'POST',
    'data':data,
    'url':'/NGrate/monitor-query-info/',
        success:function(result){
            if(result['code'] === 200){
                $("#monitor_detail").empty();
                monitor_data = result['data']
                limit_data = monitor_data.limit_value
                monitor_data =monitor_data.data
                for(var i=0; i<monitor_data.length; i++){
                    var status
                    var status_class
                    if(monitor_data[i][15] < limit_data[0]){
                        status = "正常"
                        status_class = "badge badge-success";
                    }
                    if(limit_data[0] <= monitor_data[i][15] && monitor_data[i][15]<= limit_data[1]){
                        status = "预警"
                        status_class = "badge badge-warning";
                    }
                    if(monitor_data[i][15] > limit_data[1]){
                        status = "超标"
                        status_class = "badge badge-danger";
                    }
                    var monitor_add = '<tr>'
                        +'<td class="yc">'+monitor_data[i][0]+'</td>'
                        +'<td>'+monitor_data[i][1]+'</td>'
                        +'<td>'+monitor_data[i][4]+'</td>'
                        +'<td>'+limit_data[0]+'~'+limit_data[1]+'</td>'
                        +'<td>'+monitor_data[i][15]+'</td>'
                        +'<td>'+monitor_data[i][13]+'</td>'
                        +'<td>'+monitor_data[i][6]+'</td>'
                        +'<td><span class="'+status_class+'">'+status+'</span></td>'
                    +'</tr>'
                    $("#monitor_detail").append(monitor_add)
                }

                data_count = result['data'].page_count
                if(page_ng['page'] == '1' && data_count<=1){
                    $("#previous_a").parent().addClass("disabled")
                    $("#next_a").parent().addClass("disabled")
                }
                if(Number(page_ng['page']) == data_count ){
                    $("#next_a").parent().addClass("disabled")
                }
                if(Number(page_ng['page']) < data_count ){
//                    $("#previous_a").parent().addClass("disabled")
                    $("#next_a").parent().removeClass("disabled")
                }
                if(Number(page_ng['page']) > data_count && data_count>1){
                    $("#previous_a").parent().addClass("disabled")
                    $("#next_a").parent().removeClass("disabled")
                }
            }else{
                 $("#monitor_detail").empty();
                 visua([],[],[],"","");
                $("#next_a").parent().addClass("disabled")
                $("#previous_a").parent().addClass("disabled")
            }
        }
    })
}
//独立出来查询的翻页功能需要的数据获取
function select_monitor_next(){
    var sn = $("#NG_SN").val()
    var part_name = $("#part_name").val()
    var status = $("#status").val()
    var start_tim = $("#start_time").val()
    var end_tim = $("#end_time").val()
    if(sn=="" && part_name=="" && status=="" && start_tim =="" && end_tim ==""){
        query_analysis_post = {}
    }
    if(start_tim ==end_tim && start_tim !="" && end_tim !=""){end_tim = end_tim+" 23:59:59";}
    part_name= part_name.toUpperCase();
    data = {
        'sn':sn,
        'part_name':part_name,
        'status':status,
        'start_tim':start_tim,
        'end_tim':end_tim,
    }
    monitor_query_info = data
    query_analysis_post = data
    data['page'] = page_ng['page']
    data['num'] = page_ng['num']
    console.log(data)
    query_analysis_post['page'] = page_ng['page']
    query_analysis_post['num'] = page_ng['num']
    $.ajax({
    'type':'GET',
    'data':query_analysis_post,
    'url':'/NGrate/monitor-equipment-query-next/',
        success:function(result){
            if(result['code'] === 200){
                $("#monitor_detail").empty();
                monitor_data = result['data']
//                console.log(monitor_data)
                limit_data = monitor_data.limit_value
                monitor_data =monitor_data.data
//                console.log(monitor_data)
                for(var i=0; i<monitor_data.length; i++){
                    var status
                    var status_class
                    if(monitor_data[i][15] < limit_data[0]){
                        status = "正常"
                        status_class = "badge badge-success";
                    }
                    if(limit_data[0] <= monitor_data[i][15] && monitor_data[i][15]<= limit_data[1]){
                        status = "预警"
                        status_class = "badge badge-warning";
                    }
                    if(monitor_data[i][15] > limit_data[1]){
                        status = "超标"
                        status_class = "badge badge-danger";
                    }
                    var monitor_add = '<tr>'
                        +'<td class="yc">'+monitor_data[i][0]+'</td>'
                        +'<td>'+monitor_data[i][1]+'</td>'
                        +'<td>'+monitor_data[i][4]+'</td>'
                        +'<td>'+limit_data[0]+'~'+limit_data[1]+'</td>'
                        +'<td>'+monitor_data[i][15]+'</td>'
                        +'<td>'+monitor_data[i][13]+'</td>'
                        +'<td>'+monitor_data[i][6]+'</td>'
                        +'<td><span class="'+status_class+'">'+status+'</span></td>'
                    +'</tr>'
                    $("#monitor_detail").append(monitor_add)
                }

                data_count = result['data'].page_count
                console.log(data_count)
                if(page_ng['page'] == '1' && data_count<=1){
                    $("#previous_a").parent().addClass("disabled")
                    $("#next_a").parent().addClass("disabled")
                }
                if(Number(page_ng['page']) == data_count ){
                    $("#next_a").parent().addClass("disabled")
                }
                if(Number(page_ng['page']) < data_count ){

                    $("#next_a").parent().removeClass("disabled")
                }
                if(Number(page_ng['page']) > data_count && data_count>1){
                    page_ng['page']='1'
                    $("#previous_a").parent().addClass("disabled")
                    $("#next_a").parent().removeClass("disabled")
                }
            }else{
                $("#next_a").parent().addClass("disabled")
                $("#previous_a").parent().addClass("disabled")
            }
        }
    })
}


//独立出来获取页码设定的数据的函数
//function check_ng_change(){
//    $.ajax({
//    type:'GET',
//    data:page_ng,
//    url:'/NGrate/monitor-equipment-change/',
//    success:function(result){
//        if(result['code'] === 200){
//            $("#monitor_detail").empty();
//            monitor_data = result['data']
////            console.log(monitor_data)
////				visua(monitor_data.normal,monitor_data.warning,monitor_data.danger);
//            limit_data = monitor_data.limit_value
//            monitor_data =monitor_data.data
//            for(var i=0; i<monitor_data.length; i++){
//                var status
//                var status_class
//                if(limit_data[0].Max == "" && limit_data[0].Min == ""){
//                    status =""
//                    status_class= ""
//                    var monitor_add = '<tr>'
//                        +'<td class="yc">'+monitor_data[i].Id+'</td>'
//                        +'<td>'+monitor_data[i].SN+'</td>'
//                        +'<td>'+monitor_data[i].PartName+'</td>'
//                        +'<td>'+limit_data[0].Min+'~'+limit_data[0].Max+'</td>'
//                        +'<td>'+monitor_data[i].NGRate+'</td>'
//                        +'<td>'+monitor_data[i].ErrorCounts+'</td>'
//                        +'<td>'+monitor_data[i].UsedTimes+'</td>'
//                        +'<td><span class='+status_class+'>'+status+'</span></td>'
//                    +'</tr>'
//                    $("#monitor_detail").append(monitor_add)
//                }else{
//                    if(monitor_data[i].NGRate < limit_data[0].Min){
//                        status = "正常"
//                        status_class ="success"
//                    }
//                    if(limit_data[0].Min <= monitor_data[i].NGRate && monitor_data[i].NGRate<= limit_data[0].Max){
//                        status = "预警"
//                        status_class = "warning"
//                    }
//                    if(monitor_data[i].NGRate > limit_data[0].Max){
//                        status = "超标"
//                        status_class ="danger"
//                    }
//                    var monitor_add = '<tr>'
//                        +'<td class="yc">'+monitor_data[i].Id+'</td>'
//                        +'<td>'+monitor_data[i].SN+'</td>'
//                        +'<td>'+monitor_data[i].PartName+'</td>'
//                        +'<td>'+limit_data[0].Min+'~'+limit_data[0].Max+'</td>'
//                        +'<td>'+monitor_data[i].NGRate+'</td>'
//                        +'<td>'+monitor_data[i].ErrorCounts+'</td>'
//                        +'<td>'+monitor_data[i].UsedTimes+'</td>'
//                        +'<td><span class="badge badge-'+status_class+'">'+status+'</span></td>'
//                    +'</tr>'
//                    $("#monitor_detail").append(monitor_add)
//                }
//            }
//
//            data_count = result['data'].page_count
//            if(page_ng['page'] == '1'){
//                $("#previous_a").parent().addClass("disabled")
//            }
//            if(Number(page_ng['page']) >= data_count){
//                $("#next_a").parent().addClass("disabled")
//            }
//
//        }else{
//           $("#next_a").parent().addClass("disabled")
//        }
//    }
//    })
//}

////独立出来获取的视图点击事件的数据获取数据
//function visual_data_page(part_name,color){
//    visual_post = query_analysis_post
//    visual_post['part_name']=part_name
//    visual_post['status']=color
//    visual_post['page']=page_ng['page']
//    visual_post['num']=page_ng['num']
//    console.log(visual_post)
//    $.ajax({
//        type:'POST',
//        data:visual_post,
//        url:'/NGrate/visual-data-equipment-page/',
//        success:function(result){
//            if(result['code'] === 200){
//                $("#monitor_detail").empty();
//                visual_data_info = result['data']
//                console.log(visual_data_info)
//                visual_limit_data = visual_data_info.limit_value
//                visual_monitor_data =visual_data_info.data
//                for(var i=0; i<visual_monitor_data.length; i++){
//                    var status
//                    var status_class
//                    if(visual_monitor_data[i][15] < visual_limit_data[0]){
//                        status = "正常"
//                        status_class = "badge badge-success";
//                    }
//                    if(visual_limit_data[0] <= visual_monitor_data[i][15] && visual_monitor_data[i][15]<= visual_limit_data[1]){
//                        status = "预警"
//                        status_class = "badge badge-warning";
//                    }
//                    if(visual_monitor_data[i][15] > visual_limit_data[1]){
//                        status = "超标"
//                        status_class = "badge badge-danger";
//                    }
//                    var visual_monitor_add = '<tr>'
//                        +'<td class="yc">'+visual_monitor_data[i][0]+'</td>'
//                        +'<td>'+visual_monitor_data[i][1]+'</td>'
//                        +'<td>'+visual_monitor_data[i][4]+'</td>'
//                        +'<td>'+visual_limit_data[0]+'~'+visual_limit_data[1]+'</td>'
//                        +'<td>'+visual_monitor_data[i][15]+'</td>'
//                        +'<td>'+visual_monitor_data[i][13]+'</td>'
//                        +'<td>'+visual_monitor_data[i][6]+'</td>'
//                        +'<td><span class="'+status_class+'">'+status+'</span></td>'
//                    +'</tr>'
//                    $("#monitor_detail").append(visual_monitor_add)
//                }
//
//                data_count = result['data'].page_count
//                if(page_ng['page'] == '1'){
//                    $("#previous_a").parent().addClass("disabled")
//                }
//                if(Number(page_ng['page']) >= data_count){
//                    $("#next_a").parent().addClass("disabled")
//                }
//            }else{
//                $("#next_a").parent().addClass("disabled")
//            }
//        }
//    })
//}

//function select_monitor_ajax(){
//    $.ajax({
//    'type':'POST',
//    'data':data,
//    'url':'/NGrate/monitor-query-info/',
//        success:function(result){
//            if(result['code'] === 200){
//                $("#monitor_detail").empty();
//                monitor_data = result['data']
////                console.log(monitor_data)
//                visua(monitor_data.normal,monitor_data.warning,monitor_data.danger);
//                limit_data = monitor_data.limit_value
//                monitor_data =monitor_data.data
////                console.log(monitor_data)
//                for(var i=0; i<monitor_data.length; i++){
//                    var status
//                    var status_class
//                    if(monitor_data[i][15] < limit_data[0]){
//                        status = "正常"
//                        status_class = "badge badge-success";
//                    }
//                    if(limit_data[0] <= monitor_data[i][15] && monitor_data[i][15]<= limit_data[1]){
//                        status = "预警"
//                        status_class = "badge badge-warning";
//                    }
//                    if(monitor_data[i][15] > limit_data[1]){
//                        status = "超标"
//                        status_class = "badge badge-danger";
//                    }
//                    var monitor_add = '<tr>'
//                        +'<td class="yc">'+monitor_data[i][0]+'</td>'
//                        +'<td>'+monitor_data[i][1]+'</td>'
//                        +'<td>'+monitor_data[i][4]+'</td>'
//                        +'<td>'+limit_data[0]+'~'+limit_data[1]+'</td>'
//                        +'<td>'+monitor_data[i][15]+'</td>'
//                        +'<td>'+monitor_data[i][13]+'</td>'
//                        +'<td>'+monitor_data[i][6]+'</td>'
//                        +'<td><span class="'+status_class+'">'+status+'</span></td>'
//                    +'</tr>'
//                    $("#monitor_detail").append(monitor_add)
//                }
//
//                data_count = result['data'].page_count
//                if(page_ng['page'] == '1' && data_count<=1){
//                    $("#previous_a").parent().addClass("disabled")
//                    $("#next_a").parent().addClass("disabled")
//                }
//                if(Number(page_ng['page']) == data_count ){
//                    $("#next_a").parent().addClass("disabled")
//                }
//                if(Number(page_ng['page']) < data_count ){
////                    $("#previous_a").parent().addClass("disabled")
//                    $("#next_a").parent().removeClass("disabled")
//                }
//                if(Number(page_ng['page']) > data_count && data_count>1){
//                    $("#previous_a").parent().addClass("disabled")
//                    $("#next_a").parent().removeClass("disabled")
//                }
//            }else{
//                 $("#monitor_detail").empty();
//                 visua([],[],[]);
//                $("#next_a").parent().addClass("disabled")
//            }
//        }
//    })
//}