//数据显示部分的data
function chart_tab(){
    $(".statistic").removeClass("yc")
    $(".budget").addClass("yc")
    $(".user").addClass("yc")
    $(".budgetform").addClass("yc")
    $(".merge").addClass("yc")
    $(".detail").addClass("yc")
    $(".ng").addClass("yc")
    $(".maintain").addClass("yc")
    $(".main_monitor").addClass("yc")
    $(".modifypwd").addClass("yc")
    $("#visual_query_data")[0].reset();
    analysis_q_data = {
        'begin':"",
        'end':"",
        'stage':"",
        'fixture':"",
        'usn':"",
    }
    $.ajax({
        type:'GET',
        data:{},
        url:'/analysis/analysis-equipment-info/',
        beforeSend :function(xmlHttp){
                xmlHttp.setRequestHeader("If-Modified-Since","0");
                xmlHttp.setRequestHeader("Cache-Control","no-cache");
        },
        success:function(result){
            if(result['code'] === 200){
                console.log(result['data'])
                num1=result['data'].user
                num2=result['data'].filterSN
                visua_pic(num1,num2)
                num=result['data'].errorcode
                num3=result['data'].Partname
                start_end=(result['data'].select_end.split('T'))[0]
                start_time=(result['data'].select_start.split('T'))[0]
                console.log(start_end,start_time)
                console.log(num)
                console.log(num3)
                ErrorCode(num,num3,start_time,start_end)
                analysis_q_data['begin']=start_end
                analysis_q_data['end']=start_time+' 23:59:59'
            }else{
                alert("need add data")
                console.log(result['data'])
            }
        }
    })

}

//后台获取我的设置的数据的函数
function add_modal_sa(){
    $.ajax({
        type:'GET',
        data:{},
        url:'/analysis/analysis-setup-data/',
        beforeSend :function(xmlHttp){
            xmlHttp.setRequestHeader("If-Modified-Since","0");
            xmlHttp.setRequestHeader("Cache-Control","no-cache");
        },
        success:function(result){
            if(result['code'] === 200){
                $("#input_analysis_data").empty()
                $("#item_index").val(result['data'][result['data'].length-1].Id+1)
                data = result['data']
                $("#pic_set").modal("show")
                if(data.length >0){
                   for(var i=0; i<data.length; i++){
                       add_html = '<div class="form-group col-md-12 row " id="'+data[i].Id +'_div">'
                       add_html += "<span class=\"col-md-2 col-form-label\" onclick=\"delete_input('" + data[i].Id + "_div');\">"
                       add_html += '<img alt="Delete" src="/static/images/icon_del.gif">'
                       add_html += '</span>'
                       add_html += '<label class="col-md-1 col-form-label" style="padding-right:0px">Min</label>'
                       add_html += '<div class="col-md-4 has-feedback">'
                       add_html += '<input type="text" class="form-control input_class" name="range_min['+data[i].Id+']" value="'+data[i].Min+'" onchange="check_min(\''+data[i].Id+'\');">'
                       add_html += '</div>'
                       add_html += '<label class="col-md-1 col-form-label" style="padding-right:0px">Max</label>'
                       add_html += '<div class="col-md-4 has-feedback">'
                       add_html += '<input type="text" class="form-control input_class" name="range_max['+data[i].Id+']" value="'+data[i].Max+'" onchange="check_max(\''+data[i].Id+'\');">'
                       add_html += '</div>'
                       add_html += '</div>'
                       $("#input_analysis_data").append(add_html)
                   }
                }
            }else{
                window.message.showError(result['message'])
            }
        }
    })
}

//增加输入框的动作
function add_input(){
    var range_id = $("#item_index").val();
    var range_div = range_id + '_div';
    var div_name;
    temp_range = "<div class=\"form-group col-md-12 row \" id=\""+ range_div +"\">";
    temp_range += "<span class=\"col-md-2 col-form-label\" onclick=\"delete_input('" + range_div + "');\"><img alt=\"Delete\" src=\"/static/images/icon_del.gif\"></span>";
    temp_range += "<label class=\"col-md-1 col-form-label\" style=\"padding-right:0px\">Min</label>";
    temp_range += "<div class=\"col-md-4 has-feedback\">";
    temp_range += "<input type=\"text\" class=\"form-control input_class\" name=\"range_min[" + range_id + "]\" onchange=\"check_min('"+range_id+"');\"></div>";
    temp_range += "<label class=\"col-md-1 col-form-label\" style=\"padding-right:0px\">Max</label>";
    temp_range += "<div class=\"col-md-4 has-feedback\">";
    temp_range += "<input type=\"text\" class=\"form-control input_class\" name=\"range_max[" + range_id + "]\" onchange=\"check_max('"+range_id+"');\"></div>";
    $('#input_analysis_data').append(temp_range);
    $("#item_index").val(parseInt($("#item_index").val(),10)+1);
}

