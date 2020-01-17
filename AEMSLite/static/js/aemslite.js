$(function() {
    $("#datepicker1" ).datepicker({
        //minDate: new Date()
        });
    $("#datepicker2").datepicker({
        //minDate: new Date()
        });
    $("#datepicker3").datepicker({});
    $("#datepicker4").datepicker({});
    $("#setup_main_date").datepicker({});
    $("#main_date").datepicker({});
    $("#query_main_next_time").datepicker({});
    $("#to_query_main_next_time").datepicker({});
    $("#min").datepicker({});
    $("#max").datepicker({});
    $("#start_time").datepicker({});
    $("#end_time").datepicker({});
    $("#tab_min").datepicker({});
    $("#tab_max").datepicker({});
    $("#main_start_time").datepicker({});
    $("#main_end_time").datepicker({});
    $("#maintain_setup_date").datepicker({});
    $("#maintain_start_time").datepicker({ });
    $("#maintain_end_time").datepicker({ });
    $("#add_next_main_date").datepicker({});
    $("#log_start_time").datepicker({ });
    $("#log_end_time").datepicker({ });
    $("#l_s_time").datepicker({ });
    $("#l_e_time").datepicker({ });
    $("#mo_next_time").datepicker({ });
    $("#equipmentToFactoryDate").datepicker({ });
    $("#toFactoryDate").datepicker({ });
});

var li_index
$(document).ready(function() {
    var language = $.cookie('language');
    if(language == "English"){
        $("#language").val("1")
        $("#language").change() 
    }
    $("li").each(function(index) {
        $("li").eq(index).click(function() {
            li_index = index
            var a = $(this).siblings()
            var c = a.children()
            c.removeClass("active")
            var b = $(this).children()
            b.addClass("active")
            
        });
    });
});

$(document).ready(function() {
    var language = $.cookie('language');
    if(language == "English"){
        $("#language").val("1")
        $("#language").change() 
    }
});

function modifypwd(){
    $(".modifypwd").removeClass("yc")
    $(".maintain").addClass("yc")
    $(".budget").addClass("yc")
    $(".user").addClass("yc")
    $(".budgetform").addClass("yc")
    $(".merge").addClass("yc")
    $(".detail").addClass("yc")
    $(".ng").addClass("yc")
    $(".statistic").addClass("yc")
    $(".main_monitor").addClass("yc")
} 

//预算编码页面的内部控制
function apply(){
    $(".apply").removeClass("yc")
    $(".signing").addClass("yc")
    $(".signed").addClass("yc")
    $(".statement").addClass("yc")
    $(".ongoing").addClass("yc")
    budget();
}

//预算编码的申请页面的控制
function rebudget(){
    $(".budgetform").addClass("yc")
    $(".budget").removeClass("yc")
}

//取消预算编码的申请
function re_budget(){
    var p = confirm("此表单将不被保存，是否确定离开此页面!")
    if(p == true){
        $(".budgetform").addClass("yc")
        $(".budget").removeClass("yc")
    }
}

//合并开单的页面控制
function remerge(){
    $(".merge").addClass("yc")
    $(".budget").removeClass("yc")
}


function delete_budget(){
     $("tr").each(function(index) {
        $("tr").eq(index).click(function() {
            var b = $(this).find("td")
            $("#delete_id_form").val(b[1].innerHTML)
        });
    });
}


function copy_budget(){
    $("table tr").click(function() {
        var td = $(this).find("td");// 找到td元素
        $("#budget_form_id_copy").val(td[1].innerHTML)
        });
}

//全编辑
function modify_form(obj){
        var modify_unique_id = obj.parent().parent().find("td").eq(1).text()
         data ={
            'modify_unique_id':modify_unique_id,
        } 
        $.ajax({
            type:'POST',
            url:'/index/budget-modify-unique/',
            data:data,
            success:function(result){
                if(result['code'] === 200){
                    console.log(result['data'])
                    var a = result['data'][0]
                    var c = a['Department']//部门
                    var d = a['Customer']//客户
                    var x = a['PurchaseType']//会计科目
                    var y = a['TypeOfMachine']//机种
                    var z = a['ProjectCode']//机种
//                    console.log(a)
                    budgetform([c,d,x,y,z])
//                    var e = a['PurchaseType']//类别
                    var f = a['UnitPrice']//price
                    var g = a ['Quantity']//num
                    var sum = f*g
                    var h=count_detail_fee(a['Rule'],sum)
                    if(a['FormId']==null){
                        $("#From_ID").html("")
                    }else{
                        $("#From_ID").html(a['FormId'])
                    }
                    $("#count_fee").val(sum)
                    $("#month_fee").val(h)
                    $("#budgetId").val(a['Id'])//Id 不可见
                    $("#Remark").val(a['Remark'])//耗损
                    $("#bud_num_type").val(a['ExternalNumberType'])//单号类型

                    $("#bud_principal").val(a['requiredPICId'])// 需求人
                    $("#bud_machine_name").val(a['ProductName'])//设备名称
                    $("#bud_machine_type").val(a['Model'])//规格
//                    $("#budget_type").val(e)//类别
                    $("#p_price").val(f)//单价
                    $("#p_qty").val(g)//数量
                    $("#bud_qty_type").val(a['Unit'])//单位
                    $("#moneys").val(a['Currency'])//币种
//                    $("#bud_mach_type").val(a['TypeOfMachine'])//机种
                    $("#bud_project_code").val(a['PN'])//PN
                    $("#bud_user").val(a['Signer'])//签核人
                    $("#bud_reason").val(a['ApplyReason'])//理由
                    return false;
                }else{
                    window.message.showError(result['message'])
                    return false;
                }
            }
        })
}


