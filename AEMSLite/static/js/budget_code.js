//分页功能 预算编码清单 的全局变量 默认的
var page_obj = {'page':'1','num':'10'}

$(document).ready(function(){
     $("#setup_page").change(function(){
        var page_number = $(this).children('option:selected').val()
        page_obj['num']=page_number.toString()
        page_obj['page'] = '1'
        if(page_number == 'All'){
            $("#previous_page").parent().addClass("disabled")
            $("#next_page").parent().addClass("disabled")
        }
        if(page_number != 'All'){
            $("#previous_page").parent().removeClass("disabled")
            $("#next_page").parent().removeClass("disabled")
        }
            budget_ajax();
     })
     
})
//上一页页码的转换
function prev_page(){
    if(page_obj['page'] == '1')(
        $("#previous_page").parent().addClass("disabled")
    )
    if(page_obj['page'] != '1' && page_obj['num'] != 'All'){
    page_obj['page']= (Number(page_obj['page'])-1).toString()
    $("#next_page").parent().removeClass("disabled")
        budget_ajax();
    }
}
//下一页的页面转换
function next_page(){
    if(page_obj['num'] != 'All'){
    page_obj['page']= (Number(page_obj['page'])+1).toString()
     $("#previous_page").parent().removeClass("disabled")
        budget_ajax();
    }
}
//自动触发事件
$(function(){         
    $("#bd_gt").trigger("click");   
    $("#previous_page").parent().addClass("disabled")  
})
//主页的目录切换控制
function budget(){
    $(".budget").removeClass("yc")
    $(".user").addClass("yc")
    $(".ng").addClass("yc")
    $(".budgetform").addClass("yc")
    $(".merge").addClass("yc")
    $(".detail").addClass("yc")
    $(".maintain").addClass("yc")
    $(".statistic").addClass("yc")
    $(".modifypwd").addClass("yc")
    $(".main_monitor").addClass("yc")
    page_obj = {'page':'1','num':'10'}
    budget_ajax();
}

function budget_ajax(){
    $.ajax({
        'type':'GET',
        'url':'/index/Budget-code-apply/',
        'data':page_obj,
        success:function(result){
            if(result['code'] === 200){
                $('#bud_code_info').empty();
                data_form_info = result['data'].data
                console.log(data_form_info)
                for(var a=0; a<data_form_info.length; a++){
                    data_form_info[a].ApplyDate = (data_form_info[a].ApplyDate).split("T")[0]
                    if (data_form_info[a].BillingType == "0"){data_form_info[a].BillingType = "單獨開單",data_form_info[a].MergeId = "null"}
                    if (data_form_info[a].BillingType == "1"){data_form_info[a].BillingType = "合併開單"}
                    if (data_form_info[a].BudgetCode == null){data_form_info[a].BudgetCode = ""}
                    if (data_form_info[a].FormId == null){data_form_info[a].FormId = ""}
                    if (data_form_info[a].Status == "Draft"){
                     Status_class = ""
                     data_form_info[a].BillingType = ""
                     }
                    if (data_form_info[a].Status == "Reject"){ Status_class = "badge-danger" }
                    if (data_form_info[a].Status == "Process"){ Status_class = "badge-warning" }
                    if (data_form_info[a].Status == "Approve"){ Status_class = "badge-success" }
                    if (data_form_info[a].Status == "Ongoing"){ Status_class = "badge-success" }
                    if (data_form_info[a].Status == "Cancel"){ Status_class = "badge-danger" }

                    var product_name =  data_form_info[a].ProductName;
                    if(product_name && product_name.length > 10)
                    {
                        var ellipsis = "<font color=\"blue\">...</font>";
                        var sub_pro_name = product_name.substring(0,10);
                        product_name_show = "<span data-toggle=\"popover\" data-trigger=\"hover click\" data-content=\""+ product_name +"\">" + sub_pro_name + ellipsis + "</span>";

                    }
                    else
                        product_name_show = product_name;

                    if (data_form_info[a].Status == "Approve"){
                        var bud_form ='<tr>'
                              +'<td>'
                                +'<span onclick="modify_budget($(this));"><img alt="Add" src="/static/images/icon_modify.gif"></span>'
                                +'<span onclick="copy_budget();" data-toggle="modal" data-target="#copy_budget" ><img  alt="Copy" src="/static/images/copy.png"></span>'
                              +'</td>'
                              +'<td class="yc">'+data_form_info[a].Id+'</td>'
                              +'<td>'+data_form_info[a].FormId+'</td>'
                              +'<td>'+data_form_info[a].BillingType+'</td>'
                              +'<td>'+data_form_info[a].Department+'</td>'
                              +'<td>'+data_form_info[a].ApplyDate+'</td>'
                              +'<td>'+data_form_info[a].Pic+'</td>'
                              +'<td>'+product_name_show+'</td>'
                              +'<td>'+data_form_info[a].Signer+'</td>'
                              +'<td><span class="badge '+Status_class+'">'+data_form_info[a].Status+'</span></td>'
                              +'<td>'+data_form_info[a].BudgetCode+'</td>'
                              +'<td>'
                                +'<a href="#" onclick="detail_budget('+data_form_info[a].Id+','+data_form_info[a].MergeId+',4);">详细...</a>'
                              +'</td>'
                            +'</tr>'
                            $('#bud_code_info').append(bud_form)
                    }else if(data_form_info[a].Status == "Process"){
                        var bud_form ='<tr>'
                          +'<td>'
                            +'<span onclick="modify_budget($(this));"><img alt="Add" src="/static/images/icon_modify.gif"></span>'
                            +'<span onclick="copy_budget();" data-toggle="modal" data-target="#copy_budget" ><img  alt="Copy" src="/static/images/copy.png"></span>'
                            +'<span  onclick="delete_budget();" data-toggle="modal" data-target="#remove_budget"><img  alt="Delete" src="/static/images/icon_del.gif"></span>'
                          +'</td>'
                          +'<td class="yc">'+data_form_info[a].Id+'</td>'
                          +'<td>'+data_form_info[a].FormId+'</td>'
                          +'<td>'+data_form_info[a].BillingType+'</td>'
                          +'<td>'+data_form_info[a].Department+'</td>'
                          +'<td>'+data_form_info[a].ApplyDate+'</td>'
                          +'<td>'+data_form_info[a].Pic+'</td>'
                          +'<td>'+product_name_show+'</td>'
                          +'<td>'+data_form_info[a].Signer+'</td>'
                          +'<td><span class="badge '+Status_class+'">'+data_form_info[a].Status+'</span></td>'
                          +'<td>'+data_form_info[a].BudgetCode+'</td>'
                          +'<td>'
                                +'<a href="#" onclick="detail_budget('+data_form_info[a].Id+','+data_form_info[a].MergeId+',4);">详细...</a>'
                          +'</td>'
                        +'</tr>'
                        $('#bud_code_info').append(bud_form)
                    }else{
                        var bud_form ='<tr>'
                          +'<td>'
                            +'<span onclick="modify_form($(this));"><img alt="Add" src="/static/images/icon_modify.gif"></span>'
                            +'<span onclick="copy_budget();" data-toggle="modal" data-target="#copy_budget" ><img  alt="Copy" src="/static/images/copy.png"></span>'
                            +'<span  onclick="delete_budget();" data-toggle="modal" data-target="#delete_budget"><img  alt="Delete" src="/static/images/icon_del.gif"></span>'
                          +'</td>'
                          +'<td class="yc">'+data_form_info[a].Id+'</td>'
                          +'<td>'+data_form_info[a].FormId+'</td>'
                          +'<td>'+data_form_info[a].BillingType+'</td>'
                          +'<td>'+data_form_info[a].Department+'</td>'
                          +'<td>'+data_form_info[a].ApplyDate+'</td>'
                          +'<td>'+data_form_info[a].Pic+'</td>'
                          +'<td>'+product_name_show+'</td>'
                          +'<td>'+data_form_info[a].Signer+'</td>'
                          +'<td><span class="badge '+Status_class+'">'+data_form_info[a].Status+'</span></td>'
                          +'<td>'+data_form_info[a].BudgetCode+'</td>'
                          +'<td>'
                                +'<a href="#" onclick="detail_budget('+data_form_info[a].Id+','+data_form_info[a].MergeId+',4);">详细...</a>'
                          +'</td>'
                        +'</tr>'
                        $('#bud_code_info').append(bud_form)
                    }
                }
                popover_show();
                data_count = result['data'].page_count
                if(Number(page_obj['page']) == 1){
                    $("#previous_page").parent().addClass("disabled")
                }
                if(Number(page_obj['page']) == data_count){
                    $("#next_page").parent().addClass("disabled")
                }
            }else{
                $("#next_page").parent().addClass("disabled")
            }
        }
    })
}





//预算编码的申请页面的控制并且获取部门和客户信息
function budgetform(cus_dep_obj){
    $(".budgetform").removeClass("yc")
    $(".budget").addClass("yc")
    $("#submit_form")[0].reset()
    $.ajax({
        'type':'GET',
        'url':'/index/Budget-info-get/',
        'data':{},
        beforeSend :function(xmlHttp){
            xmlHttp.setRequestHeader("If-Modified-Since","0");
            xmlHttp.setRequestHeader("Cache-Control","no-cache");
        },
        success:function(result){
            console.log(result['data'])
            if(result['code'] === 200){
                if(cus_dep_obj.length == 0){
                    $("#From_ID").html(result['data']['Number'])
                    //部门
                    $('#depart_selector').empty();
                    data_depart = result['data']['department']
                    $('#depart_selector').append('<option > </option>')
                    for(var a=0; a<data_depart.length; a++){
                        var department ='<option value='+data_depart[a].Department+'>'+data_depart[a].Department+'</option>'
                        $('#depart_selector').append(department)
                    }
                    //客户
                    $('#customer_selector').empty();
                    data_customer = result['data']['customer']
                    $('#customer_selector').append('<option ></option>')
                    for(var i=0; i<data_customer.length; i++){
                        var customer ='<option value='+data_customer[i].Customer+'>'+data_customer[i].Customer+'</option>'
                        $('#customer_selector').append(customer)
                    }
                    //会计科目
                    $('#budget_type').empty();
                    data_account = result['data']['Account']
                    $('#budget_type').append('<option ></option>')
                    for(var i=0; i<data_account.length; i++){
//                        data_account[i].Type =change_title(data_account[i].Rule)
                        var accounts ='<option value='+data_account[i].Rule+'>'+data_account[i].Type+'</option>'
                        $('#budget_type').append(accounts)
                    }


                    //币种选中
                    //机种
                    $('#bud_mach_type').empty();
                    data_projects = result['data']['projects']
                    $('#bud_mach_type').append('<option ></option>')
                    for(var i=0; i<data_projects.length; i++){
                        var projects ='<option value="'+data_projects[i].Name+'">'+data_projects[i].Name+'('+data_projects[i].Code+')</option>'
                        console.log(projects)
                        $('#bud_mach_type').append(projects)
                    }

                }else{

                    //部门选中
                    $('#depart_selector').empty();
                    data_depart = result['data']['department']
                    for(var a=0; a<data_depart.length; a++){
                        if(data_depart[a].Department == cus_dep_obj[0]){
                            var department ='<option value='+data_depart[a].Department+' selected>'+data_depart[a].Department+'</option>'
                            $('#depart_selector').append(department)
                        }else{
                            var department ='<option value='+data_depart[a].Department+'>'+data_depart[a].Department+'</option>'
                            $('#depart_selector').append(department)
                        }
                    }

                    //客户选中
                    $('#customer_selector').empty();
                    data_customer = result['data']['customer']
                    for(var i=0; i<data_customer.length; i++){
                        if(data_customer[i].Customer == cus_dep_obj[1]){
                            var customer ='<option value='+data_customer[i].Customer+' selected>'+data_customer[i].Customer+'</option>'
                            $('#customer_selector').append(customer)
                        }else{
                            var customer ='<option value='+data_customer[i].Customer+'>'+data_customer[i].Customer+'</option>'
                            $('#customer_selector').append(customer)
                        }
                    }

                    //会计科目选中
                    $('#budget_type').empty();
                    data_accounts = result['data']['Account']
                    for(var i=0; i<data_accounts.length; i++){
//                        data_accounts[i].Type =change_title(data_accounts[i].Rule)
                        if(data_accounts[i].Type == cus_dep_obj[2]){
                            var accounts ='<option value='+data_accounts[i].Rule+' selected>'+data_accounts[i].Type+'</option>'
                            $('#budget_type').append(accounts)
                        }else{
                            var accounts ='<option value='+data_accounts[i].Rule+'>'+data_accounts[i].Type+'</option>'
                            $('#budget_type').append(accounts)
                        }
                    }

                    //币种选中


                    //机种选中
                    $('#bud_mach_type').empty();
                    data_projects = result['data']['projects']
                    for(var i=0; i<data_projects.length; i++){
                        if(data_projects[i].Name == cus_dep_obj[3] && data_projects[i].Code == cus_dep_obj[4]){
                            var projects ='<option value="'+data_projects[i].Name+'" selected>'+data_projects[i].Name+'('+data_projects[i].Code+')</option>'
                            $('#bud_mach_type').append(projects)
                        }else{
                            var projects ='<option value="'+data_projects[i].Name+'">'+data_projects[i].Name+'('+data_projects[i].Code+')</option>'
                            $('#bud_mach_type').append(projects)
                        }
                    }
                }
            }else{
                alert(result['message']);
            }
        }
    })
}