function check_min(id)
{
    var pre_div_id = $('#'+id+'_div').prev().attr('id');    
    var cur_min_name = "range_min[" + id + "]";
    var cur_min = $('input[name="'+ cur_min_name +'"]').val();
    
    if(pre_div_id)
    {
        var arr_temp = pre_div_id.split('_');
        var pre_id = arr_temp[0];
        var pre_name = "range_max[" + pre_id + "]";
        var pre_max = $('input[name="'+pre_name+'"]').val();
        if(!pre_max)
        {
            alert('The previous max column is null.');
            $('input[name="'+ cur_name +'"]').val('');
            return false;
        }
        if(parseInt(cur_min) < parseInt(pre_max))
        {
            alert('Need to fill the number larger than the previous max column.');
            $('input[name="'+ cur_min_name +'"]').val('');
            return false;
        }
    }
    var cur_max_name = "range_max[" + id + "]";
    var cur_max = $('input[name="'+ cur_max_name +'"]').val();
    if(cur_max)
    {
        if(parseInt(cur_min) >= parseInt(cur_max)){
            alert('Need to fill the number larger than the next max column.');
            $('input[name="'+ cur_min_name +'"]').val('');
            return false;
        }
        
    }
}

function check_max(id)
{
    var next_div_id = $('#'+id+'_div').next().attr('id');

    var cur_min_name = "range_min[" + id + "]";
    var cur_min = $('input[name="'+cur_min_name+'"]').val();
    var cur_max_name = "range_max[" + id + "]";
    var cur_max = $('input[name="'+ cur_max_name +'"]').val();
    if(!cur_min)
    {
        alert('The min column is null.');
        $('input[name="'+ cur_max_name +'"]').val('');
        return false;
    }
    if(parseInt(cur_max) < parseInt(cur_min))
    {
        alert('Need to fill the number larger than the min column.');
        $('input[name="'+ cur_max_name +'"]').val('');
        return false;
    }

    if(next_div_id)
    {
        var arr_temp = next_div_id.split('_');
        var next_id = arr_temp[0];
        var next_name = "range_min[" + next_id + "]";
        var next_min = $('input[name="'+next_name+'"]').val();
        if(parseInt(cur_max) > parseInt(next_min))
        {
            alert('Need to fill the number larger than the next min column.');
            $('input[name="'+ cur_max_name +'"]').val('');
            return false;
        }

    }
}

//删除输入框的动作
function delete_input(div_id){
    if(confirm('Are you sure to delete?')){
		$('#' + div_id).remove();
		data={'div_id':div_id}
		$.ajax({
            'type':'POST',
            'data':data,
            'url':'/analysis/analysis-delete-data/',
            success:function(result){
                if(result['code'] === 200){
                }else{
                    window.message.showError(result['message'])
                }
            }
        })
    }
}

//设置fail区间的值得提交
function add_sa(){
    data={}
    //$('#fail_range_form').attr("action", "/analysis/analysis-setup-value/").submit();
    var value = $("#fail_range_form")[0]
    var i = 1
    for(i;;i++){
        if(value[i].name.length == 0){break;}
        data[String(value[i].name)]=value[i].value
    }
    range_data={'data':JSON.stringify(data)}
    console.log(range_data)
    $.ajax({
        'type':'POST',
        'data':range_data,
        'url':'/analysis/analysis-setup-value/',
        beforeSend :function(xmlHttp){
            xmlHttp.setRequestHeader("If-Modified-Since","0");
            xmlHttp.setRequestHeader("Cache-Control","no-cache");
        },
        success:function(result){
            if(result['code'] === 200){
                chart_tab();
                window.message.showSuccess(result['message'])
            }else{
                console.log(result['data'],result['message'])
            }
        }
    })
}