function to_html(num){
    if(num == 1){
        $(".detail").addClass("yc")
        $(".budget").removeClass("yc")
        $(".apply").addClass("yc")
        $(".signing").removeClass("yc")
        $(".ongoing").addClass("yc")
    }
    if (num == 2){
        $(".detail").addClass("yc")
        $(".budget").removeClass("yc")
        $(".apply").addClass("yc")
        $(".signed").removeClass("yc")
        $(".ongoing").addClass("yc")
    }
    if(num == 3){
        $(".detail").addClass("yc")
        $(".budget").removeClass("yc")
        $(".apply").addClass("yc")
        $(".statement").removeClass("yc")
        $(".ongoing").addClass("yc")
    }
    if(num == 4){
        $(".detail").addClass("yc")
        $(".budget").removeClass("yc")
        $(".apply").removeClass("yc")
        $(".ongoing").addClass("yc")
    }
    if(num == 5){
        $(".detail").addClass("yc")
        $(".budget").removeClass("yc")
        $(".apply").addClass("yc")
        $(".ongoing").removeClass("yc")
    }
} 

//设备保养操作界面切换
function del_log(){
    $("table tr").click(function() {
        var td = $(this).find("td");// 找到td元素
        $("#delete_log_id").val(td[1].innerHTML)
        });
}


function re_log(){
    $(".add_log").removeClass("yc")
    $(".modify_log").addClass("yc")
}


function modify_log(obj){
    $(".add_log").addClass("yc")
    $(".modify_log").removeClass("yc")
    var td = obj.parent().parent().find("td")
    $("#mo_sn").val(td.eq(2).text())
    $("#mo_usn").val(td.eq(3).text())
    var osn = td.eq(4).children().attr("data-content");
    if(typeof osn != "undefined"){
        $("#mo_osn").val(osn)
    }else{
        $("#mo_osn").val(td.eq(4).text())
    }
    $("#mo_asset").val(td.eq(5).text())
    $("#mo_pn").val(td.eq(6).text())
    $("#mo_partname").val(td.eq(7).text())

    var spec = td.eq(8).children().attr("data-content");
//    console.log(typeof spec)
    if(typeof spec != "undefined"){
        $("#mo_spec").val(spec)
    }else{
        $("#mo_spec").val(td.eq(8).text())
    }
    $("#mo_use").val(td.eq(9).text())
    $("#mo_time").val(td.eq(10).text())
    $("#mo_use_time").val(td.eq(11).text())
    $("#mo_next_time").val(td.eq(12).text())
    $("#mo_name").val(td.eq(13).text())
    $("#mo_days").val(td.eq(16).text())
    $("#mo_times").val(td.eq(17).text())
    
    $.ajax({
        type:"GET",
        url:'/maintain/maintain-location/',
        success:function(result){
            if(result['code'] === 200){
                console.log(result['data'])
                data=result['data']
                $("#mo_addr").empty()
                $("#mo_addr").append('<option value=""></option>')
                for(var i=0; i<data.length; i++){
                    if(td.eq(14).text() == data[i].Location){
                        var local = "<option value="+data[i].Id+" selected>"+data[i].Location+"</option>"
                    }else{
                        var local2 = "<option value="+data[i].Id+">"+data[i].Location+"</option>"
                    }
                    $("#mo_addr").append(local)
                    $("#mo_addr").append(local2)
                }
            }else{
                alert(result['message'])
            }
        }
    })
    //$(".mo_status").find("option[text='"+td.eq(15).text()+"']").attr("selected",true);
    $("#mo_status").find("option:contains("+td.eq(15).text()+")").attr("selected",true);
    //获取用户
//    var names = td.eq(18).text().split(',')

    $.ajax({
        type:'GET',
        data:{},
        url:'/maintain/setup-maintainer/',
        beforeSend :function(xmlHttp){
                    xmlHttp.setRequestHeader("If-Modified-Since","0");
                    xmlHttp.setRequestHeader("Cache-Control","no-cache");
                },
        success:function(result){
            if(result['code'] === 200){
                $('#mo_maintainers').empty()
                console.log(result['data'])
                data = result['data']
                var str='<option value=""></option>'
                var names = td.eq(18).text().split(',')
                console.log(names.length)
                for(var i=0; i<data.length; i++){
                    for(var j=0; j<names.length; j++){
                        if(data[i].Name == names[j]){
                            str =str+'<option value='+data[i].Id+' selected>'+data[i].Name+'</option>'
                        }
                    }
                    if(names.indexOf(data[i].Name) == -1){
                        str =str+'<option value='+data[i].Id+'>'+data[i].Name+'</option>'
                    }
                }
                $('#mo_maintainers').html(str);
                $('#mo_maintainers').selectpicker('refresh');
            }
        }
    })
//    $("#mo_status").append("<option value="+data[i].Id+" selected>"+td.eq(15).text()+"</option>");
}