//检查负责人和签核人的存在性--on change 事件的实现
function my_principal(obj){
    data = {'principal':obj.value,}
    $.ajax({
        'type':'POST',
        'url':'/index/Budget-check-principal/',
        'data':data,
        success:function(result){
            if(result['code'] === 200){
                $("#bud_principal")[0].style.border="1px solid green";
                console.log(result)

                $("#bud_principal").val(result['data'].Name)
            }else{
                $("#bud_principal").val("")
                console.log(result['message'])
            }
        }
    })
}
//                window.message.showError(result['message'])
//                $("#bud_principal")[0].style.border="1px solid red";

function my_user(obj){
    data = {'user_approve':obj.value,}
    $.ajax({
        'type':'POST',
        'url':'/index/Budget-check-user/',
        'data':data,
        success:function(result){
            if(result['code'] === 200){
                $("#bud_user")[0].style.border="1px solid green";
            }else{
                $("#bud_user")[0].style.border="1px solid red";
                $("#bud_user").val("")
                window.message.showError(result['message'])
            }
        }
    })
}

//简单计算费用到界面上去
//function count_fe(){
//    var machao = $("#moneys").val()
//    var bud_request_type = $("#budget_type").val()
//    var bud_price = $("#p_price").val()
//    var bud_qty = $("#p_qty").val()
//    var rate_data=0
//    var shuang = "CNY"
//    var data={"machao":machao,"shuang":shuang}
//    if (bud_price == ""){bud_price = 0}
//    if (bud_qty == ""){bud_qty = 0}
//    var sum = bud_price * bud_qty;
//    sum =sum.toFixed(2)
//    $("#count_fee").val(sum);
////    if(machao !="" && bud_price !="" && bud_qty !="" && bud_request_type !=""){
////        $.ajax({
////            'type':'POST',
////            'data':data,
////            'url':'/index/BudgetCode-rate/',
////            success:function(result){
////                if(result['code'] === 200){
////                    rate_data=result['data']
////                    console.log(rate_data)
////                    sum=sum*rate_data.rate
////                    if(bud_request_type == "1"){$("#month_fee").val(sum);}
////                    if(bud_request_type == "2"){
////                        sum =sum/12
////                        sum =sum.toFixed(2)
////                        $("#month_fee").val(sum);
////                    }
////                    if(bud_request_type == "3"){
////                        sum =sum/24
////                        sum =sum.toFixed(2)
////                        $("#month_fee").val(sum);
////                    }
////                    if(bud_request_type == "4"){
////                        sum =sum/36
////                        sum =sum.toFixed(2)
////                        $("#month_fee").val(sum);
////                    }
////                    if(bud_request_type == "5"){
////                        sum =sum/72
////                        sum =sum.toFixed(2)
////                        $("#month_fee").val(sum);
////                    }
////
////                }else{
////                    alert(result['message'])
////                }
////            }
////        })
////    }else{
////    }
//}
function mon_fee(){
    var machao = $("#moneys").val()
    var bud_request_type = $("#budget_type").val()
    var bud_price = $("#p_price").val()
    var bud_qty = $("#p_qty").val()
    var rate_data=0
    var shuang = "CNY"
    var data={"machao":machao,"shuang":shuang}
    if (bud_price == ""){bud_price = 0,$("#month_fee").val(0)}
    if (bud_qty == ""){bud_qty = 0,$("#month_fee").val(0)}
    if(machao ==""){$("#month_fee").val(0)}
    if(bud_request_type ==""){$("#month_fee").val(0)}
    var sum = bud_price * bud_qty;
    sum =sum.toFixed(2)

    if(machao !="" &&  bud_request_type !="" && bud_price !="" && bud_qty !=""){
        $.ajax({
            'type':'POST',
            'data':data,
            'url':'/index/BudgetCode-rate/',
            success:function(result){
                if(result['code'] === 200){
                    rate_data=result['data']
                    console.log(rate_data)
                    if(rate_data!=0){
                        sum=(sum*rate_data.rate).toFixed(2)
                    }
                    $("#count_fee").val(sum)
                    if(bud_request_type == "1"){
                        $("#month_fee").val(sum);
                    }
                    if(bud_request_type == "2"){
                        sum =sum/12
                        sum =sum.toFixed(2)
                        $("#month_fee").val(sum);
                    }
                    if(bud_request_type == "3"){
                        sum =sum/24
                        sum =sum.toFixed(2)
                        $("#month_fee").val(sum);
                    }
                    if(bud_request_type == "4"){
                        sum =sum/36
                        sum =sum.toFixed(2)
                        $("#month_fee").val(sum);
                    }
                    if(bud_request_type == "5"){
                        sum =sum/72
                        sum =sum.toFixed(2)
                        $("#month_fee").val(sum);
                    }

                }else{
                    $("#moneys").val("")
                    alert(result['message'])
                }
            }
        })
    }else{
//        alert("red mark need set value")
    }
}

//提交表单和保存文件到服务器的函数并发送给签核人process
function sub_budget_code(){
    $('#mask_div').show_mask();
    //默认是前后是没有空格的
    var formData=new FormData($("#submit_form")[0]);
    bud_id = $("#budgetId").val()
    bud_time = $("#datepicker1").val()

    bud_principal = $("#bud_principal").val()
    bud_machine_name = $("#bud_machine_name").val()
    bud_machine_type = $("#bud_machine_type").val()
    p_price = $("#p_price").val()
    p_qty = $("#p_qty").val()
    bud_user = $("#bud_user").val()
    bud_reason = $("#bud_reason").val().trim()
    account_type = $("#budget_type option:selected").text()  //类别
    bud_formId = $("#From_ID").html()

    formData.append("account_type",account_type)
    formData.append("bud_formId",bud_formId)
//    console.log(formData.get("account_type"))  IE浏览器不支持
//    console.log(formData.get("bud_formId"))
    //验证不能为空的部分
    Department = $("#depart_selector").val()
    Remark = $("#Remark").val()
    Form_type = $("#bud_num_type").val()
    Form_unit = $("#bud_qty_type").val()                  //单位
    Form_money_type = $("#moneys").val()                  //币种
    Form_customer = $("#customer_selector").val()                  //客户
    Project_type = $("#bud_mach_type").val()                  //机种
    if(Department == ""){
        window.message.showError("Department cannot empty")
        $('#mask_div').hide_mask();
        return false;
    }
    if(Remark == ""){
        window.message.showError("Remark cannot empty")
        $('#mask_div').hide_mask();
        return false;
    }
    if(Form_type == ""){
        window.message.showError("Form_type cannot empty")
        $('#mask_div').hide_mask();
        return false;
    }
    if(Form_unit == ""){
        window.message.showError("Form_unit cannot empty")
        $('#mask_div').hide_mask();
        return false;
    }
    if(Form_money_type == ""){
        window.message.showError("Form_money_type cannot empty")
        $('#mask_div').hide_mask();
        return false;
    }
    if(Form_customer == ""){
        window.message.showError("Form_customer cannot empty")
        $('#mask_div').hide_mask();
        return false;
    }
//    if(bud_principal == ''){
//        window.message.showError("PIC cannot empty")
//        $('#mask_div').hide_mask();
//        return false;
//    }
    if(bud_machine_name == ''){
        window.message.showError("machine name cannot empty")
        $('#mask_div').hide_mask();
        return false;
    }
    if(p_price == ''){
        window.message.showError("price cannot empty")
        $('#mask_div').hide_mask();
        return false;
    }
    if(p_qty == ''){
        window.message.showError("machine qty cannot empty")
        $('#mask_div').hide_mask();
        return false;
    }
    if(!/^\d+$/.test(p_qty)){
         window.message.showError("machine qty type error");
         $('#mask_div').hide_mask();
         return false;
    }
    if(bud_user == ''){
        window.message.showError("signer cannot empty")
        $('#mask_div').hide_mask();
        return false;
    }
    if(bud_reason == ''){
        window.message.showError("reason cannot empty")
        $('#mask_div').hide_mask();
        return false;
    }
    if(Project_type == ''){
        window.message.showError("machine type cannot empty")
        $('#mask_div').hide_mask();
        return false;
    }
    var num=$("#bud_count_qty").html()
    $.ajax({
        'type':'POST',
        'url':'/index/Budget-code-apply/',
        'data':formData,
        processData:false,
        contentType:false,
        success:function(result){
            if(result['code'] === 200){
                window.message.showSuccess(result['message'])
                budget();
                $("#bud_count_qty").html(Number(num)+1)
            }else{
                alert(result['message'])
            }
            $('#mask_div').hide_mask();
        }
    })
}

//保存为Draft 表单save_budget_code();
function save_budget_code(){
    $('#mask_div').show_mask();
    var formData=new FormData($("#submit_form")[0]);
    bud_id = $("#budgetId").val()
    bud_time = $("#datepicker1").val()
    bud_principal = $("#bud_principal").val()
    bud_machine_name = $("#bud_machine_name").val()
    bud_machine_type = $("#bud_machine_type").val()
    p_price = $("#p_price").val()
    p_qty = $("#p_qty").val()
    bud_user = $("#bud_user").val()
    bud_reason = $("#bud_reason").val().trim()
    account_type = $("#budget_type option:selected").text()
    bud_formId = $("#From_ID").html()
    formData.append("account_type",account_type)
    formData.append("bud_formId",bud_formId)
//    console.log(formData.get("account_type"))IE 浏览器不支持
//    console.log(formData.get("bud_formId"))
    //验证不能为空的部分
    Department = $("#depart_selector").val()
    Remark = $("#Remark").val()
    Form_type = $("#bud_num_type").val()
    Form_unit = $("#bud_qty_type").val()                  //单位
    Form_money_type = $("#moneys").val()                  //币种
    Form_customer = $("#customer_selector").val()                  //客户
    Project_type = $("#bud_mach_type").val()                  //机种
    if(Department == ""){
        window.message.showError("Department cannot empty")
        $('#mask_div').hide_mask();
        return false;
    }
    if(Remark == ""){
        window.message.showError("Remark cannot empty")
        $('#mask_div').hide_mask();
        return false;
    }
    if(Form_type == ""){
        window.message.showError("Form_type cannot empty")
        $('#mask_div').hide_mask();
        return false;
    }
    if(Form_unit == ""){
        window.message.showError("Form_unit cannot empty")
        $('#mask_div').hide_mask();
        return false;
    }
    if(Form_money_type == ""){
        window.message.showError("Form_money_type cannot empty")
        $('#mask_div').hide_mask();
        return false;
    }
    if(Form_customer == ""){
        window.message.showError("Form_customer cannot empty")
        $('#mask_div').hide_mask();
        return false;
    }
//    if(bud_principal == ''){
//        window.message.showError("PIC not empty")
//        $('#mask_div').hide_mask();
//        return false;
//    }
    if(bud_machine_name == ''){
        window.message.showError("machine name cannot empty")
        $('#mask_div').hide_mask();
        return false;
    }
    if(p_price == ''){
        window.message.showError("price cannot empty")
        $('#mask_div').hide_mask();
        return false;
    }
    if(p_qty == ''){
        window.message.showError("machine qty cannot empty")
        $('#mask_div').hide_mask();
        return false;
    }
    if(bud_user == ''){
        window.message.showError("signer cannot empty")
        $('#mask_div').hide_mask();
        return false;
    }
    if(bud_reason == ''){
        window.message.showError("reason cannot empty")
        $('#mask_div').hide_mask();
        return false;
    }
    if(Project_type == ''){
        window.message.showError("Machine type cannot empty")
        $('#mask_div').hide_mask();
        return false;
    }                  //机种
//    if(formData.get("bud_id").length == 0){formData.set("bud_id","")}
//    if(formData.get("bud_time").length == 0){formData.set("bud_time","")}
//    if(formData.get("bud_principal") == ''){
//        window.message.showError("PIC not empty")
//        return false;
//    }
//    if(formData.get("bud_machine_name") == ''){
//        window.message.showError("machine name cannot empty")
//        return false;
//    }
//    if(formData.get("bud_price") == ''){
//        window.message.showError("price cannot empty")
//        return false;
//    }
//    if(formData.get("bud_qty") == ''){
//        window.message.showError("machine qty cannot empty")
//        return false;
//    }
//    if(formData.get("bud_user") == ''){
//        window.message.showError("signer cannot empty")
//        return false;
//    }
    $.ajax({
        'type':'POST',
        'url':'/index/Budget-form-save/',
        'data':formData,
        processData:false,
        contentType:false,
        success:function(result){
            if(result['code'] === 200){
//                console.log(result['data'])
                window.message.showSuccess(result['message'])
                budget();
            }else{
                alert(result['message'])
            }
            $('#mask_div').hide_mask();
        }
    })
}