var analysis_q_data = {
    'begin':"",
    'end':"",
    'stage':"",
    'fixture':"",
    'usn':"",
}
//查询数据的时候去获取数据库里面的相应的数据，并贴到饼图筛选页面的方法
function query_data(){
    $.ajax({
        'type':'GET',
        'data':{},
        'url':'/analysis/analysis-query-data/',
        success:function(result){
            if(result['code'] === 200){
                data =result['data']
                $("#statistics_query_stage").empty()
                $("#statistics_query_fixture").empty()
                $("#statistics_query_stage").append('<option></option>')
//                $("#statistics_query_stage").append('<option>None</option>')
                $("#statistics_query_fixture").append('<option></option>')
//                $("#statistics_query_fixture").append('<option>None</option>')
//                $("#statistics_query_usn").empty()
//                $("#statistics_query_usn").append('<option>All</option>')
                stage_data =data.stage
                console.log(stage_data,analysis_q_data)
                for(var i=0; i<stage_data.length; i++){
                    if(stage_data[i].Stage != ""){
//                        if(analysis_q_data.stage == "null" && stage_data[i].Stage == null){var html_query='<option selected>'+stage_data[i].Stage+'</option>'}
                        if(analysis_q_data.stage == stage_data[i].Stage){
                            var html_query='<option selected>'+stage_data[i].Stage+'</option>'
                        }else{var html_query='<option>'+stage_data[i].Stage+'</option>'}
                        $("#statistics_query_stage").append(html_query)
                    }
//                    if(stage_data[i].Stage == null){$("#statistics_query_stage").append('<option>None</option>')}
                }
//                USN_data = data.USN
//                for(var j=0; j<USN_data.length; j++){
//                    if(analysis_q_data.usn == USN_data[j].USN){
//                        var html_query_usn='<option selected>'+USN_data[j].USN+'</option>'
//                    }else{var html_query_usn='<option>'+USN_data[j].USN+'</option>'}
//                    $("#statistics_query_usn").append(html_query_usn)
//                }
                fixture_data =data.fixtureId
                for(var k=0; k<fixture_data.length; k++){
                    if(fixture_data[k].FixtureId != ""){
//                        if(analysis_q_data.fixture == "null" && fixture_data[k].FixtureId == null){var html_query_fixture='<option selected>'+fixture_data[k].FixtureId+'</option>'}
                        if(analysis_q_data.fixture == fixture_data[k].FixtureId){
                            var html_query_fixture='<option selected>'+fixture_data[k].FixtureId+'</option>'
                        }else{var html_query_fixture='<option>'+fixture_data[k].FixtureId+'</option>'}
                        $("#statistics_query_fixture").append(html_query_fixture)}
                    }
            }else{
                window.message.showError(result['message'])
            }
        }
    })
}

//查询数据的post 提交数据的查询
function query_info_data(){
    //筛选增加spec, PN, PartName, 用户自己输入，都为模糊查询
    var Spec= $("#statistics_query_spec").val()
    var PN= $("#statistics_query_PN").val()
    var PartName= $("#statistics_query_PartName").val()
    var stage = $("#statistics_query_stage").val()
    var fixture = $("#statistics_query_fixture").val()
    var usn = $("#statistics_query_usn").val()
    var begin = $("#min").val()
    var end = $("#max").val()
    var startTime = new Date(Date.parse(begin));
    var endTime = new Date(Date.parse(end));
    var start_time=""
    var start_end=""
    if(startTime>endTime){
       window.message.showError("startTime can't > endTime")
       return false;
    }
    if(begin !=""){start_time=begin}
    if(end !=""){
        start_end = end
        end=end+' 23:59:59';
    }
//    if(stage == "null"){stage ="null"}
//    if(fixture == "null"){fixture ="null"}
//    if(usn == "All"){usn =""}
    data ={
        'begin':begin,
        'end':end,
        'stage':stage,
        'fixture':fixture,
        'usn':usn,
        'Spec':Spec,
        'PN':PN,
        'PartName':PartName,
    }
//    if(begin == "" && end == "" && stage == "" && fixture == "" && usn == "" && Spec == "" && PN == "" && PartName == ""){
//        chart_tab();
//        return false;
//    }
    analysis_q_data =data
    console.log(data)
    $.ajax({
        'type':'POST',
        'data':data,
        'url':'/analysis/analysis-query-info/',
        beforeSend :function(xmlHttp){
                xmlHttp.setRequestHeader("If-Modified-Since","0");
                xmlHttp.setRequestHeader("Cache-Control","no-cache");
            },
        success:function(result){
            if(result['code'] === 200){
            console.log(result['data'])
                num1=result['data'].user
                num2=result['data'].filterSN
                visua_pic(num1,num2)
                num=result['data'].errorcode
                num3=result['data'].Partname
                ErrorCode(num,num3,start_end,start_time)
            }else{
                window.message.showError(result['message'])
            }
        }
    })
}