function operation(){
    $("#Previous_Ma").parent().addClass("disabled")
    $("#Next_Ma").parent().addClass("disabled")
    $(".operation").removeClass("yc")
    $(".maintain_index").addClass("yc")
    $(".add_main").addClass("yc")
    $(".result").addClass("yc")
    $(".query_log").addClass("yc")
    $(".add_log").addClass("yc")
    $(".modify_log").addClass("yc")
    $.ajax({
        type:"GET",
        url:'/maintain/maintain-location/',
        success:function(result){
            if(result['code'] === 200){
                console.log(result['data'])
                data=result['data']
                $("#query_locations").empty()
                $("#maintain_locations").empty()
                $("#query_locations").append('<option value=""></option>')
                $("#maintain_locations").append('<option value=""></option>')
                for(var i=0; i<data.length; i++){
                    var local = "<option value="+data[i].Id+">"+data[i].Location+"</option>"
                    $("#query_locations").append(local)
                    $("#maintain_locations").append(local)
                }
            }else{
                alert(result['message'])
            }
        }
    })
}


function maintion_index(){
    $(".maintain_index").removeClass("yc")
    $(".add_main").addClass("yc")
    $(".operation").addClass("yc")
    $(".result").addClass("yc")
    $(".query_log").addClass("yc")
    $(".add_log").addClass("yc")
    $(".modify_log").addClass("yc")
}


function add_maintoin(){
    $(".add_main").removeClass("yc")
    $(".maintain_index").addClass("yc")
    $(".operation").addClass("yc")
    $(".result").addClass("yc")
    $(".query_log").addClass("yc")
    $(".add_log").addClass("yc")
    $(".modify_log").addClass("yc")
    //获取后台数据的位置data
    $.ajax({
        type:"GET",
        url:'/maintain/maintain-location/',
        success:function(result){
            if(result['code'] === 200){
                console.log(result['data'])
                data=result['data']
                $("#location_select").empty()
                $("#location_select").append('<option value=""></option>')
                for(var i=0; i<data.length; i++){
                    var local = "<option value="+data[i].Id+">"+data[i].Location+"</option>"
                    $("#location_select").append(local)
                }
            }else{
                alert(result['message'])
            }
        }
    })
    $.ajax({
        type:'GET',
        data:{},
        url:'/maintain/setup-maintainer/',
        beforeSend :function(xmlHttp){
                    xmlHttp.setRequestHeader("If-Modified-Since","0");
                    xmlHttp.setRequestHeader("Cache-Control","no-cache");
                },
        success:function(result){
            if(result['code'] === 200){
                console.log(result['data'])
                data = result['data']
                var str='<option value=""></option>'
                for(var i=2; i<data.length; i++){
                    str =str+'<option value='+data[i].Id+'>'+data[i].Name+'</option>'
                }
                console.log(str)
                $('#user_select').html(str);
                $('#user_select').selectpicker('refresh');
            }
        }
    })
}


function re_add_main(){  
    $(".result").addClass("yc")
    add_log();
    li_active();
}

//单独进行li标签的特效跳转
function li_active(){
    var add_log_index = $("li").eq(li_index+1)
    add_log_index.siblings().children().removeClass("active")
    add_log_index.children().addClass("active")
}

//统计分析的图表切换
function picture(){
    $(".chart_pic").removeClass("yc")
    $(".data_tab").addClass("yc")
    chart_tab();
}

//checkbox全选
$(function () {
    //全选,设置chheckbox name='all' tbody id=tb
    $("input[name=all]").click(function () {
        if (this.checked) {
            $("#statement_detail :checkbox").prop("checked", true);
        } else {
            $("#statement_detail :checkbox").prop("checked", false);
        }
    });
});

//修改密码
function old_new_pwd(){
    var oldpwd = $("#oldpwd").val().trim()
    var newpwd = $("#newpwd").val().trim()
    var againpwd = $("#again").val().trim()
    //console.log(oldpwd)
    if(oldpwd == ""|| newpwd == ""|| againpwd == ""){
        window.message.showError("Don't leave a blank field")
    }else{
        if(oldpwd == newpwd){
            window.message.showError("Can't be the same as the old password!")
        }else if(newpwd != againpwd){
            window.message.showError("Two new passwords are different")
        }else{
            $.ajax({
                type:'POST',
                url:'/management/password-modify/',
                data:{"OldPwd":oldpwd,"NewPwd":newpwd},
                success:function (result){
                    if(result['code'] === 200){
                        window.message.showSuccess(result['message'])
                        window.location.href="/login/"
                    }else{
                        window.message.showError(result['message'])
                    }
                }
            })
        }
    }
}