//合并开单的页面获取Draft 状态的申请单
function merge(){
    $(".budget").addClass("yc")
    $(".merge").removeClass("yc")
    $.ajax({
        'type':'GET',
        'url':'/index/Budget-merge-order/',
        'data':{},
        success:function(result){
            if(result['code'] === 200){
                $('#megre_form').empty();
                data_meger = result['data']
                for(var a=0; a<data_meger.length; a++){
                    data_meger[a].ApplyDate = (data_meger[a].ApplyDate).split("T")[0]
                    if(data_meger[a].FormId == null){data_meger[a].FormId=""}

                    var meger_info_form ='<tr>'
                        +'<td>'
                            +'<input type="checkbox" class="input_class" id="merge_label_num" name="merged" >'
                            +'<label class ="yc" >'+data_meger[a].Id+'</label>'
                       +'</td>'
                      +'<td>'+data_meger[a].FormId+'</td>'
                      +'<td>'+data_meger[a].Department+'</td>'
                      +'<td>'+data_meger[a].ApplyDate+'</td>'
                      +'<td>'+data_meger[a].Pic+'</td>'
                      +'<td>'+data_meger[a].ProductName+'</td>'
                      +'<td>'+data_meger[a].Signer+'</td>'
                      +'<td>'+data_meger[a].Status+'</td>'
                    +'</tr>'
                    $('#megre_form').append(meger_info_form)
                }
            }else{
            }
        }
    })
}

//合併開單的提交數據函數
function meg_form(){
    $('#mask_div').show_mask();
    var check_select_form = $("table input[type=checkbox]:checked")
    var count_check = []
    if(check_select_form.length>=2){
        check_select_form.each(function(){
            count_check.push($(this).next().html());
        })
        data = {'ids':count_check,}
//        console.log(data)
        $.ajax({
            'type':'POST',
            'url':'/index/merge-sub/',
            'data':data,
            success:function(result){
                if(result['code'] === 200){
                    window.message.showSuccess(result['message'])
                    setTimeout(function(){  //使用  setTimeout（）方法设定定时4000毫秒
                    window.location.reload();//页面刷新
                    },1200);
                }else{
//                    window.message.showError(result['message'])
                        alert(result['message'])
                }
                $('#mask_div').hide_mask();
            }
        })
    }else{
        window.message.showError("select more than two checkbox")
    }
}

//修改表单
function modify_budget_info(){
    var modify_id =$("#budget_form_id_delete").val()
    var modify_date = $("#datepicker2").val()
    var modify_number =$("#bud_form_type").val()
    if(modify_number == ""){
        window.message.showError("form number can not empty")
        return false;
    }
    if(modify_date == ""){
        window.message.showError("date can not empty")
        return false;
    }
    data = {
        'modify_id':modify_id,
        'modify_date':modify_date,
        'modify_number':modify_number,
    }
    $.ajax({
        'type':'POST',
        'url':'/index/budget-modify-type/',
        'data':data,
        success:function(result){
            if(result['code'] === 200){
                window.message.showSuccess(result['message'])
                setTimeout(function(){  //使用  setTimeout（）方法设定定时4000毫秒
                window.location.reload();//页面刷新
                },1500);
            }else{
                alert(result['message'])
            }
        }
    })
}

//budget的图标操作
function modify_budget(obj){
    var id = obj.parent().parent().find("td").eq(1).text()
    $("#budget_form_id_delete").val(id)
    $("#modify_budget").modal("show")
    data={'id':id,}
    $.ajax({
        'type':'POST',
        'url':'/index/budget-detail-modify/',
        'data':data,
        success:function(result){
            if(result['code'] === 200){
                number = result['data'][0]
//                console.log(number)
                if(number.ExternalNumberEffectiveDate != null){
                    number_date=number.ExternalNumberEffectiveDate.split('T')[0];
                }else{
                    number_date="";
                }
//                console.log(number_date,number_date)
                $("#bud_form_type").val(number.ExternalNumber)
                $("#datepicker2").val(number_date)
            }else{
                alert(result['message'])
            }
        }
    })

}

//复制表单
function copy_bud(){
    var copy_id = $("#budget_form_id_copy").val()
    data ={'copy_id':copy_id,}
    $.ajax({
        'type':'POST',
        'url':'/index/budget-copy-type/',
        'data':data,
        success:function(result){
            if(result['code'] === 200){
                window.message.showSuccess(result['message'])
                budget();
            }else{
                window.message.showError(result['message'])
            }
        }
    })
}

//删除表单
function budget_del(){
//    $("tr").each(function(index) {
//        $("tr").eq(index).click(function() {
//            var b = $(this).find("td")
//            $("#delete_id_form").val(b[1].innerHTML)
//        });
//    });
    var del_id =$("#delete_id_form").val()
//    console.log(del_id)
    data = {'del_id':del_id,}
    $.ajax({
        'type':'POST',
        'url':'/index/budget-delete-type/',
        'data':data,
        success:function(result){
            if(result['code'] === 200){
                window.message.showSuccess(result['message'])
                setTimeout(function(){                       //使用  setTimeout（）方法设定定时1.2秒
                    window.location.reload();               //页面刷新
                },1200);
            }else{
                window.message.showError(result['message'])
            }
        }
    })
}

// 签核单号获取申请的数据
function signing(){
    $(".signing").removeClass("yc")
    $(".apply").addClass("yc")
    $(".signed").addClass("yc")
    $(".statement").addClass("yc")
    $(".ongoing").addClass("yc")
    $.ajax({
        'type':'GET',
        'url':'/index/budget-singing-info/',
        'data':{},
        beforeSend :function(xmlHttp){
            xmlHttp.setRequestHeader("If-Modified-Since","0");
            xmlHttp.setRequestHeader("Cache-Control","no-cache");
        },
        success:function(result){
            if(result['code'] === 200){
                $('#budget_sing_info').empty();
                singing_data = result['data']
                console.log(singing_data)
                singing_null_data = form_null_info(singing_data)
                for(var a=0; a<singing_null_data.length; a++){
                    if(singing_null_data[a].BillingType == "0"){
                        var Download_title="Download..."
                        singing_null_data[a].BillingType = "單獨開單"
                        singing_null_data[a].mergeId = "null"
                        if(singing_null_data[a].AttachmentPath == ""){singing_null_data[a].AttachmentPath="#",Download_title=""}
                        var product_name =  singing_null_data[a].ProductName;
                        if(product_name && product_name.length > 10)
                        {
                            var ellipsis = "<font color=\"blue\">...</font>";
                            var sub_pro_name = product_name.substring(0,10);
                            product_name_show = "<span data-toggle=\"popover\" data-trigger=\"hover click\" data-content=\""+ product_name +"\">" + sub_pro_name + ellipsis + "</span>";

                        }
                        else
                            product_name_show = product_name;

                        var singing_form ='<tr>'
                           +'<td>'
                                +'<button class="btn btn-primary btn-sm" onclick="singing_signed_budget();" data-toggle="modal" data-target="#signmodule">签核</button>'
                           +'</td>'
                          +'<td class ="yc">'+singing_null_data[a].Id+'</td>'
                          +'<td class ="yc">'+singing_null_data[a].MergeId+'</td>'
                          +'<td>'+singing_null_data[a].FormId+'</td>'
                          +'<td>'+singing_null_data[a].Department+'</td>'
                          +'<td>'+singing_null_data[a].applier+'</td>'
                          +'<td>'+singing_null_data[a].Customer+'</td>'
                          +'<td>'+singing_null_data[a].Project+'</td>'
                          +'<td>'+product_name_show+'</td>'
                          +'<td>'+singing_null_data[a].Model+'</td>'
                          +'<td>'+singing_null_data[a].UnitPrice+'</td>'
                          +'<td>'+singing_null_data[a].Quantity+'</td>'
                          +'<td>'+singing_null_data[a].count_price+'</td>'
                          +'<td>'+singing_null_data[a].ApplyReason+'</td>'
                          +'<td>'
                            +'<a href='+singing_null_data[a].AttachmentPath+' >'+Download_title+'</a>'
                          +'</td>'

//                          +'<td>'+singing_null_data[a].BillingType+'</td>'

//                          +'<td><span class="badge badge-warning">'+singing_null_data[a].Status+'</span></td>'
                          +'<td>'
                                +'<a href="#" onclick="detail_budget('+singing_null_data[a].Id+','+singing_null_data[a].mergeId+',1);">详细...</a>'
                          +'</td>'
                        +'</tr>'
                        $('#budget_sing_info').append(singing_form)
                    }
                }
                singing_data_qu_data = quchong(singing_data)
                singing_data_merged_info = form_merged_info(singing_data)
                for(var j=0; j<singing_data_qu_data.length; j++){
                    merged_flag= singing_data_qu_data[j].MergeId
                    var flag_count = 0;
                    for(var i=0; i<singing_data_merged_info.length; i++){
                        var Download_title="Download...."
                        singing_data_merged_info[i].BillingType = "合併開單"
                        console.log(singing_data_merged_info)
//                        singing_data_merged_info[i].ApplyDate = (singing_data_merged_info[i].ApplyDate).split("T")[0]
                        if(singing_data_merged_info[i].AttachmentPath == ""){singing_data_merged_info[i].AttachmentPath="#",Download_title=""}
                        if(merged_flag == singing_data_merged_info[i].MergeId){
                            flag_count = flag_count + 1;
                            flag_count_str = flag_count.toString()
                            var rowspan_MergeId = singing_data_merged_info[i].MergeId
                            var product_name =  singing_data_merged_info[i].ProductName;
                            if(product_name && product_name.length > 10)
                            {
                                var ellipsis = "<font color=\"blue\">...</font>";
                                var sub_pro_name = product_name.substring(0,10);
                                product_name_show = "<span data-toggle=\"popover\" data-trigger=\"hover click\" data-content=\""+ product_name +"\">" + sub_pro_name + ellipsis + "</span>";

                            }
                            else
                                product_name_show = product_name;

                            if(flag_count == 1){
                                var singing_form ='<tr>'
                                  +'<td rowspan='+flag_count_str+' id='+rowspan_MergeId+'>'
                                       +'<button class="btn btn-primary btn-sm" onclick="singing_signed_budget();" data-toggle="modal" data-target="#signmodule">签核</button>'
                                  +'</td>'
                                  +'<td class ="yc">'+singing_data_merged_info[i].Id+'</td>'
                                  +'<td class ="yc">'+singing_data_merged_info[i].MergeId+'</td>'
//                                  +'<td rowspan='+flag_count_str+' id='+rowspan_MergeId+'>'+singing_data_merged_info[i].BillingType+'</td>'
                                  +'<td>'+singing_data_merged_info[i].FormId+'</td>'
                                  +'<td>'+singing_data_merged_info[i].Department+'</td>'
                                  +'<td>'+singing_data_merged_info[i].applier+'</td>'
                                  +'<td>'+singing_data_merged_info[i].Customer+'</td>'
                                  +'<td>'+singing_data_merged_info[i].Project+'</td>'
                                  +'<td>'+product_name_show+'</td>'
                                  +'<td>'+singing_data_merged_info[i].Model+'</td>'
                                  +'<td>'+singing_data_merged_info[i].UnitPrice+'</td>'
                                  +'<td>'+singing_data_merged_info[i].Quantity+'</td>'
                                  +'<td>'+singing_data_merged_info[i].count_price+'</td>'
                                  +'<td>'+singing_data_merged_info[i].ApplyReason+'</td>'
                                  +'<td>'
                                        +'<a href='+singing_data_merged_info[i].AttachmentPath+' >'+Download_title+'</a>'
                                  +'</td>'
//                                  +'<td><span class="badge badge-warning" id='+rowspan_MergeId+'>'+singing_data_merged_info[i].Status+'</span></td>'
                                  +'<td rowspan='+flag_count_str+'  id='+rowspan_MergeId+'>'
                                    +'<a href="#" onclick="detail_budget('+singing_data_merged_info[i].Id+','+singing_data_merged_info[i].MergeId+',1);">详细...</a>'
                                  +'</td>'
                                +'</tr>'
                                $('#budget_sing_info').append(singing_form)
                            }
                            if(flag_count >=2){
                                document.getElementById(rowspan_MergeId).rowSpan = flag_count_str;
                                var singing_form ='<tr>'
                                  +'<td class ="yc">'+singing_data_merged_info[i].Id+'</td>'
                                  +'<td>'+singing_data_merged_info[i].FormId+'</td>'
                                  +'<td>'+singing_data_merged_info[i].Department+'</td>'
                                  +'<td>'+singing_data_merged_info[i].applier+'</td>'
                                  +'<td>'+singing_data_merged_info[i].Customer+'</td>'
                                  +'<td>'+singing_data_merged_info[i].Project+'</td>'
                                  +'<td>'+product_name_show+'</td>'
                                  +'<td>'+singing_data_merged_info[i].Model+'</td>'
                                  +'<td>'+singing_data_merged_info[i].UnitPrice+'</td>'
                                  +'<td>'+singing_data_merged_info[i].Quantity+'</td>'
                                  +'<td>'+singing_data_merged_info[i].count_price+'</td>'
                                  +'<td>'+singing_data_merged_info[i].ApplyReason+'</td>'
                                  +'<td>'
                                        +'<a href='+singing_data_merged_info[i].AttachmentPath+'>'+Download_title+'</a>'
                                  +'</td>'
                                  +'<td>'
                                    +'<a href="#" onclick="detail_budget('+singing_data_merged_info[i].Id+','+singing_data_merged_info[i].MergeId+',1);">详细...</a>'
                                  +'</td>'
                                +'</tr>'
                                $('#budget_sing_info').append(singing_form)
                            }
                        }
                    }
                }
                popover_show();
            }else{
            }
        }
    })
}