//视图点击事件需要提交的数据进行查询出来  只做更新饼状态的图片
function query_errcode(obj){
    var visual_query_in = analysis_q_data
    visual_query_in['errorcode']=obj
    console.log(visual_query_in)
    return new Promise(function(resolve,reject)
        {
            $.ajax({
                type:'POST',
                data:visual_query_in,
                url:'/analysis/analysis-visual-data/',
//                 success:function(result){
//                    if(result['code'] === 200){
//                        console.log(result['data'])
//        //                num=result['data'].errorcode
//        //                ErrorCode(num)
////                        num3=result['data'].Partname
////                        data_analysis(num3)
//        //                pic_partname (num3)
//                    }else{
//        //                window.message.showError(result['message'])
//                        alert(result['message'])
//                    }
//                }
            })
            .done(function(res)
                {
                    var thisDate = res.data.Partname;    //需要返回thisDate
                    console.log(thisDate)
                    resolve(thisDate);
                })
            .fail(function(err)
                {
                    //console.log("error");
                    reject(err);
                })
            .always(function()
                {
                });
        });
}
//视图partname的点击事件需要提交的数据进行查询
function query_partname(obj){
    var visual_q_part = analysis_q_data
    visual_q_part['PartName']=obj
    visual_q_part['errorcode']=""
    console.log(visual_q_part)
    return new Promise(function(resolve,reject)
    {
        $.ajax({
            type:'POST',
            data:visual_q_part,
            url:'/analysis/analysis-vi-part/',
            /* success:function(result){
                if(result['code'] === 200){
                    console.log(result['data'])
                    num=result['data'].errorcode
                    console.log(num)
                    //ErrorCode(num)
                }else{
                    window.message.showError(result['message'])
                    alert(result['message'])
                }
            }  */
        })
        .done(function(res)
            {
                var thisDate = res.data.errorcode;    //需要返回thisDate
                console.log(thisDate)
                resolve(thisDate);
            })
        .fail(function(err)
            {
                reject(err);
            })
        .always(function()
            {
            //.....
            });
    });
}



var page_statistic = {'page':'1','num':'10'}
//选择一页显示数量
$(document).ready(function(){
     $("#statistic_setup").change(function(){
        var page_statistic_number = $(this).children('option:selected').val()
        page_statistic['num']=page_statistic_number.toString()
        page_statistic['page'] = '1'
        if(page_statistic_number == 'All'){
            $("#previous_statistic").parent().addClass("disabled")
            $("#next_statistic").parent().addClass("disabled")
        }
        if(page_statistic_number != 'All'){
            $("#previous_statistic").parent().removeClass("disabled")
            $("#next_statistic").parent().removeClass("disabled")
        }
        if(page_statement_obj['page'] == '1'){
            $("#previous_statistic").parent().addClass("disabled")
        }
        if(JSON.stringify(table_data) == '{}'){
            number_tab_ajax();
        }else{
            tab_query_select();
        }
     })
})
//上一页页码的转换
function previous_stat(){
    if(page_statistic['page'] != '1' && page_statistic['num'] != 'All'){
        page_statistic['page']= (Number(page_statistic['page'])-1).toString()
        $("#next_statistic").parent().removeClass("disabled")
        if(JSON.stringify(table_data) == '{}'){
            number_tab_ajax();
        }else{
            tab_query_select();
        }
    }
    if(page_statistic['page'] == '1'){
        $("#previous_statistic").parent().addClass("disabled")
    }
}
//下一页的页面转换
function next_stat(){
    if(page_statistic['num'] != 'All'){
        page_statistic['page']= (Number(page_statistic['page'])+1).toString()
        $("#previous_statistic").parent().removeClass("disabled")
        if(JSON.stringify(table_data) == '{}'){
            number_tab_ajax();
        }else{
            tab_query_select();
        }
    }
}