//NG可视化
function visua(number1,number2,number3,endtime,startime){
    var index = -1;
    var datas = new Array()
    var ng_num = 0
    if(number1 != 0){
        var map = 0
        for(var i = 0;i < number1.length;i ++){
            map += number1[i][1]
            ng_num += number1[i][1]
        }
        datas.push({"value":map, "name":"正常","itemStyle":{color: '#28a745'}})
    }
    if(number2 != 0){
        var map = 0
        for(var i = 0;i < number2.length;i ++){
            map += number2[i][1]
            ng_num += number2[i][1]
        }
        datas.push({"value":map, "name":"预警","itemStyle":{color: '#ffc107'}})
    }
    if(number3 != 0){
        var map = 0
        for(var i = 0;i < number3.length;i ++){
            map += number3[i][1]
            ng_num += number3[i][1]
        }
        datas.push({"value":map, "name":"超标","itemStyle":{color: '#dc3545'}})
    }
    // 基于准备好的dom，初始化echarts实例
    echarts.init(document.getElementById('main')).dispose();
    var myChart = echarts.init(document.getElementById('main'));
    // 指定图表的配置项和数据
    var option = {
        legend: {
            orient: 'vertical',
            x: 'left',
            data:['正常','预警','超标']
        },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}:{c}({d}%)"
        },
        series: [
            {
                name:'数值样本',
                type:'pie',
                radius: ['30%', '60%'],
                center: ['50%', '50%'],
                label: {
                    normal: {
                        formatter: "{b|{b}:}{per|{d}%}",
                        rich: {
                            c: {
                                fontSize: 10,
                                lineHeight:25
                            },
                            per: {
                                padding:[2,4],
                                borderRadius:2
                            }
                        }
                    }
                },
                data:datas,
            }
        ] 
    }; 
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
    myChart.on('click', function (params) {
        if(index == -1||index != params.dataIndex){
            myChart.dispatchAction({type: 'pieSelect',dataIndex:params.dataIndex});
            myChart.dispatchAction({type: 'pieUnSelect',dataIndex:params.dataIndex});
            page_ng={'page':'1','num':'10'};
            visual_post = {}
            visual_data(params.color);
            $("html, body").animate({scrollTop: $("#box").offset().top });
            index = params.dataIndex;
        }else{
            myChart.dispatchAction({type: 'pieSelect',dataIndex:params.dataIndex});
            myChart.dispatchAction({type: 'pieUnSelect',dataIndex:params.dataIndex});
            select_monitor()
            page_ng={'page':'1','num':'10'};
            visual_post = {}
            index = -1;
        }
        // 控制台打印数据的名称
        
    });
    set_ng_data(ng_num,endtime,startime)
}

//统计分析可视化
function visua_pic(num1,num2){
    //SN数据解析
    var pie_sum = 0
    var fortime = $("#total_num").val()
    var data1 = new Array()
    if(num2.length <= fortime || fortime == "all"){
        for(var i = 0;i < num2.length;i ++){
            var map = {"value":num2[i][0], "name":num2[i][1]}
            data1.push(map)
        }
    }else{
        for(var i = 0;i < num2.length;i ++){
            if(i >= fortime){
                pie_sum = pie_sum + num2[i][0]
            }else{
                var map = {"value":num2[i][0], "name":num2[i][1]}
                data1.push(map)
            }
        }
        var map = {"value":pie_sum, "name":"Others"}
        data1.push(map)
    }
  /*   for(var i = 0;i < num2.length;i ++){
        var map = {"value":num2[i][0], "name":num2[i][1]}
        data1.push(map)
    } */
    //FAll次数数据解析
    var data2 = new Array()
    for(var i = 0;i < num1.length;i ++){
        var map = {"value":num1[i][1], "name":num1[i][0]}
        data2.push(map)
    } 
    // 基于准备好的dom，初始化echarts实例
    echarts.init(document.getElementById('threemain')).dispose();
    echarts.init(document.getElementById('fourmain')).dispose();
    var myChart3 = echarts.init(document.getElementById('threemain'));
    var myChart4 = echarts.init(document.getElementById('fourmain'));

    // 指定图表的配置项和数据
    var option2 = {
        title: {
            text: 'FAIL次数 依据已使用次数范围',
        },
        tooltip : {
            trigger: 'item',
            formatter: "{a}<br/>{b}:{c}({d}%)"
        },
        series : [
            {
                name: '数值样本',
                type: 'pie',
                radius : ['30%','60%'],
                center: ['50%', '50%'],
                label: {
                    normal: {
                        formatter: '{b|{b}:}{per|{d}%}',
                        rich: {
                            c: {
                                fontSize: 10,
                                lineHeight:25
                            },
                            per: {
                                padding:[2,4],
                                borderRadius:2
                            }
                        }
                    }
                },
                data:data2,
            }
        ]
    };
    var option3 = {
        title: {
            text: 'NG数量(按设备名称)',
        },
        tooltip : {
            trigger: 'item',
            formatter: "{a}<br/>{b}:{c}({d}%)"
        },
        series : [
            {
                name: '数值样本',
                type: 'pie',
                radius : ['30%','60%'],
                center: ['50%', '50%'],
                label: {
                    normal: {
                        formatter: '{b|{b}:}{per|{d}%}',
                        rich: {
                            c: {
                                fontSize: 10,
                                lineHeight:25
                            },
                            per: {
                                padding:[2,4],
                                borderRadius:2
                            }
                        }
                    }
                },
                data:data1,
            }
        ]
    };
    // 使用刚指定的配置项和数据显示图表。
    myChart3.setOption(option2);
    myChart4.setOption(option3);
}