//签核模态框获取Id和信息
function singing_signed_budget(){
     $("tr").each(function(index) {
        $("tr").eq(index).click(function() {
            var a = $(this).find("td")
            $("#merged_Id_info").val(a[1].innerHTML)
            $("#merged_mergedId").val(a[2].innerHTML)
        });
    });
}

//签核表单内容提交数据
function signed_orm(){
    $('#mask_div').show_mask();
    var bud_id = $("#merged_Id_info").val()
    var bud_merged_id = $("#merged_mergedId").val()
    var budget_cod_text = $("#bu_code").val()
    var budget_text = $("#text_bud").val()
    if(budget_cod_text == ""){
        window.message.showError("Budget_code can not empty")
        $('#mask_div').hide_mask();
        return false;
    }
    data ={
        'bud_id':bud_id,
        'bud_merged_id':bud_merged_id,
        'budget_cod_text':budget_cod_text,
        'budget_text':budget_text,
    }
    console.log(data)
    var num=$("#bud_count_qty").html()
    $.ajax({
        'type':'POST',
        'url':'/index/merged-signed/',
        'data':data,
        success:function(result){
            if(result['code'] === 200){
                window.message.showSuccess(result['message'])
                signing();
                $("#bud_count_qty").html(num-1)
            }else{
                alert(result['data'])
                console.log(result["data"])
            }
            $('#mask_div').hide_mask();
        }
    })
}

//拒绝签核表单内容的提交数据
function reject_orm(){
    $('#mask_div').show_mask();
    var bud_id = $("#merged_Id_info").val()
    var bud_merged_id = $("#merged_mergedId").val()
    var budget_cod_text = $("#bu_code").val()
    var budget_text = $("#text_bud").val()
    if(budget_text == ""){
        window.message.showError("reject remark can't empty")
        $('#mask_div').hide_mask();
        return false;
    }
    data = {
        'bud_id':bud_id,
        'bud_merged_id':bud_merged_id,
        'budget_cod_text':budget_cod_text,
        'budget_text':budget_text,
    }
    var num=$("#bud_count_qty").html()
    $.ajax({
        'type':'POST',
        'url':'/index/merged-rejected/',
        'data':data,
        success:function(result){
            if(result['code'] === 200){
                signing();
                $("#bud_count_qty").html(num-1)
                window.message.showSuccess(result['message'])
            }else{
                window.message.showError(result['message'])
            }
            $('#mask_div').hide_mask();
        }
    })
}

//自动触发事件
//$(function(){   
//    $("#previous_signed").parent().addClass("disabled")
//})
var page_signed_obj = {'page':'1','num':'10'}
//选择一页显示数量
$(document).ready(function(){
     $("#signed_page_num").change(function(){
        var page_signed_number = $(this).children('option:selected').val()
        page_signed_obj['num']=page_signed_number.toString()
        page_signed_obj['page'] = '1'
        if(page_signed_number == 'All'){
            $("#previous_signed").parent().addClass("disabled")
            $("#next_signed").parent().addClass("disabled")
        }
        if(page_signed_number != 'All'){
            $("#previous_signed").parent().removeClass("disabled")
            $("#next_signed").parent().removeClass("disabled")
        }
        if(page_signed_obj['page'] == '1'){
            $("#previous_signed").parent().addClass("disabled")
        }
        signed_ajax();
        remove_box();
     })
})
//上一页页码的转换
function signed_previous_page(){
    if(page_signed_obj['page'] != '1' && page_signed_obj['num'] != 'All'){
    page_signed_obj['page']= (Number(page_signed_obj['page'])-1).toString()
    $("#next_signed").parent().removeClass("disabled")
    signed_ajax();
    remove_box();
    }
    if(page_signed_obj['page'] == '1')(
        $("#previous_signed").parent().addClass("disabled")
    )
}
//下一页的页面转换
function signed_next_page(){
    if(page_signed_obj['num'] != 'All'){
    page_signed_obj['page']= (Number(page_signed_obj['page'])+1).toString()
     $("#previous_signed").parent().removeClass("disabled")
    signed_ajax();
    remove_box();
    }
}
//签核过的表单的数据获取资料
function signed(){
    $(".signed").removeClass("yc")
    $(".apply").addClass("yc")
    $(".statement").addClass("yc")
    $(".signing").addClass("yc")
    $(".ongoing").addClass("yc")
    page_signed_obj = {'page':'1','num':'10'}
    signed_ajax();
}
function signed_ajax(){
    $.ajax({
        'type':'GET',
        'url':'/index/merged-signed-finished/',
        'data':page_signed_obj,
        success:function(result){
            if(result['code'] === 200){
                $('#signed_budget_info').empty();
                signed_data = result['data'].data
                console.log(signed_data)
                for(var a=0; a<signed_data.length; a++){
                    signed_data[a].ApplyDate = (signed_data[a].ApplyDate).split("T")[0]
                    signed_data[a].UpdatedTime = (signed_data[a].UpdatedTime).split("T")[0]
                    if(signed_data[a].FormId == null){signed_data[a].FormId=""}
                    if(signed_data[a].BillingType == "0"){signed_data[a].BillingType = "單獨開單"}
                    if(signed_data[a].BillingType == "1"){signed_data[a].BillingType = "合併開單"}
                    if(signed_data[a].Status == "Approve"){status_ty = "badge-success"}
                    if(signed_data[a].Status == "Ongoing"){status_ty = "badge-success"}
                    if(signed_data[a].Status == "Reject"){status_ty = "badge-danger"}
                    var product_name =  signed_data[a].ProductName;
                    if(product_name && product_name.length > 10)
                    {
                        var ellipsis = "<font color=\"blue\">...</font>";
                        var sub_pro_name = product_name.substring(0,10);
                        product_name_show = "<span data-toggle=\"popover\" data-trigger=\"hover click\" data-content=\""+ product_name +"\">" + sub_pro_name + ellipsis + "</span>";

                    }
                    else
                        product_name_show = product_name;
                    var data_info_signed ='<tr>'
                      +'<td>'+signed_data[a].BillingType+'</td>'
                      +'<td>'+signed_data[a].FormId+'</td>'
                      +'<td>'+signed_data[a].Department+'</td>'
                      +'<td>'+signed_data[a].ApplyDate+'</td>'
                      +'<td>'+signed_data[a].Pic+'</td>'
                      +'<td>'+product_name_show+'</td>'
                      +'<td>'+signed_data[a].Signer+'</td>'
                      +'<td>'+signed_data[a].UpdatedTime+'</td>'
                      +'<td><span class="badge '+status_ty+'">'+signed_data[a].Status+'</span></td>'
                      +'<td>'+signed_data[a].BudgetCode+'</td>'
                      +'<td class ="yc">'+signed_data[a].MergeId+'</td>'
                      +'<td>'
                        +'<a href="#" onclick="detail_budget('+signed_data[a].Id+','+signed_data[a].MergeId+',2);">详细...</a>'
                      +'</td>'
                    +'</tr>'
                    $('#signed_budget_info').append(data_info_signed)
                }
                popover_show();

                data_count = result['data'].page_count
                if(page_signed_obj['page'] == '1'){
                    $("#previous_signed").parent().addClass("disabled")
                }
                if(Number(page_signed_obj['page']) == data_count){
                    $("#next_signed").parent().addClass("disabled")
                }
            }else{
                $("#next_signed").parent().addClass("disabled")
                $("#previous_signed").parent().addClass("disabled")
            }
        }
    })
}