//console.log(table_data)
//数据显示部分
function number_tab(){
    $(".data_tab").removeClass("yc")
    $(".chart_pic").addClass("yc")
    $("#aly_query_data")[0].reset();
    page_statistic = {'page':'1','num':'10'}
    number_tab_ajax();

}
function number_tab_ajax(){
    $.ajax({
    'type':'GET',
    'data':page_statistic,
    'url':'/analysis/analysis-data/',
        success:function(result){
            if(result['code'] === 200){
                statistics_data = result['data'].data
                console.log(statistics_data)
                $("#statistics_data").empty()
                for(var i=0; i<statistics_data.length; i++){
                    statistics_data[i].TrnDate = (statistics_data[i].TrnDate).split("T")[0]
                    var equip_usn =  statistics_data[i].USN;
                    if(equip_usn && equip_usn.length > 10)
                    {
                        var ellipsis = "<font color=\"blue\">...</font>";
                        var sub_equip_usn = equip_usn.substring(0,10);
                        equip_usn_show = "<span data-toggle=\"popover\" data-trigger=\"hover click\" data-content=\""+ equip_usn +"\">" + sub_equip_usn + ellipsis + "</span>";
                    }
                    else
                        equip_usn_show = equip_usn;

                    var equip_osn =  statistics_data[i].OSN;
                    if(equip_osn && equip_osn.length > 10)
                    {
                        var ellipsis = "<font color=\"blue\">...</font>";
                        var sub_equip_osn = equip_osn.substring(0,10);
                        equip_osn_show = "<span data-toggle=\"popover\" data-trigger=\"hover click\" data-content=\""+ equip_osn +"\">" + sub_equip_osn + ellipsis + "</span>";
                    }
                    else
                        equip_osn_show = equip_osn;
                    
                    if(statistics_data[i].Asset == null){statistics_data[i].Asset = '';}
                    if(statistics_data[i].Stage == null){statistics_data[i].Stage = '';}

                    var equip_spec =  statistics_data[i].Spec;
                    if(equip_spec && equip_spec.length > 10)
                    {
                        var ellipsis = "<font color=\"blue\">...</font>";
                        var sub_equip_spec = equip_spec.substring(0,10);
                        equip_spec_show = "<span data-toggle=\"popover\" data-trigger=\"hover click\" data-content=\""+ equip_spec +"\">" + sub_equip_spec + ellipsis + "</span>";
                    }
                    else
                        equip_spec_show = equip_spec;
                    var statistics_data_add = '<tr>'
                        +'<td class="yc">'+statistics_data[i].Id+'</td>'
                        +'<td>'+equip_usn_show+'</td>'
                        +'<td>'+statistics_data[i].SN+'</td>'
                        +'<td>'+equip_osn_show+'</td>'
                        +'<td>'+statistics_data[i].Asset+'</td>'
                        +'<td>'+statistics_data[i].PN+'</td>'
                        +'<td>'+statistics_data[i].PartName+'</td>'
                        +'<td>'+equip_spec_show+'</td>'
                        +'<td>'+statistics_data[i].UsedTimes+'</td>'
                        +'<td>'+statistics_data[i].Stage+'</td>'
                        +'<td>'+statistics_data[i].FixtureId+'</td>'
                        +'<td>'+statistics_data[i].Result+'</td>'
                        +'<td>'+statistics_data[i].ErrorCode+'</td>'
                        +'<td>'+statistics_data[i].TrnDate+'</td>'
                    +'</tr>'
                    $("#statistics_data").append(statistics_data_add)
                    popover_show();
                }

                data_count = result['data'].page_count
                if(page_statistic['page'] == '1'){
                    $("#previous_statistic").parent().addClass("disabled")
                }
                if(Number(page_statistic['page']) < data_count){
//                    $("#previous_statistic").parent().addClass("disabled")
                    $("#next_statistic").parent().removeClass("disabled")
                }
                if(Number(page_statistic['page']) == data_count){
                    $("#next_statistic").parent().addClass("disabled")
                }
            }else{
                console.log(result['data'])
                $("#next_statistic").parent().addClass("disabled")
                $("#previous_statistic").parent().addClass("disabled")
            }
        }
    })
}