var pie_data;
function ErrorCode(num,pic_num,start_time,end_time){
    var pic_data =  pic_num
    function sortprice(a,b){
          return b[1]-a[1]
        }
    //利用js中的sort方法
    pic_data.sort(sortprice);
    //打印排序后的数据到控制台
    //console.log(newdata);
    var index = -1
    pie_data = pic_num
    var data_xy = data_num_pic(num)
    echarts.init(document.getElementById('onemain')).dispose();
    var myChart1 = echarts.init(document.getElementById('onemain'));
    echarts.init(document.getElementById('twomain')).dispose();
    var myChart2 = echarts.init(document.getElementById('twomain'));
    var option = {
         title: {
            text: '问题分布图',
        },
        tooltip : {
            trigger: 'axis',
            axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            },
            formatter: function (params) {
                var tar = params[1];
                return tar.name+'<br/>'+tar.seriesName+':'+tar.value;
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
       /*  xAxis: {
            type : 'category',
            splitLine: {show:false},
            data :data_xy[1]
        }, */
        xAxis: [
            {
                type: 'category',
                data: data_xy[1],
                axisLabel:{
                    interval:0,//横轴信息全部显示
                    rotate:-20,// -20度角倾斜显示
                }

            }
        ],

        dataZoom: [{
            type: 'slider',
            show: true, //flase直接隐藏图形
            xAxisIndex: [0],
            left: '9%', //滚动条靠左侧的百分比
            bottom: -5,
            start: 0,//滚动条的起始位置
            end: 20 //滚动条的截止位置（按比例分割你的柱状图x轴长度）
        }],
        yAxis: {
            type : 'value'
        },
        series: [
            {
                name: '辅助',
                type: 'bar',
                stack:  '总量',
                itemStyle: {
                    normal: {
                        barBorderColor: 'rgba(0,0,0,0)',
                        color: 'rgba(0,0,0,0)'
                    },
                    emphasis: {
                        barBorderColor: 'rgba(0,0,0,0)',
                        color: 'rgba(0,0,0,0)'
                    }
                },
                data:data_xy[2]
            },
            {
                name: '样本数据',
                type: 'bar',
                stack: '总量',
                label: {
                    normal: {
                        show: true,
                        position: 'inside'
                    }
                },
                data:data_xy[0]
            }
        ]
    }; 
    var data_pic = new Array()
    var fortime = $("#total_num").val()
    var pie_sum = 0
    if(pic_num.length <= fortime || fortime == "all"){
        for(var i = 0;i < pic_num.length;i ++){
            var map = {"value":pic_num[i][1], "name":pic_num[i][0]}
            data_pic.push(map)
        }
    }else{
        for(var i = 0;i < pic_num.length;i ++){
            if(i >= fortime){
                pie_sum = pie_sum + pic_num[i][1]
            }else{
                var map = {"value":pic_num[i][1], "name":pic_num[i][0]}
                data_pic.push(map)
            }
        }
        var map = {"value":pie_sum, "name":"Others"}
        data_pic.push(map)
    }
    var option1 = {
        title: {
            text: '问题设备分布图',
        },
        tooltip : {
            trigger: 'item',
            formatter: "{a}<br/>{b}:{c}({d}%)"
        },
        series : [
            {
                name: '数值样本',
                type: 'pie',
                radius : ['30%','60%'],
                center: ['50%', '50%'],
                label: {
                    show:false,
                    normal: {
                        formatter: '{b|{b}:}{per|{d}%}',
                        rich: {
                            c: {
                                fontSize: 10,
                                lineHeight:25
                            },
                            per: {
                                padding:[2,4],
                                borderRadius:2
                            }
                        }
                    }
                },
                data:data_pic,
            }
        ]
    };
    myChart1.setOption(option);
    myChart1.on('click', function (params) {
        if(params.name == "Total"){
                myChart1.setOption(option);
        }else{
            var names = query_errcode(params.name)
            names.then(function(resolveData){
                //console.log(resolveData)
                var data_pie = data_analysis(resolveData)
                var op = myChart2.getOption()
                op.series[0].data = data_pie
                myChart2.setOption(op)
                index = -2
            })
        }
    });
    myChart2.setOption(option1);
    myChart2.on('click', function (params) {
        if(index == -1){           
            myChart2.dispatchAction({type: 'pieSelect',dataIndex:params.dataIndex});
            if(params.name != "Others"){
                var names = query_partname(params.name)
                names.then(function(resolveData){
                    var data_xy = data_num_pic(resolveData)
                    var op = myChart1.getOption()
                    op.series[0].data = data_xy[2]
                    op.series[1].data = data_xy[0]
                    op.xAxis[0].data=data_xy[1]
                    myChart1.setOption(op)
                }) 
            }else{
                alert("数据包含太多，无法查询")
            }
            index = params.dataIndex
        }else if(index == -2){ 
            myChart2.setOption(option1);
            myChart1.setOption(option);
            index = -1
        }else if(index != params.dataIndex){
            myChart2.dispatchAction({type: 'pieUnSelect',dataIndex:index});
            myChart2.dispatchAction({type: 'pieSelect',dataIndex:params.dataIndex});
            var names = query_partname(params.name)
            names.then(function(resolveData){
                var data_xy = data_num_pic(resolveData)
                var op = myChart1.getOption()
                op.series[0].data = data_xy[2]
                op.series[1].data = data_xy[0]
                op.xAxis[0].data=data_xy[1]
                myChart1.setOption(op)
            })
            index = params.dataIndex;            
        }else{
            myChart2.dispatchAction({type: 'pieUnSelect',dataIndex:params.dataIndex});
            myChart1.setOption(option);
            index = -1
        }        
    });
    set_data_num(data_xy[3],start_time,end_time);

}


function data_num_pic(num){
    var newdata =  num
    function sortprice(a,b){
          return b[1]-a[1]
        }
    //利用js中的sort方法
    newdata.sort(sortprice);
    //打印排序后的数据到控制台
    //console.log(newdata);
    var fortime = $("#total_num").val()
    var dataValue = new Array()
    var dataName = new Array()
    var datas = new Array()
    var sum = 0;
    var total = 0;
    if(num.length <= fortime || fortime == "all"){
        for(var i = 0;i < num.length;i ++){
            dataName.push(num[i][0])
            dataValue.push(num[i][1])
            datas.push(sum)
            sum = sum + num[i][1]
            total = sum 
        }
    }else{
        for(var i = 0;i < num.length;i ++){
            if(i < fortime){
                total = sum + num[i][1]
                dataName.push(num[i][0])
                dataValue.push(num[i][1])
                datas.push(sum)
                sum = sum + num[i][1]
                total = sum 
            }else{
                total = total + num[i][1]
            }
        }
    }
    dataValue.push(sum)
    dataName.push("Total")
    datas.push(0)
    return [dataValue,dataName,datas,total]
}


function data_analysis(pic_num){
    var map
    var data_pie = new Array()
    var fortime = $("#total_num").val()
    var pie_sum = 0
    var pie_err_sum = 0
    if(pie_data.length <= fortime || fortime == "all"){
        for(var i = 0;i < pie_data.length;i ++){
            for(var j = 0;j < pic_num.length;j ++){
                if(pie_data[i][0] == pic_num[j][0]){
                    if(pie_data[i][1] == pic_num[j][1]){
                        //var map = {"value":null, "name":pie_data[i][0]}
                        map = {"value":pic_num[j][1],"name":pie_data[i][0],selected:true}
                    }else{
                        map = {"value":pic_num[j][1], "name":pie_data[i][0],selected:true}
                        data_pie.push(map)
                        map = {"value":pie_data[i][1] - pic_num[j][1], "name":pie_data[i][0],label:{show:false,},labelLine:{show:false,}}
                        //break;
                    }
                    //map = {"value":pic_num[j][1],"name":pie_data[i][0],selected:true}
                    break;
                }else{
                    map = {"value":pie_data[i][1], "name":pie_data[i][0],label:{show:false},labelLine:{show:false,}}
                }
            }
            data_pie.push(map)
        }
    }else{
        for(var i = 0;i < pie_data.length;i ++){
            if(i >= fortime){
                for(var j = 0;j < pic_num.length;j ++){
                    if(pie_data[i][0] == pic_num[j][0]){
                        //console.log(pie_data[i][0],pic_num[j][0])
                        pie_err_sum = pie_err_sum + pic_num[j][1]
                        break;
                    }
                }
                pie_sum = pie_sum + pie_data[i][1]
            }else{
                for(var j = 0;j < pic_num.length;j ++){
                    if(pie_data[i][0] == pic_num[j][0]){
                        if(pie_data[i][1] == pic_num[j][1]){
                            //var map = {"value":null, "name":pie_data[i][0]}
                            map = {"value":pic_num[j][1],"name":pie_data[i][0],selected:true}
                        }else{
                            map = {"value":pic_num[j][1], "name":pie_data[i][0],selected:true}
                            data_pie.push(map)
                            map = {"value":pie_data[i][1] - pic_num[j][1], "name":pie_data[i][0],label:{show:false,},labelLine:{show:false,}}
                            //break;
                        }
                        //map = {"value":pic_num[j][1],"name":pie_data[i][0],selected:true}
                        break;
                    }else{
                        map = {"value":pie_data[i][1], "name":pie_data[i][0],label:{show:false,},labelLine:{show:false,}}
                    }
                }
                data_pie.push(map)
            }
        }
        if(pie_err_sum != 0){
            map = {"value":pie_err_sum, "name":"Others",selected:true}
            data_pie.push(map)
        }
        //console.log(pie_err_sum)
        map = {"value":pie_sum - pie_err_sum, "name":"Others",label:{show:false,},labelLine:{show:false,}}
        data_pie.push(map)
        //console.log(pie_err_sum,pie_sum)
    }    
    return data_pie
}

//对电子邮件的验证
function isEmail(obj){
    //console.log(obj)
    var myreg = /^[a-zA-Z0-9_-]+@wistron+\.(?:com|local)$/gi;
    var mailname = obj.value.trim()
    if(!myreg.test(mailname)){
        
        alert('Please enter “@wistron.com” or “@wistron.cn” email address！');
        obj.value = '';
        $('#username').val("");
    }else{
        var name = obj.value.split("@")
        var reg = new RegExp("_","g");
        var names = name[0].replace(reg,' ');
        $('#username').val(names);
    }
}

function Status_CN_ENG(value){
    switch(value) {
        case "normal":
            values = "正常使用"
            return values
        case "repaired":
            values = "维修"
            return values
        case "scrapped":
            values = "报废"
            return values
        case "lost":
            values = "遗失"
            return values
    } 
}

$(document).ready(function(){
    $("#budget_type").change(function(){
        var name = $(this).children('option:selected').val();
        var price = $("#p_price").val()
        var qty = $("#p_qty").val()
        var sum = (price*qty).toFixed(2)
        if(name == "杂购"){
            $("#count_fee").val(sum)
            $("#month_fee").val((sum/1000).toFixed(2))
        }else{
            $("#count_fee").val(sum)
            if(sum > 600000){
                 $("#month_fee").val((sum/36000).toFixed(2))
             }else{
                 $("#month_fee").val((sum/12000).toFixed(2))
             }
        }
    });
})


function maintain_sn(obj){
     var id = obj.parent().parent().find("td").eq(2).text()
     //console.log(id)
     $("#item_sn").html(id)
     $.ajax({
        type:'GET',
        data:{},
        url:'/maintain/setup-maintainer/',
        beforeSend :function(xmlHttp){
                    xmlHttp.setRequestHeader("If-Modified-Since","0");
                    xmlHttp.setRequestHeader("Cache-Control","no-cache");
                },
        success:function(result){
            if(result['code'] === 200){
                console.log(result['data'])
                data = result['data']
                var str='<option value=""></option>'
                for(var i=2; i<data.length; i++){
                    str =str+'<option value='+data[i].Id+'>'+data[i].Name+'</option>'
                }
//                console.log(str)
                $('#reset_maintainers').html(str);
                $('#reset_maintainers').selectpicker('refresh');
            }
        }
    })
}
function by_PN_setup(){
    $.ajax({
        type:'GET',
        data:{},
        url:'/maintain/setup-maintainer/',
        beforeSend :function(xmlHttp){
                    xmlHttp.setRequestHeader("If-Modified-Since","0");
                    xmlHttp.setRequestHeader("Cache-Control","no-cache");
                },
        success:function(result){
            if(result['code'] === 200){
                console.log(result['data'])
                data = result['data']
                var str='<option value=""></option>'
                for(var i=2; i<data.length; i++){
                    str =str+'<option value='+data[i].Id+'>'+data[i].Name+'</option>'
                }
//                console.log(str)
                $('#setup_main_maintainers').html(str);
                $('#setup_main_maintainers').selectpicker('refresh');
            }
        }
    })
}
//设备保养监控
function monitor(number1,number2,number3,number4,endtime,startime){
    var index = -1;
    var datas = new Array()
    var all_num = 0
    if(number1 != 0){
        var map = 0
        for(var i = 0;i < number1.length;i ++){
            map += number1[i][1]
            all_num += number1[i][1]
        }
        datas.push({"value":map, "name":"正常","itemStyle":{color: '#28a745'}})
    }
    if(number2 != 0){
        var map = 0
        for(var i = 0;i < number2.length;i ++){
           map += number2[i][1]
           all_num += number2[i][1]
        }
        datas.push({"value":map, "name":"预警","itemStyle":{color: '#ffc107'}})
    }
    if(number3 != 0){
        var map = 0
        for(var i = 0;i < number3.length;i ++){
            map += number3[i][1]
            all_num += number3[i][1]
        }
        datas.push({"value":map, "name":"超标","itemStyle":{color: '#dc3545'}})
    }
    if(number4 != 0){
        all_num += number4[0][1]
        datas.push({"value":number4[0][1], "name":"未设定","itemStyle":{color:'#17a2b8'}})
    }
    // 基于准备好的dom，初始化echarts实例
    echarts.init(document.getElementById('maintain')).dispose();
    var myChart = echarts.init(document.getElementById('maintain'));
    // 指定图表的配置项和数据
    var option = {
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c} ({d}%)"
        },
        legend: {
            orient: 'vertical',
            x: 'left',
            data:['正常','预警','超标','未设定'],
        }, 
        series: [
            {
                name:'数值样本',
                type:'pie',
                radius : ['25%','50%'],
                center: ['50%', '50%'],
                label: {
                    normal: {
                        formatter: "{b|{b}:}{per|{d}%}",
                        rich: {
                            c: {
                                fontSize: 10,
                                lineHeight:25
                            },
                            per: {
                                padding:[2,4],
                                borderRadius:2
                            }
                        }
                    }
                },
                data:datas
            }
        ]
    };
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
    myChart.on('click', function (params) {
        if(index == -1||index != params.dataIndex){
            myChart.dispatchAction({type: 'pieSelect',dataIndex:params.dataIndex});
            myChart.dispatchAction({type: 'pieUnSelect',dataIndex:params.dataIndex});
            page_train={'page':'1','num':'10'}; 
            visual_monitor_post = {}
            maintain_monitor_visual(params.color)
            index = params.dataIndex;
        }else{
            myChart.dispatchAction({type: 'pieSelect',dataIndex:params.dataIndex});
            myChart.dispatchAction({type: 'pieUnSelect',dataIndex:params.dataIndex});
            page_train={'page':'1','num':'10'}; 
            main_m_query(); 
            visual_monitor_post = {}
            index = -1;
        }
    });
    set_main_data(all_num,endtime,startime)
}