//自动触发事件报表页面
$(function(){   
    $("#previous_statement").parent().addClass("disabled")
})
var page_statement_obj = {'page':'1','num':'10'}
//选择一页显示数量
$(document).ready(function(){
     $("#statement_page_num").change(function(){
        remove_box();
        var page_statement_number = $(this).children('option:selected').val()
        page_statement_obj['num']=page_statement_number.toString()
        page_statement_obj['page'] = '1'
        if(page_statement_number == 'All'){
            $("#previous_statement").parent().addClass("disabled")
            $("#next_statement").parent().addClass("disabled")
        }
        if(page_statement_number != 'All'){
            $("#previous_statement").parent().removeClass("disabled")
            $("#next_statement").parent().removeClass("disabled")
        }
        if(page_statement_obj['page'] == '1'){
            $("#previous_statement").parent().addClass("disabled")
        }
        if(JSON.stringify(query_data_post) == '{}'){
            statement_ajax();
        }else{
            query_date_budget();
//            query_date_budget_ajax();
        }
     })
})
//上一页页码的转换
function previous_page_signed(){
    remove_box();
    if(page_statement_obj['page'] != '1' && page_statement_obj['num'] != 'All'){
        page_statement_obj['page']= (Number(page_statement_obj['page'])-1).toString()
        $("#next_statement").parent().removeClass("disabled")
        if(JSON.stringify(query_data_post) == '{}'){
            statement_ajax();
        }else{
            query_date_budget();
//            query_date_budget_ajax();
        }
    }
    if(page_statement_obj['page'] == '1'){
        $("#previous_statement").parent().addClass("disabled")
    }
}
//下一页的页面转换
function next_page_signed(){
    remove_box();
    if(page_statement_obj['num'] != 'All'){
        page_statement_obj['page']= (Number(page_statement_obj['page'])+1).toString()
        $("#previous_statement").parent().removeClass("disabled")
        if(JSON.stringify(query_data_post) == '{}'){
            statement_ajax();
        }else{
            query_date_budget();
//            query_date_budget_ajax();
        }
    }
}
//报表的获取资料页面的显示
function statement(){
    $(".statement").removeClass("yc")
    $(".apply").addClass("yc")
    $(".signing").addClass("yc")
    $(".signed").addClass("yc")
    $(".ongoing").addClass("yc")
    query_data_post = {}
    remove_box();
    $("#bud_code_query")[0].reset();
    page_statement_obj = {'page':'1','num':'10'}
    statement_ajax();
}
function statement_ajax(){
    $.ajax({
        'type':'GET',
        'url':'/index/merged-statement-detail/',
        'data':page_statement_obj,
        success:function(result){
            if(result['code'] === 200){
                $('#statement_detail').empty();
                statement_data = result['data'].data
                console.log(statement_data)
                for(var a=0; a<statement_data.length; a++){
                    statement_data[a].ApplyDate = (statement_data[a].ApplyDate).split("T")[0]
                    statement_data[a].UpdatedTime = (statement_data[a].UpdatedTime).split("T")[0]
                    if(statement_data[a].BillingType == "0"){statement_data[a].BillingType = "單獨開單"}
                    if(statement_data[a].BillingType == "1"){statement_data[a].BillingType = "合併開單"}
                    if(statement_data[a].Status == "Approve"){status_tepy="badge-success"}
                    if(statement_data[a].Status == "Closed"){status_tepy="badge-success"}
                    if(statement_data[a].Status == "Reject"){status_tepy="badge-danger"}
                    if(statement_data[a].Status == "Process"){status_tepy="badge-warning"}
                    if(statement_data[a].FormId == null){statement_data[a].FormId=""}
                    if(statement_data[a].BudgetCode == null){statement_data[a].BudgetCode=""}
                    var product_name =  statement_data[a].ProductName;
                    if(product_name && product_name.length > 10)
                    {
                        var ellipsis = "<font color=\"blue\">...</font>";
                        var sub_pro_name = product_name.substring(0,10);
                        product_name_show = "<span data-toggle=\"popover\" data-trigger=\"hover click\" data-content=\""+ product_name +"\">" + sub_pro_name + ellipsis + "</span>";

                    }
                    else
                        product_name_show = product_name;

                    var data_info_statement ='<tr>'
                      +'<td>'
                        +'<input type="checkbox" class="input_class" id="" name="" value="true">'
                        +'<label class ="yc" >'+statement_data[a].Id+'</label>'
                      +'</td>'
                      +'<td>'+statement_data[a].BillingType+'</td>'
                      +'<td>'+statement_data[a].FormId+'</td>'
                      +'<td>'+statement_data[a].Department+'</td>'
                      +'<td>'+statement_data[a].ApplyDate+'</td>'
                      +'<td>'+statement_data[a].Pic+'</td>'
                      +'<td>'+product_name_show+'</td>'
                      +'<td>'+statement_data[a].Signer+'</td>'
                      +'<td>'+statement_data[a].UpdatedTime+'</td>'
                      +'<td><span class="badge '+status_tepy+'">'+statement_data[a].Status+'</span></td>'
                      +'<td>'+statement_data[a].BudgetCode+'</td>'
                      +'<td class ="yc">'+statement_data[a].Id+'</td>'
                      +'<td class ="yc">'+statement_data[a].MergeId+'</td>'
                      +'<td>'
                        +'<a href="javascript:void(0)" onclick="detail_budget('+statement_data[a].Id+','+statement_data[a].MergeId+',3);">详细...</a>'
                      +'</td>'
                    +'</tr>'
                    $('#statement_detail').append(data_info_statement)
                    popover_show();
                }
                
                data_count = result['data'].page_count
                console.log(data_count)
                if(page_statement_obj['page'] == '1'){
                    $("#previous_statement").parent().addClass("disabled")
                }
                if(Number(page_statement_obj['page']) == data_count){
                    $("#next_statement").parent().addClass("disabled")
                }
                if(Number(page_statement_obj['page']) < data_count){
                    $("#next_statement").parent().removeClass("disabled")
                }
            }else{
                $('#statement_detail').empty()
                $("#previous_statement").parent().addClass("disabled")
                $("#next_statement").parent().addClass("disabled")
            }
        }
    })
}

//我跟蹤的預算表單頁面數據的獲取
function ongoing(){
    $(".ongoing").removeClass("yc")
    $(".statement").addClass("yc")
    $(".apply").addClass("yc")
    $(".signing").addClass("yc")
    $(".signed").addClass("yc")
    ongoing_ajax();
}
function ongoing_ajax(){
    $.ajax({
        'type':'GET',
        'url':'/index/budget-ongoing-info/',
        'data':{},
        beforeSend :function(xmlHttp){
            xmlHttp.setRequestHeader("If-Modified-Since","0");
            xmlHttp.setRequestHeader("Cache-Control","no-cache");
        },
        success:function(result){
            if(result['code'] === 200){
                $('#ongoing_budget_info').empty();
                singing_data = result['data']
                console.log(singing_data)
                singing_null_data = form_null_info(singing_data)
                for(var a=0; a<singing_null_data.length; a++){
                    if(singing_null_data[a].equipmentToFactoryDate !=null){singing_null_data[a].equipmentToFactoryDate=(singing_null_data[a].equipmentToFactoryDate).split("T")[0]}
                    if(singing_null_data[a].toFactoryDate !=null){singing_null_data[a].toFactoryDate=(singing_null_data[a].toFactoryDate).split("T")[0]}
                    if(singing_null_data[a].BillingType == "0"){
                        var Download_title="Download..."
                        singing_null_data[a].BillingType = "單獨開單"
                        singing_null_data[a].mergeId = "null"
                        if(singing_null_data[a].AttachmentPath == ""){singing_null_data[a].AttachmentPath="#",Download_title=""}
                        var product_name =  singing_null_data[a].ProductName;
                        if(product_name && product_name.length > 10)
                        {
                            var ellipsis = "<font color=\"blue\">...</font>";
                            var sub_pro_name = product_name.substring(0,10);
                            product_name_show = "<span data-toggle=\"popover\" data-trigger=\"hover click\" data-content=\""+ product_name +"\">" + sub_pro_name + ellipsis + "</span>";

                        }
                        else
                            product_name_show = product_name;

                        var singing_form ='<tr>'
                           +'<td>'
                                +'<button class="btn btn-primary btn-sm" onclick="Ongoing_budget();" data-toggle="modal" data-target="#ongoingmodule">编辑</button>'
                           +'</td>'
                          +'<td class ="yc">'+singing_null_data[a].Id+'</td>'
                          +'<td class ="yc">'+singing_null_data[a].MergeId+'</td>'
                          +'<td class ="yc">'+singing_null_data[a].equipmentToFactoryDate+'</td>'
                          +'<td class ="yc">'+singing_null_data[a].ExternalNumber+'</td>'
                          +'<td class ="yc">'+singing_null_data[a].poNumber+'</td>'
                          +'<td class ="yc">'+singing_null_data[a].toFactoryDate+'</td>'
                          +'<td class ="yc">'+singing_null_data[a].traceRemark+'</td>'
                          +'<td>'+singing_null_data[a].FormId+'</td>'
                          +'<td>'+singing_null_data[a].Department+'</td>'
                          +'<td>'+singing_null_data[a].applier+'</td>'
                          +'<td>'+singing_null_data[a].Customer+'</td>'
                          +'<td>'+singing_null_data[a].Project+'</td>'
                          +'<td>'+product_name_show+'</td>'
                          +'<td>'+singing_null_data[a].Model+'</td>'
                          +'<td>'+singing_null_data[a].UnitPrice+'</td>'
                          +'<td>'+singing_null_data[a].Quantity+'</td>'
                          +'<td>'+singing_null_data[a].count_price+'</td>'
                          +'<td>'+singing_null_data[a].ApplyReason+'</td>'
                          +'<td>'
                            +'<a href='+singing_null_data[a].AttachmentPath+' >'+Download_title+'</a>'
                          +'</td>'

//                          +'<td>'+singing_null_data[a].BillingType+'</td>'

//                          +'<td><span class="badge badge-warning">'+singing_null_data[a].Status+'</span></td>'
                          +'<td>'
                                +'<a href="#" onclick="detail_budget('+singing_null_data[a].Id+','+singing_null_data[a].mergeId+',5);">详细...</a>'
                          +'</td>'
                        +'</tr>'
                        $('#ongoing_budget_info').append(singing_form)
                    }
                }
                singing_data_qu_data = quchong(singing_data)
                singing_data_merged_info = form_merged_info(singing_data)
                for(var j=0; j<singing_data_qu_data.length; j++){
                    if(singing_data_qu_data[j].equipmentToFactoryDate !=null){singing_data_qu_data[a].equipmentToFactoryDate=(singing_data_qu_data[j].equipmentToFactoryDate).split("T")[0]}
                    merged_flag= singing_data_qu_data[j].MergeId
                    var flag_count = 0;
                    for(var i=0; i<singing_data_merged_info.length; i++){
                        var Download_title="Download...."
                        singing_data_merged_info[i].BillingType = "合併開單"
                        console.log(singing_data_merged_info)
//                        singing_data_merged_info[i].ApplyDate = (singing_data_merged_info[i].ApplyDate).split("T")[0]
                        if(singing_data_merged_info[i].AttachmentPath == ""){singing_data_merged_info[i].AttachmentPath="#",Download_title=""}
                        if(merged_flag == singing_data_merged_info[i].MergeId){
                            flag_count = flag_count + 1;
                            flag_count_str = flag_count.toString()
                            var rowspan_MergeId = singing_data_merged_info[i].MergeId
                            var product_name =  singing_data_merged_info[i].ProductName;
                            if(product_name && product_name.length > 10)
                            {
                                var ellipsis = "<font color=\"blue\">...</font>";
                                var sub_pro_name = product_name.substring(0,10);
                                product_name_show = "<span data-toggle=\"popover\" data-trigger=\"hover click\" data-content=\""+ product_name +"\">" + sub_pro_name + ellipsis + "</span>";

                            }
                            else
                                product_name_show = product_name;

                            if(flag_count == 1){
                                var singing_form ='<tr>'
                                  +'<td rowspan='+flag_count_str+' id='+rowspan_MergeId+'>'
                                       +'<button class="btn btn-primary btn-sm" onclick="Ongoing_budget();" data-toggle="modal" data-target="#ongoingmodule">编辑</button>'
                                  +'</td>'
                                  +'<td class ="yc">'+singing_data_merged_info[i].Id+'</td>'
                                  +'<td class ="yc">'+singing_data_merged_info[i].MergeId+'</td>'
                                  +'<td class ="yc">'+singing_data_merged_info[i].equipmentToFactoryDate+'</td>'
                                  +'<td class ="yc">'+singing_data_merged_info[i].ExternalNumber+'</td>'
                                  +'<td class ="yc">'+singing_data_merged_info[i].poNumber+'</td>'
                                  +'<td class ="yc">'+singing_data_merged_info[i].toFactoryDate+'</td>'
                                  +'<td class ="yc">'+singing_data_merged_info[i].traceRemark+'</td>'
//                                  +'<td rowspan='+flag_count_str+' id='+rowspan_MergeId+'>'+singing_data_merged_info[i].BillingType+'</td>'
                                  +'<td>'+singing_data_merged_info[i].FormId+'</td>'
                                  +'<td>'+singing_data_merged_info[i].Department+'</td>'
                                  +'<td>'+singing_data_merged_info[i].applier+'</td>'
                                  +'<td>'+singing_data_merged_info[i].Customer+'</td>'
                                  +'<td>'+singing_data_merged_info[i].Project+'</td>'
                                  +'<td>'+product_name_show+'</td>'
                                  +'<td>'+singing_data_merged_info[i].Model+'</td>'
                                  +'<td>'+singing_data_merged_info[i].UnitPrice+'</td>'
                                  +'<td>'+singing_data_merged_info[i].Quantity+'</td>'
                                  +'<td>'+singing_data_merged_info[i].count_price+'</td>'
                                  +'<td>'+singing_data_merged_info[i].ApplyReason+'</td>'
                                  +'<td>'
                                        +'<a href='+singing_data_merged_info[i].AttachmentPath+' >'+Download_title+'</a>'
                                  +'</td>'
//                                  +'<td><span class="badge badge-warning" id='+rowspan_MergeId+'>'+singing_data_merged_info[i].Status+'</span></td>'
                                  +'<td rowspan='+flag_count_str+'  id='+rowspan_MergeId+'>'
                                    +'<a href="#" onclick="detail_budget('+singing_data_merged_info[i].Id+','+singing_data_merged_info[i].MergeId+',5);">详细...</a>'
                                  +'</td>'
                                +'</tr>'
                                $('#ongoing_budget_info').append(singing_form)
                            }
                            if(flag_count >=2){
                                document.getElementById(rowspan_MergeId).rowSpan = flag_count_str;
                                var singing_form ='<tr>'
                                  +'<td class ="yc">'+singing_data_merged_info[i].Id+'</td>'
                                  +'<td>'+singing_data_merged_info[i].FormId+'</td>'
                                  +'<td>'+singing_data_merged_info[i].Department+'</td>'
                                  +'<td>'+singing_data_merged_info[i].applier+'</td>'
                                  +'<td>'+singing_data_merged_info[i].Customer+'</td>'
                                  +'<td>'+singing_data_merged_info[i].Project+'</td>'
                                  +'<td>'+product_name_show+'</td>'
                                  +'<td>'+singing_data_merged_info[i].Model+'</td>'
                                  +'<td>'+singing_data_merged_info[i].UnitPrice+'</td>'
                                  +'<td>'+singing_data_merged_info[i].Quantity+'</td>'
                                  +'<td>'+singing_data_merged_info[i].count_price+'</td>'
                                  +'<td>'+singing_data_merged_info[i].ApplyReason+'</td>'
                                  +'<td>'
                                        +'<a href='+singing_data_merged_info[i].AttachmentPath+'>'+Download_title+'</a>'
                                  +'</td>'
                                  +'<td>'
                                    +'<a href="#" onclick="detail_budget('+singing_data_merged_info[i].Id+','+singing_data_merged_info[i].MergeId+',5);">详细...</a>'
                                  +'</td>'
                                +'</tr>'
                                $('#ongoing_budget_info').append(singing_form)
                            }
                        }
                    }
                }
                popover_show();
            }else{
            }
        }
    })

}
//跟踪表单的编辑按钮
function Ongoing_budget(){
    $("tr").each(function(index) {
        $("tr").eq(index).click(function() {
            var a = $(this).find("td")
            if(a[3].innerHTML != "null"){
                $("#equipmentToFactoryDate").val(a[3].innerHTML)
            }
            if(a[4].innerHTML != "null"){
                $("#ExternalNumber").val(a[4].innerHTML)
            }
            if(a[5].innerHTML != "null"){
                $("#poNumber").val(a[5].innerHTML)
            }
            if(a[6].innerHTML != "null"){
                $("#toFactoryDate").val(a[6].innerHTML)
            }
            if(a[7].innerHTML != "null"){
                $("#traceRemark").val(a[7].innerHTML)
            }
            $("#ongoing_Id_info").val(a[1].innerHTML)
            $("#ongoing_mergedId").val(a[2].innerHTML)

        });
    });
}
//取消 close 保存功能的实现
function cancel_og(){
    var p = confirm("此表单将Cancel，是否确定!!")
    if(p == true){
        data = {
            "id":$("#ongoing_Id_info").val(),
            "mergerId":$("#ongoing_mergedId").val(),
        }
        $.ajax({
            'type':'POST',
            'url':'/index/budget-ongoing-cancel/',
            'data':data,
            beforeSend :function(xmlHttp){
                xmlHttp.setRequestHeader("If-Modified-Since","0");
                xmlHttp.setRequestHeader("Cache-Control","no-cache");
            },
            success:function(result){
                 if(result['code'] === 200){
                    window.message.showSuccess(result['message'])
                    ongoing();
                }else{
                    alert(result['message'])
                }
                $('#mask_div').hide_mask();
            }
        })
    }
}
function close_og(){
    var p = confirm("此表单将Close，是否确定!!")
    if(p == true){
        if($("#ExternalNumber").val() == ""){
            alert("Number MO can't empty")
            return false;
        }
        if($("#poNumber").val() == ""){
            alert("PONumber MO can't empty")
            return false;
        }
        if($("#toFactoryDate").val() == ""){
            alert("To Factory time can't empty")
            return false;
        }
        if($("#equipmentToFactoryDate").val() == ""){
            alert("Equipment To Factory time can't empty")
            return false;
        }
        data = {
            "id":$("#ongoing_Id_info").val(),
            "mergerId":$("#ongoing_mergedId").val(),
            "equipmentToFactoryDate":$("#equipmentToFactoryDate").val(),
            "ExternalNumber":$("#ExternalNumber").val(),
            "poNumber":$("#poNumber").val(),
            "toFactoryDate":$("#toFactoryDate").val(),
            "traceRemark":$("#traceRemark").val()
        }
        console.log(data)
        $.ajax({
            'type':'POST',
            'url':'/index/budget-ongoing-close/',
            'data':data,
            beforeSend :function(xmlHttp){
                xmlHttp.setRequestHeader("If-Modified-Since","0");
                xmlHttp.setRequestHeader("Cache-Control","no-cache");
            },
            success:function(result){
                if(result['code'] === 200){
                    window.message.showSuccess(result['message'])
                    ongoing();
                }else{
                    alert(result['message'])
                }
                $('#mask_div').hide_mask();

            }
        })
    }
}
function save_og(){
    data = {
        "id":$("#ongoing_Id_info").val(),
        "mergerId":$("#ongoing_mergedId").val(),
        "equipmentToFactoryDate":$("#equipmentToFactoryDate").val(),
        "ExternalNumber":$("#ExternalNumber").val(),
        "poNumber":$("#poNumber").val(),
        "toFactoryDate":$("#toFactoryDate").val(),
        "traceRemark":$("#traceRemark").val()
    }
    console.log(data)
    $.ajax({
        'type':'POST',
        'url':'/index/budget-ongoing-save/',
        'data':data,
        beforeSend :function(xmlHttp){
            xmlHttp.setRequestHeader("If-Modified-Since","0");
            xmlHttp.setRequestHeader("Cache-Control","no-cache");
        },
        success:function(result){
            if(result['code'] === 200){
                window.message.showSuccess(result['message'])
                ongoing();
            }else{
                alert(result['message'])
            }
            $('#mask_div').hide_mask();

        }
    })
}