//数据后台获取的数据函数
function query_table(){
    page_statistic = {'page':'1','num':'10'};
     $("#previous_statistic").parent().addClass("disabled")
    $("#statistic_setup").val(10);
    $.ajax({
        'type':'GET',
        'data':{},
        'url':'/analysis/analysis-tab-data/',
        success:function(result){
            if(result['code'] === 200){
                data =result['data']
                stage_data =data.Stage
                console.log(stage_data,table_data.stage)
                var html_tab
                var html_query_fixture
                var html_query_result
                $("#tab_stage").empty()
                $("#tab_fixture").empty()
                $("#tab_result").empty()
                $("#tab_stage").append('<option selected></option>')
                $("#tab_fixture").append('<option></option>')
                $("#tab_result").append('<option></option>')
//                $("#tab_usn").empty()
//                $("#tab_usn").append('<option>All</option>')
                for(var i=0; i<stage_data.length; i++){
                    if(stage_data[i].Stage != "" ){
                        if(table_data.stage == stage_data[i].Stage && table_data.length > 0){
                            html_tab='<option selected>'+stage_data[i].Stage+'</option>'
                        }else{
                            html_tab='<option>'+stage_data[i].Stage+'</option>'
                        }
                        $("#tab_stage").append(html_tab)
//                        console.log(html_tab)
                    }
                }

//                USN_data = data.USN
//                for(var j=0; j<USN_data.length; j++){
//                    if(table_data.usn == USN_data[j].USN){
//                    var html_query_usn='<option selected>'+USN_data[j].USN+'</option>'
//                    }else{var html_query_usn='<option>'+USN_data[j].USN+'</option>'}
//                    $("#tab_usn").append(html_query_usn)
//                }
                fixture_data =data.FixtureId
                for(var k=0; k<fixture_data.length; k++){
                    if(fixture_data[k].FixtureId != ""){
                        if(table_data.fixture == fixture_data[k].FixtureId && table_data.fixture > 0){
                            html_query_fixture='<option selected>'+fixture_data[k].FixtureId+'</option>'
                        }else{
                            html_query_fixture='<option>'+fixture_data[k].FixtureId+'</option>'
                        }
                        $("#tab_fixture").append(html_query_fixture)
                    }
                }
                result_data = data.Result
                for(var l=0; l<result_data.length; l++){
                    if(table_data.result == result_data[l].Result){
                        html_query_result='<option selected>'+result_data[l].Result+'</option>'
                    }else{
                        html_query_result='<option>'+result_data[l].Result+'</option>'
                    }
                    $("#tab_result").append(html_query_result)
                }
            }else{
                window.message.showError(result['message'])
            }
        }
    })
}