var namenum = {}
function monitor_name(num){
    namenum = num;
    var names = new Array()
    var nor = new Array()
    var war = new Array()
    var none = new Array()
    var danger = new Array()
    for(var i = 0;i < num.length;i ++){
        names.push(num[i][0])
        if(num[i][1] == 0){nor.push(null)}else{nor.push(num[i][1])}
        if(num[i][2] == 0){war.push(null)}else{war.push(num[i][2])}
        if(num[i][3] == 0){danger.push(null)}else{danger.push(num[i][3])}
        if(num[i][4] == 0){none.push(null)}else{none.push(num[i][4])}
    }
    var myChart1 = echarts.init(document.getElementById('maintain_name'));
    var option1 = {
        tooltip:{
            trigger: 'axis',
            axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            }
        },
        legend: {
            data: ['正常', '预警','超标','None']
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        yAxis:  {
            type: 'value'
        },
       /*  xAxis: {
            type: 'category',
            data: name
        },  */
        xAxis: [
            {
                type: 'category',
                data: names,
                axisLabel:{
                    interval:0,//横轴信息全部显示
                    rotate:45,// -20度角倾斜显示
                }

            }
        ],

   /*      dataZoom: [{
            type: 'slider',
            show: true, //flase直接隐藏图形
            xAxisIndex: [0],
            left: '9%', //滚动条靠左侧的百分比
            bottom: -5,
            start: 0,//滚动条的起始位置
            end: 20 //滚动条的截止位置（按比例分割你的柱状图x轴长度）
        }], */
        color: ['#28a745','#ffc107','#dc3545','#17a2b8'],
        series: [
            {
                name: '正常',
                type: 'bar',
                stack: '总量',
                label: {
                    normal: {
                        show: true,
                        position: 'inside'
                    }
                },
                data: nor
            },
            {
                name: '预警',
                type: 'bar',
                stack: '总量',
                label: {
                    normal: {
                        show: true,
                        position: 'inside'
                    }
                },
                data: war
            },
            {
                name: '超标',
                type: 'bar',
                stack: '总量',
                label: {
                    normal: {
                        show: true,
                        position: 'inside'
                    }
                },
                data: danger
            },
            {
                name: 'None',
                type: 'bar',
                stack: '总量',
                label: {
                    normal: {
                        show: true,
                        position: 'inside'
                    }
                },
                data: none
            },
        ]
    };
    myChart1.setOption(option1);
}