//查询动作的初始化
function call_page(){
    page_statement_obj= {'page':'1','num':'10'}
    $("#statement_page_num").val(10);
}
var query_data_post = {}
var budget_nn=1
//查询表单数据
function query_date_budget(){
    //去掉盒子
    remove_box();
    if(budget_nn == 1){
        page_statement_obj = {'page':'1','num':'10'};
        $("#statement_page_num").val(10);
        budget_nn= budget_nn+1;
    }
    var query_billing_type = $("#query_bill_type").val()
    var query_department = $("#query_department").val()
    var query_start_date = $("#datepicker3").val()
    var query_end_date = $("#datepicker4").val()
    var query_pic = $("#query_pic").val()
    var query_product_name = $("#query_product").val()
    var query_signer = $("#query_singer").val()
    var query_status = $("#forms_status").val()
    if(query_billing_type == "All"){
        query_billing_type="";
    }
    if(query_billing_type == "单独开单"){
        query_billing_type='0';
    }
    if(query_billing_type == "合并开单"){
        query_billing_type='1';
    }
    if(query_end_date != ''){
        query_end_date = query_end_date+' 23:59:59';
    }
    data = {
        'query_billing_type':query_billing_type,
        'query_department':query_department,
        'query_start_date':query_start_date,
        'query_end_date':query_end_date,
        'query_pic':query_pic,
        'query_product_name':query_product_name,
        'query_signer':query_signer,
        'query_status':query_status,
    }
    query_data_post = data
    data['page'] =page_statement_obj['page']
    data['num'] =page_statement_obj['num']
    console.log(data)
    $.ajax({
        'type':'POST',
        'url':'/index/statement-query/',
        'data':data,
        success:function(result){
            if(result['code'] === 200){
                $('#statement_detail').empty();
                query_data = result['data'].data
                console.log(query_data)
                for(var a=0; a<query_data.length; a++){
                    if(query_data[a][1] == "0"){query_data[a][1] ="單獨開單"}else{query_data[a][1] = "合併開單"}
                    if(query_data[a][2] == null){query_data[a][2] = ""}
                    query_data[a][4] = (query_data[a][4]).split("T")[0]
                    query_data[a][8] = (query_data[a][8]).split("T")[0]
                    if(query_data[a][9] == "Approve"){status_tepy="badge-success"}
                    if(query_data[a][9] == "Ongoing"){status_tepy="badge-success"}
                    if(query_data[a][9] == "Closed"){status_tepy="badge-success"}
                    if(query_data[a][9] == "Reject"){status_tepy="badge-danger"}
                    if(query_data[a][9] == "Process"){status_tepy="badge-warning"}
                    if(query_data[a][10] == null){query_data[a][10] = ""}
                    var data_info_statement ='<tr>'
                      +'<td>'
                        +'<input type="checkbox" class="input_class" id="" name="" value="true">'
                        +'<label class ="yc" >'+query_data[a][0]+'</label>'
                      +'</td>'
                      +'<td>'+query_data[a][1]+'</td>'
                      +'<td>'+query_data[a][2]+'</td>'
                      +'<td>'+query_data[a][3]+'</td>'
                      +'<td>'+query_data[a][4]+'</td>'
                      +'<td>'+query_data[a][5]+'</td>'
                      +'<td>'+query_data[a][6]+'</td>'
                      +'<td>'+query_data[a][7]+'</td>'
                      +'<td>'+query_data[a][8]+'</span></td>'
                      +'<td><span class="badge '+status_tepy+'">'+query_data[a][9]+'</td>'
                      +'<td>'+query_data[a][10]+'</td>'
                      +'<td class ="yc">'+query_data[a][0]+'</td>'
                      +'<td class ="yc">'+query_data[a][11]+'</td>'
                      +'<td>'
                        +'<a href="javascript:void(0)" onclick="detail_budget('+query_data[a][0]+','+query_data[a][11]+',3);">详细...</a>'
                      +'</td>'
                    +'</tr>'
                    $('#statement_detail').append(data_info_statement)
//                    }else{
//                        query_data[a][1] = "合併開單"
//                        var data_info_statement ='<tr>'
//                          +'<td>'
//                            +'<input type="checkbox" class="input_class" id="" name="" value="true">'
//                            +'<label class ="yc" >'+query_data[a][0]+'</label>'
//                          +'</td>'
//                          +'<td>'+query_data[a][1]+'</td>'
//                          +'<td>'+query_data[a][2]+'</td>'
//                          +'<td>'+query_data[a][3]+'</td>'
//                          +'<td>'+query_data[a][4]+'</td>'
//                          +'<td>'+query_data[a][5]+'</td>'
//                          +'<td>'+query_data[a][6]+'</td>'
//                          +'<td>'+query_data[a][7]+'</td>'
//                          +'<td><span class="badge badge-success">'+query_data[a][8]+'</span></td>'
//                          +'<td>'+query_data[a][9]+'</td>'
//                          +'<td class ="yc">'+query_data[a][0]+'</td>'
//                          +'<td class ="yc">'+query_data[a][10]+'</td>'
//                          +'<td>'
//                            +'<a href="javascript:void(0)" onclick="detail_budget('+query_data[a][0]+','+query_data[a][10]+',3);">详细...</a>'
//                          +'</td>'
//                        +'</tr>'
//                        $('#statement_detail').append(data_info_statement)
//                    }
                }

                data_count = result['data'].page_count
                console.log(data_count,page_statement_obj)
                if(page_statement_obj['page'] == '1'){
                    $("#previous_statement").parent().addClass("disabled")
                }
                if(Number(page_statement_obj['page']) < data_count){
                    $("#next_statement").parent().removeClass("disabled")
                }
                if(Number(page_statement_obj['page']) == data_count){
                    $("#next_statement").parent().addClass("disabled")
                }
            }else{
                alert("NO match data")
                $('#statement_detail').empty();
            }
        }
    })
}
//调用查询的ajax函数


//获取表单详情数据
function detail_budget(detail_id,detail_merged_id,number){
    $(".detail").removeClass("yc")
    $(".budget").addClass("yc")
    var detail_id = detail_id
    var detail_merged_id = detail_merged_id
    var number = number
    data = {
        'detail_id':detail_id,
        'detail_merged_id':detail_merged_id,
        'number':number,
    }
    $.ajax({
        'type':'POST',
        'data':data,
        'url':'/index/budget-code-detail/',
        success:function(result){
            if(result['code'] === 200){
                detail_data = result['data']
                detail_add(detail_data,number);
            }else{
                window.message.showError(result['message'])
            }
        }
    })
}