//判断有无查询数据
var table_data ={}
//查询数据的post提交的数据的查询
function tab_query_select(){
    //筛选增加spec, PN, PartName, 用户自己输入，都为模糊查询
    var Spec= $("#tab_spec").val()
    var PN= $("#tab_PN").val()
    var PartName= $("#tab_PartName").val()
    var stage = $("#tab_stage").val()
    var fixture = $("#tab_fixture").val()
    var usn = $("#tab_usn").val()
    var result = $("#tab_result").val()
    var begin = $("#tab_min").val()
    var end = $("#tab_max").val()
    var startTime = new Date(Date.parse(begin));
    var endTime = new Date(Date.parse(end));
    if(startTime>endTime){
       window.message.showError("startTime can't > endTime")
       return false;
    }
    if(end !=""){end=end+' 23:59:59';}
    if(stage == "All" ){stage ="";}
    if(fixture == "All" ){fixture ="";}
    if(usn == "All" ){usn ="";}
    if(result == "All" ){result ="";}
    data ={
        'begin':begin,
        'end':end,
        'stage':stage,
        'fixture':fixture,
        'usn':usn,
        'result':result,
        'Spec':Spec,
        'PN':PN,
        'PartName':PartName,
    }
    data['page'] = page_statistic['page']
    data['num'] = page_statistic['num']
    table_data=data
    $.ajax({
        'type':'POST',
        'data':data,
        'url':'/analysis/analysis-query-tab-info/',
        success:function(result){
            if(result['code'] === 200){
                statistics_data = result['data'].data
                $("#statistics_data").empty()
                for(var i=0; i<statistics_data.length; i++){
                    if(statistics_data[i][4] == null){statistics_data[i][4] = ""}
                    var equip_usn =  statistics_data[i][1];
                    if(equip_usn && equip_usn.length > 10)
                    {
                        var ellipsis = "<font color=\"blue\">...</font>";
                        var sub_equip_usn = equip_usn.substring(0,10);
                        equip_usn_show = "<span data-toggle=\"popover\" data-trigger=\"hover click\" data-content=\""+ equip_usn +"\">" + sub_equip_usn + ellipsis + "</span>";
                    }
                    else
                        equip_usn_show = equip_usn;

                    var equip_osn =  statistics_data[i][3];
                    if(equip_osn && equip_osn.length > 10)
                    {
                        var ellipsis = "<font color=\"blue\">...</font>";
                        var sub_equip_osn = equip_osn.substring(0,10);
                        equip_osn_show = "<span data-toggle=\"popover\" data-trigger=\"hover click\" data-content=\""+ equip_osn +"\">" + sub_equip_osn + ellipsis + "</span>";
                    }
                    else
                        equip_osn_show = equip_osn;

                    var equip_spec =  statistics_data[i][7];
                    if(equip_spec && equip_spec.length > 10)
                    {
                        var ellipsis = "<font color=\"blue\">...</font>";
                        var sub_equip_spec = equip_spec.substring(0,10);
                        equip_spec_show = "<span data-toggle=\"popover\" data-trigger=\"hover click\" data-content=\""+ equip_spec +"\">" + sub_equip_spec + ellipsis + "</span>";
                    }
                    else
                        equip_spec_show = equip_spec;
                    if(statistics_data[i][9] == null){statistics_data[i][9] = '';}
                    statistics_data[i][13] = (statistics_data[i][13]).split("T")[0]
                    var statistics_data_add = '<tr>'
                        +'<td class="yc">'+statistics_data[i][0]+'</td>'
                        +'<td>'+equip_usn_show+'</td>'
                        +'<td>'+statistics_data[i][2]+'</td>'
                        +'<td>'+equip_osn_show+'</td>'
                        +'<td>'+statistics_data[i][4]+'</td>'
                        +'<td>'+statistics_data[i][5]+'</td>'
                        +'<td>'+statistics_data[i][6]+'</td>'
                        +'<td>'+equip_spec_show+'</td>'
                        +'<td>'+statistics_data[i][8]+'</td>'
                        +'<td>'+statistics_data[i][9]+'</td>'
                        +'<td>'+statistics_data[i][10]+'</td>'
                        +'<td>'+statistics_data[i][11]+'</td>'
                        +'<td>'+statistics_data[i][12]+'</td>'
                        +'<td>'+statistics_data[i][13]+'</td>'
                    +'</tr>'
                    $("#statistics_data").append(statistics_data_add)
                    popover_show();
                }

                data_count = result['data'].page_count
                console.log(data_count)
                if(page_statistic['page'] == '1' && data_count <=1){
                    $("#previous_statistic").parent().addClass("disabled")
                    $("#next_statistic").parent().addClass("disabled")
                }
                if(Number(page_statistic['page']) == data_count){
                    $("#next_statistic").parent().addClass("disabled")
                }
                if(Number(page_statistic['page']) < data_count){
//                    $("#previous_statistic").parent().addClass("disabled")
                    $("#next_statistic").parent().removeClass("disabled")
                }
                if(Number(page_statistic['page']) > data_count && data_count>1){
                    page_statistic['page'] ='1'
                    $("#previous_statistic").parent().addClass("disabled")
                    $("#next_statistic").parent().removeClass("disabled")
                }
            }else{
                $("#statistics_data").empty()
                $("#previous_statistic").parent().addClass("disabled")
                $("#next_statistic").parent().addClass("disabled")
            }
        }
    })
}

// 上传Excle的文档到后台插入文件
function analysis_upload_Excle(){
    if ($("#analysis_file").val() == ""){
        alert("Please select file!");
        return;
    }else if (($("#analysis_file").val().lastIndexOf(".xls") == -1) && ($("#analysis_file").val().lastIndexOf(".xlsx"))){
        alert("Not a excel file!");
        return;
    }

    if(confirm("Are you sure to upload?")){
        var formData=new FormData();
        var file = $("#analysis_file")[0].files[0]
        formData.append('file',file);
        $('#mask_div').show_mask();
        $.ajax({
            type:'POST',
            url:'/analysis/analysis-upload-file-excle/',
            data:formData,
            processData:false,
            contentType:false,
            success:function(result){
                $("#analysis_file").val("")//清空上传的数据
                if(result['code'] === 200){
                    window.message.showSuccess(result['message'])
                    document.body.removeEventListener('click',function(e){e.preventDefault();return true;},false)
                }else{
                    alert(result['message'])
    //                alert(result['data'].time)
                }
                $('#mask_div').hide_mask();
            }
        })
    }
}