//找回密码
function Retrieve_pwd(){
    var uname = $("#userName").val()
    
    if(uname == ''){
        window.message.showError("UserName cannot be empty!")
    }else{
        $.ajax({
            type:"POST",
            url:"/login/Retrieve_password/",
            data:{
                uname:uname
            },
            success:function(data){
                if(data['code'] === 200){
                    window.message.showSuccess(data["message"])
                }else{
                    window.message.showError(data["message"])
                }
            }
        })
    }
}
//设置设备保养的时间和总数
function set_main_data(total,end,start){
    /* var end_time = datatimes[0]
    var start_time = datatimes[1] */
    $("#main_start_time").val(start)
    $("#main_end_time").val(end)
    $("#main_time").html(start+" ~ "+end)
    $("#main_total").html(total)
}

//设置设备NG率时间和总数
function set_ng_data(total,end,start){
    /* var end_time = datatimes[0]
    var start_time = datatimes[1] */
    $("#start_time").val(start)
    $("#end_time").val(end)
    $("#ng_time").html(start+" ~ "+end)
    $("#ng_total").html(total)
}

//设置统计分析的时间和总数
function set_data_num(total,starttime,endtime){
   /*  console.log(datatimes)
    var end_time = new Date().format("yyyy-MM-dd");
    var start_time = addDate(end_time,-7) */
    var end_time = starttime
    var start_time = endtime
    $("#min").val(start_time)
    $("#max").val(end_time)
    $("#num_time").html(start_time+" ~ "+end_time)
    $("#total").html(total)
}