//去重函数
function quchong(l3){
    if(l3.length == 0){
    var bud_1=[]
    return bud_1;
    }else{
        var bud_me=[];
        for(var i=0; i<l3.length; i++){
            if(l3[i].MergeId != null){
                bud_me.push(l3[i])
            }
        }
        var bud=[];
        bud.push(bud_me[0])
        if(bud_me.length == 0){
            return bud_me;
        }else{
            for(var j=1; j<bud_me.length; j++){
                var k=0;
                for(var a=0; a<bud.length; a++){
                    if(bud[a].MergeId != bud_me[j].MergeId){
                        k=k+1
                    }
                    if(k == bud.length){
                        bud.push(bud_me[j])
                    }
                }
            }
            return bud;
        }
    }
}
//去掉有合并的单号
function form_null_info(l4){
    if(l4.length == 0){
        var bud_2=[]
        return bud_2;
    }else{
        var bud_null_info=[];
        for(var i=0; i<l4.length; i++){
            if(l4[i].MergeId == null){
                bud_null_info.push(l4[i])
            }
        }
        return bud_null_info;
    }
}
//获取合并单的数据
function form_merged_info(l5){
    if(l5.length == 0){
        var bud_3=[]
        return bud_3;
    }else{
        var bud_merge_info=[];
        for(var i=0; i<l5.length; i++){
            if(l5[i].MergeId != null){
                bud_merge_info.push(l5[i])
            }
        }
        return bud_merge_info;
    }
}

//计算详情费用的方法
function count_detail_fee(number,sum){
    if(number == "1"){
        return sum.toFixed(2);
    }
    if(number == "2"){
        sum =sum/12
        sum =sum.toFixed(2)
        return sum;
    }
    if(number == "3"){
        sum =sum/24
        sum =sum.toFixed(2)
        return sum;
    }
    if(number == "4"){
        sum =sum/36
        sum =sum.toFixed(2)
        return sum;
    }
    if(number == "5"){
        sum =sum/72
        sum =sum.toFixed(2)
        return sum;
    }
    //不在计算范围之内的
    return sum;

}

//详情页面的加载
function detail_add(detail_data_html,number){
    console.log(detail_data_html,number)
    if(number == 1){
        var signer_box = '<div class="col-md-12 text-center"><button class="btn btn-primary btn-sm" onclick="singing_in_budget();" data-toggle="modal" data-target="#sign_inmodule">签核</button></div>'
        var mark_sign='yc'
    }else{
        signer_box =""
        mark_sign=''
    }
    for(var a=0; a<detail_data_html.length; a++){
        var count_price = detail_data_html[a].UnitPrice * detail_data_html[a].Quantity
        console.log(detail_data_html[a].rate)
        count_price = detail_data_html[a].rate * count_price
        console.log(count_price)
        var count_fee_month = 0
        count_fee_month =count_detail_fee(detail_data_html[a].Rule,count_price)
        if(detail_data_html[a].SignRemarks == null){detail_data_html[a].SignRemarks=""}
        if(count_price ==0 &&count_fee_month==0){
            count_price=""
            count_fee_month=""
        }else{
            count_price=count_price.toFixed(2)
            count_fee_month=count_fee_month.toFixed(2)
        }
        if(detail_data_html[a].ExternalNumberType == 1){
                detail_data_html[a].ExternalNumberType ="PMCS单号"
            }else{
                detail_data_html[a].ExternalNumberType ="201单号"
        }
        detail_data_html[a].ApplyDate = (detail_data_html[a].ApplyDate).split("T")[0].replace(/-/g,'/')
        if(detail_data_html[a].ExternalNumberEffectiveDate != null){
            detail_data_html[a].ExternalNumberEffectiveDate = (detail_data_html[a].ExternalNumberEffectiveDate).split("T")[0].replace(/-/g,'/')
        }else{
             detail_data_html[a].ExternalNumberEffectiveDate = "";
        }
        if(detail_data_html[a].BillingType == '0'){
            detail_data_html[a].BillingType = "單獨開單"
            var detail_num = '<div class="row" style="padding-top:5px;padding-bottom:20px;">'
                    +'<span class="col-md-12" style="font-size: 10px;">'
                        +'<a href="#"><span onclick="to_html('+number+');">返回预算表单</span></a> > 表单详情'
                    +'</span>'
                +'</div>'
                +'<main role="main" class="col-md-12 ml-sm-auto col-lg-12 pt-3 px-4">'
                    +'<div class="container">'
                        +'<div class="row col-md-12 text-center" style="border-bottom:1px solid #e5e9f2;">'
                            +'<h3>表单详情</h3>'
                        +'</div>'
                        +'<div class="col-md-12 order-md-12 mb-12" style="padding-top:5px;padding-bottom:20px;">'
                            +'<h5>表单1</h5>'
                            +'<ul class="list-group mb-4 " >'
                                +'<li class="list-group-item d-flex justify-content-between lh-condensed">'
                                    +'<div>'
                                        +'<h7 class="my-0">申请部门 : </h7>'
                                        +'<small class="text-muted">'+detail_data_html[a].Department+'</small>'
                                    +'</div>'
                                    +'<div>'
                                        +'<h7 class="my-0">備註/新增或損耗 : </h7>'
                                        +'<small class="text-muted">'+detail_data_html[a].Remark+'</small>'
                                    +'</div>'
                                    +'<div>'
                                        +'<h7 class="my-0">開單狀況 : </h7>'
                                        +'<small class="text-muted">'+detail_data_html[a].BillingType+'</small>'
                                    +'</div>'
                                    +'<div>'
                                        +'<h7 class="my-0">申請日期 : </h7>'
                                        +'<small class="text-muted">'+detail_data_html[a].ApplyDate+'</small>'
                                    +'</div>'
                                    +'<div>'
                                        +'<h7 class="my-0">PIC : </h7>'
                                        +'<small class="text-muted">'+detail_data_html[a].Pic+'</small>'
                                    +'</div>'
                                +'</li>'
                            +'<li class="list-group-item d-flex justify-content-between lh-condensed">'
                                +'<div>'
                                    +'<h7 class="my-0">設備名稱/治具類型 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].ProductName+'</small>'
                                +'</div>'
                                +'<div>'
                                    +'<h7 class="my-0">規格/型號/版本 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].Model+'</small>'
                                +'</div>'
                                    +'<div>'
                                        +'<h7 class="my-0">'+detail_data_html[a].ExternalNumberType+': </h7>'
                                        +'<small class="text-muted">'+detail_data_html[a].ExternalNumber+'</small>'
                                    +'</div>'
                                +'<div>'
                                    +'<h7 class="my-0">签核日期 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].ExternalNumberEffectiveDate+'</small>'
                                +'</div>'
                                +'<div>'
                                    +'<h7 class="my-0">類別 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].PurchaseType+'</small>'
                                +'</div>'
                            +'</li>'
                            +'<li class="list-group-item d-flex justify-content-between lh-condensed">'
                                +'<div>'
                                    +'<h7 class="my-0">單價 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].UnitPrice+'</small>'
                                +'</div>'
                                +'<div>'
                                +'<h7 class="my-0">币别 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].Currency+'</small>'
                                    +'</div>'
                                +'<div>'
                                    +'<h7 class="my-0">申請數量 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].Quantity+'</small>'
                                +'</div>'
                                +'<div>'
                                    +'<h7 class="my-0">總費用(RMB): </h7>'
                                    +'<small class="text-muted">'+count_price+'</small>'
                                +'</div>'
                                +'<div>'
                                    +'<h7 class="my-0">當月發生費用(RMB) : </h7>'
                                    +'<small class="text-muted">'+count_fee_month+'</small>'
                                +'</div>'
                                +'<div>'
                                    +'<h7 class="my-0">客戶 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].Customer+'</small>'
                                +'</div>'
                                +'<div>'
                                    +'<h7 class="my-0">機種 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].TypeOfMachine+'</small>'
                                +'</div>'
                                +'<div>'
                                    +'<h7 class="my-0">ProjectCode : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].ProjectCode+'</small>'
                                +'</div>'
                                +'<div>'
                                    +'<h7 class="my-0">签核人 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].Signer+'</small>'
                                +'</div>'
                            +'</li>'
                            +'<li class="list-group-item d-flex justify-content-between lh-condensed">'
                               +'<div>'
                                    +'<h7 class="my-0">鏈接 : </h7>'
                                    +'<small class="text-muted"><a href="'+detail_data_html[a].AttachmentPath+'">'+detail_data_html[a].AttachmentPath+'</a></small>'
                               +'</div>'
                            +'</li>'
                            +'<li class="list-group-item d-flex justify-content-between lh-condensed">'
                                +'<div>'
                                    +'<h7 class="my-0">申請原因/用途 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].ApplyReason+'</small>'
                                +'</div>'
                            +'</li>'
                            +'<li class="list-group-item d-flex justify-content-between lh-condensed">'
                                +'<div class='+mark_sign+'>'
                                    +'<h7 class="my-0">签核意见/备注 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].SignRemarks+'</small>'
                                +'</div>'
                                +'<div class=yc >'
                                    +'<span type="text" class="col-md-4 col-form-label" id="bud_in_id">'+detail_data_html[a].Id+'</span>'
                                    +'<span type="text" class="col-md-4 col-form-label" id="bud_in_merge">'+detail_data_html[a].MergeId+'</span>'
                                +'</div>'
                            +'</li>'
//                            +'<li class="list-group-item d-flex justify-content-between lh-condensed">'
//                                +'<div>'

//                                +'</div>'
//                            +'</li>'
                        +'</ul>'
                    +'</div>'
                    + signer_box
//                    +'<button class="btn btn-primary btn-sm" onclick="singing_signed_budget();" data-toggle="modal" data-target="#signmodule">签核</button>'
                +'</main>'
            $(".detail").empty();
            $(".detail").append(detail_num)
        }
        if(detail_data_html[a].BillingType == '1'){
            detail_data_html[a].BillingType = "合併開單"
            var i = a+1
            if(i == 1){
                 var detail_num = '<div class="row" style="padding-top:5px;padding-bottom:20px;">'
                    +'<span class="col-md-12" style="font-size: 10px;">'
                        +'<a href="#" ><span onclick="to_html('+number+');">返回预算表单</span></a> > 表单详情'
                    +'</span>'
                +'</div>'
                +'<main role="main" class="col-md-12 ml-sm-auto col-lg-12 pt-3 px-4">'
                    +'<div class="container">'
                        +'<div class="row col-md-12 text-center" style="border-bottom:1px solid #e5e9f2;">'
                            +'<h3>表单详情</h3>'
                        +'</div>'
                        +'<div class="col-md-12 order-md-12 mb-12" style="padding-top:5px;padding-bottom:20px;">'
                            +'<h5>合并表单('+i+')</h5>'
                            +'<ul class="list-group mb-4 " >'
                                +'<li class="list-group-item d-flex justify-content-between lh-condensed">'
                                    +'<div>'
                                        +'<h7 class="my-0">申请部门 : </h7>'
                                        +'<small class="text-muted">'+detail_data_html[a].Department+'</small>'
                                    +'</div>'
                                    +'<div>'
                                        +'<h7 class="my-0">備註/新增或損耗 : </h7>'
                                        +'<small class="text-muted">'+detail_data_html[a].Remark+'</small>'
                                    +'</div>'
                                    +'<div>'
                                        +'<h7 class="my-0">開單狀況 : </h7>'
                                        +'<small class="text-muted">'+detail_data_html[a].BillingType+'</small>'
                                    +'</div>'
                                    +'<div>'
                                        +'<h7 class="my-0">申請日期 : </h7>'
                                        +'<small class="text-muted">'+detail_data_html[a].ApplyDate+'</small>'
                                    +'</div>'
                                    +'<div>'
                                        +'<h7 class="my-0">PIC : </h7>'
                                        +'<small class="text-muted">'+detail_data_html[a].Pic+'</small>'
                                    +'</div>'
                                +'</li>'
                            +'<li class="list-group-item d-flex justify-content-between lh-condensed">'
                                +'<div>'
                                    +'<h7 class="my-0">設備名稱/治具類型 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].ProductName+'</small>'
                                +'</div>'
                                +'<div>'
                                    +'<h7 class="my-0">規格/型號/版本 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].Model+'</small>'
                                +'</div>'
                                +'<div>'
                                    +'<h7 class="my-0">'+detail_data_html[a].ExternalNumberType+': </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].ExternalNumber+'</small>'
                                +'</div>'
                                +'<div>'
                                    +'<h7 class="my-0">签核日期 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].ExternalNumberEffectiveDate+'</small>'
                                +'</div>'
                                +'<div>'
                                    +'<h7 class="my-0">類別 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].PurchaseType+'</small>'
                                +'</div>'
                            +'</li>'
                            +'<li class="list-group-item d-flex justify-content-between lh-condensed">'
                                +'<div>'
                                    +'<h7 class="my-0">單價 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].UnitPrice+'</small>'
                                +'</div>'
                                +'<div>'
                                +'<h7 class="my-0">币别 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].Currency+'</small>'
                                    +'</div>'
                                +'<div>'
                                    +'<h7 class="my-0">申請數量 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].Quantity+'</small>'
                                +'</div>'
                                +'<div>'
                                    +'<h7 class="my-0">總費用(RMB):</h7>'
                                    +'<small class="text-muted">'+count_price+'</small>'
                                +'</div>'
                                +'<div>'
                                    +'<h7 class="my-0">當月發生費用(RMB):</h7>'
                                    +'<small class="text-muted">'+count_fee_month+'</small>'
                                +'</div>'
                                +'<div>'
                                    +'<h7 class="my-0">客戶 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].Customer+'</small>'
                                +'</div>'
                                +'<div>'
                                    +'<h7 class="my-0">機種 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].TypeOfMachine+'</small>'
                                +'</div>'
                                +'<div>'
                                    +'<h7 class="my-0">ProjectCode : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].ProjectCode+'</small>'
                                +'</div>'
                                +'<div>'
                                    +'<h7 class="my-0">签核人 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].Signer+'</small>'
                                +'</div>'
                            +'</li>'
                            +'<li class="list-group-item d-flex justify-content-between lh-condensed">'
                                +'<div>'
                                    +'<h7 class="my-0">鏈接 : </h7>'
                                    +'<small class="text-muted"><a href="'+detail_data_html[a].AttachmentPath+'">'+detail_data_html[a].AttachmentPath+'</a></small>'
                                +'</div>'
                            +'</li>'
                            +'<li class="list-group-item d-flex justify-content-between lh-condensed">'
                                +'<div>'
                                    +'<h7 class="my-0">申請原因/用途 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].ApplyReason+'</small>'
                                +'</div>'
                            +'</li>'
                            +'<li class="list-group-item d-flex justify-content-between lh-condensed" >'
                                +'<div class='+mark_sign+' >'
                                    +'<h7 class="my-0">签核意见/备注 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].SignRemarks+'</small>'
                                +'</div>'
                            +'</li>'
                        +'</ul>'
                    +'</div>'
                +'</main>'
                $(".detail").empty();
                $(".detail").append(detail_num)
            }
            if(i >= 2){
                var detail_num = '<main role="main" class="col-md-12 ml-sm-auto col-lg-12 pt-3 px-4">'
                    +'<div class="container">'
                        +'<div class="col-md-12 order-md-12 mb-12" style="padding-top:5px;padding-bottom:20px;">'
                            +'<h5>合并表单('+i+')</h5>'
                            +'<ul class="list-group mb-4 " >'
                                +'<li class="list-group-item d-flex justify-content-between lh-condensed">'
                                    +'<div>'
                                        +'<h7 class="my-0">申请部门 : </h7>'
                                        +'<small class="text-muted">'+detail_data_html[a].Department+'</small>'
                                    +'</div>'
                                    +'<div>'
                                        +'<h7 class="my-0">備註/新增或損耗 : </h7>'
                                        +'<small class="text-muted">'+detail_data_html[a].Remark+'</small>'
                                    +'</div>'
                                    +'<div>'
                                        +'<h7 class="my-0">開單狀況 : </h7>'
                                        +'<small class="text-muted">'+detail_data_html[a].BillingType+'</small>'
                                    +'</div>'
                                    +'<div>'
                                        +'<h7 class="my-0">申請日期 : </h7>'
                                        +'<small class="text-muted">'+detail_data_html[a].ApplyDate+'</small>'
                                    +'</div>'
                                    +'<div>'
                                        +'<h7 class="my-0">PIC : </h7>'
                                        +'<small class="text-muted">'+detail_data_html[a].Pic+'</small>'
                                    +'</div>'
                                +'</li>'
                            +'<li class="list-group-item d-flex justify-content-between lh-condensed">'
                                +'<div>'
                                    +'<h7 class="my-0">設備名稱/治具類型 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].ProductName+'</small>'
                                +'</div>'
                                +'<div>'
                                    +'<h7 class="my-0">規格/型號/版本 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].Model+'</small>'
                                +'</div>'
                                +'<div>'
                                    +'<h7 class="my-0">'+detail_data_html[a].ExternalNumberType+': </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].ExternalNumber+'</small>'
                                +'</div>'
                                +'<div>'
                                    +'<h7 class="my-0">签核日期 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].ExternalNumberEffectiveDate+'</small>'
                                +'</div>'
                                +'<div>'
                                    +'<h7 class="my-0">類別 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].PurchaseType+'</small>'
                                +'</div>'
                            +'</li>'
                            +'<li class="list-group-item d-flex justify-content-between lh-condensed">'
                                +'<div>'
                                    +'<h7 class="my-0">單價 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].UnitPrice+'</small>'
                                +'</div>'
                                +'<div>'
                                +'<h7 class="my-0">币别 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].Currency+'</small>'
                                    +'</div>'
                                +'<div>'
                                    +'<h7 class="my-0">申請數量 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].Quantity+'</small>'
                                +'</div>'
                                +'<div>'
                                    +'<h7 class="my-0">總費用(RMB):</h7>'
                                    +'<small class="text-muted">'+count_price+'</small>'
                                +'</div>'
                                +'<div>'
                                    +'<h7 class="my-0">當月發生費用(RMB):</h7>'
                                    +'<small class="text-muted">'+count_fee_month+'</small>'
                                +'</div>'
                                +'<div>'
                                    +'<h7 class="my-0">客戶 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].Customer+'</small>'
                                +'</div>'
                                +'<div>'
                                    +'<h7 class="my-0">機種 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].TypeOfMachine+'</small>'
                                +'</div>'
                                +'<div>'
                                    +'<h7 class="my-0">ProjectCode : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].ProjectCode+'</small>'
                                +'</div>'
                                +'<div>'
                                    +'<h7 class="my-0">签核人 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].Signer+'</small>'
                                +'</div>'
                            +'</li>'
                            +'<li class="list-group-item d-flex justify-content-between lh-condensed">'
                                +'<div>'
                                    +'<h7 class="my-0">鏈接 : </h7>'
                                    +'<small class="text-muted"><a href="'+detail_data_html[a].AttachmentPath+'">'+detail_data_html[a].AttachmentPath+'</a></small>'
                                +'</div>'
                            +'</li>'
                            +'<li class="list-group-item d-flex justify-content-between lh-condensed">'
                                +'<div>'
                                    +'<h7 class="my-0">申請原因/用途 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].ApplyReason+'</small>'
                                +'</div>'
                            +'</li>'
                            +'<li class="list-group-item d-flex justify-content-between lh-condensed" >'
                                +'<div class='+mark_sign+' >'
                                    +'<h7 class="my-0">签核意见/备注 : </h7>'
                                    +'<small class="text-muted">'+detail_data_html[a].SignRemarks+'</small>'
                                +'</div>'
                            +'</li>'
                        +'</ul>'
                    +'</div>'
                +'</main>'
                $(".detail").append(detail_num)
                $(".detail").append(signer_box)
            }
        }
    }
}