$(document).ready(function(){
    $("#total_num").change(function(){
        query_info_data();
    })     
})

function get_FromID(){
    $.ajax({
        type:"GET",
        url:"/index/BudgetCode-set-num/",
        success:function(data){
            if(data['code'] === 200){
                $("#From_ID").html(data['data']['Number'])
            }else{
                window.message.showError(data["message"])
            }
        }
    })
}
var date = new Date();  
var newyear = date.getFullYear();     //得到当前日期年份
newyear = newyear.toString().substr(2, 2);//取两位
var newmonth = date.getMonth() + 1;   //得到当前日期月份（注意： getMonth()方法一月为 0, 二月为 1, 以此类推。）
var day = date.getDate();            //得到当前某日日期（1-31）
var hour = date.getHours();
var min = date.getMinutes();
var sec = date.getSeconds();
sec = (sec<10 ? "0"+sec:sec);
newmonth = (newmonth<10 ? "0"+newmonth:newmonth);  //10月以下的月份自动加0
var last = Math.floor(Math.random()*10+1)
var newdate =newyear+newmonth+day+hour+min+sec+last;
console.log(newdate)
/* //日期格式化
Date.prototype.format = function(fmt){ 
  var o = {   
    "M+" : this.getMonth()+1,                 //月份   
    "d+" : this.getDate(),                    //日   
    "h+" : this.getHours(),                   //小时   
    "m+" : this.getMinutes(),                 //分   
    "s+" : this.getSeconds(),                 //秒   
    "q+" : Math.floor((this.getMonth()+3)/3), //季度   
    "S"  : this.getMilliseconds()             //毫秒   
  };   
  if(/(y+)/.test(fmt))   
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
  for(var k in o)   
  if(new RegExp("("+ k +")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
  return fmt;   
} 
console.log()
//日期计算
function addDate(date,days){ 
    var d=new Date(date);
    d.setDate(d.getDate()+days); 
    var m=d.getMonth()+1; 
    return d.getFullYear()+'-'+m+'-'+d.getDate(); 
} */

//条码刷入的复选框勾选事件
function checkboxOnclick(checkbox){
    if ( checkbox.checked == true){
        $("#query_main_sn").focus()
    } 
}

//判断是不是回车键输入
function checkenter(e){
    var keynum;
    keynum = window.event ? e.keyCode : e.which;
    if(keynum == 13){
        query_main()
        $("#query_main_sn").val("")
    }

}