//签核模态框获取Id和信息
function singing_in_budget(){
    var a_id=$("#bud_in_id").html()
    var b_id=$("#bud_in_merge").html()
    console.log(typeof(a_id),typeof(b_id))
//     $("tr").each(function(index) {
//        $("tr").eq(index).click(function() {
//            var a = $(this).find("td")
            $("#merged_Id_in").val(a_id)
            $("#merged_mergedId_in").val(b_id)
//        });
//    });
}
//签核表单内容提交数据  详情页面上的
function signed_in_orm(){
    $('#mask_div').show_mask();
    var bud_id = $("#merged_Id_in").val()
    var bud_merged_id = $("#merged_mergedId_in").val()
    var budget_cod_text = $("#bu_code_in").val()
    var budget_text = $("#text_bud_in").val()
    if(budget_cod_text == ""){
        window.message.showError("Budget_code can not empty")
        $('#mask_div').hide_mask();
        return false;
    }
    data ={
        'bud_id':bud_id,
        'bud_merged_id':bud_merged_id,
        'budget_cod_text':budget_cod_text,
        'budget_text':budget_text,
    }
    var num=$("#bud_count_qty").html()
    $.ajax({
        'type':'POST',
        'url':'/index/merged-signed/',
        'data':data,
        success:function(result){
            if(result['code'] === 200){
                window.message.showSuccess(result['message'])
                signing();
                $("#bud_count_qty").html(num-1)
                to_html(1);
            }else{
                alert(result['message'])
            }
            $('#mask_div').hide_mask();
        }
    })
}

//拒绝签核表单内容的提交数据 详情页面上的
function reject_in_orm(){
    $('#mask_div').show_mask();
    var bud_id = $("#merged_Id_in").val()
    var bud_merged_id = $("#merged_mergedId_in").val()
    var budget_cod_text = $("#bu_code_in").val()
    var budget_text = $("#text_bud_in").val()
    if(budget_text == ""){
        window.message.showError("reject remark can't empty")
        $('#mask_div').hide_mask();
        return false;
    }
    data = {
        'bud_id':bud_id,
        'bud_merged_id':bud_merged_id,
        'budget_cod_text':budget_cod_text,
        'budget_text':budget_text,
    }
    var num=$("#bud_count_qty").html()
    $.ajax({
        'type':'POST',
        'url':'/index/merged-rejected/',
        'data':data,
        success:function(result){
            if(result['code'] === 200){
                signing();
                $("#bud_count_qty").html(num-1)
                window.message.showSuccess(result['message'])
                to_html(1);
            }else{
                window.message.showError(result['message'])
            }
            $('#mask_div').hide_mask();
        }
    })
}



//勾选checkbox之后的生成报表的js代码
function change_statement(){
    $('#mask_div').show_mask();
    var select_box = $("table input[type=checkbox]:checked")
//    console.log(select_box)
    var statement_box = []
    select_box.each(function(){
        statement_box.push($(this).next().html());
    })
    if(statement_box[0] != "全选"){
        if(statement_box.length == 0){
        window.message.showError("need select more than one");
        $('#mask_div').hide_mask();
        return false;
        }
        data = {'statement_ids':statement_box}
        $.ajax({
            'type':'POST',
            'url':'/index/statement-bring-info/',
            'data':data,
            success:function(result){
                if(result['code'] === 200){
                    var url=result['data'][0]
                    window.location.href=url
                    remove_box();
                }else{
                    window.message.showError(result['message'])
                }
                $('#mask_div').hide_mask();
            }
        })
    }else{
//        statement_box.splice(0,1)
        select_allform();
        $('#mask_div').hide_mask();
    }
}

//下载文件的all部分的数据
function select_allform(){
    var query_billing_type = $("#query_bill_type").val()
    var query_department = $("#query_department").val()
    var query_start_date = $("#datepicker3").val()
    var query_end_date = $("#datepicker4").val()
    var query_pic = $("#query_pic").val()
    var query_product_name = $("#query_product").val()
    var query_signer = $("#query_singer").val()
    var query_status = $("#forms_status").val()
    if(query_billing_type == "All"){
        query_billing_type="";
    }
    if(query_billing_type == "单独开单"){
        query_billing_type='0';
    }
    if(query_billing_type == "合并开单"){
        query_billing_type='1';
    }
    if(query_end_date != ''){
        query_end_date = query_end_date+' 23:59:59';
    }
    data = {
        'query_billing_type':query_billing_type,
        'query_department':query_department,
        'query_start_date':query_start_date,
        'query_end_date':query_end_date,
        'query_pic':query_pic,
        'query_product_name':query_product_name,
        'query_signer':query_signer,
        'query_status':query_status,
    }
    console.log(data)
    $.ajax({
        'type':'POST',
        'url':'/index/statement-bring-info/',
        'data':data,
        success:function(result){
            if(result['code'] === 200){
                var url=result['data'][0]
                window.location.href=url
                remove_box();
            }else{
                alert(result['message'])
            }
        }
    })



}








//全选盒子的去除功能
function remove_box(){
//去除选中的标签
    $("#statement_detail :checkbox").prop("checked", false);
    $("#select_box ").prop("checked", false);
}

