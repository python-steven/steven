//登入函数
function login_btn(){
    var Employee_email = $("#userName").val();
    var u_password = $("#inputPassword").val();
    Employee_email = Employee_email.replace(/(^\s*)|(\s*$)/g, "");
    u_password = u_password.replace(/(^\s*)|(\s*$)/g, "");
    var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
    if(Employee_email =="" && u_password == ""){return false;}
    if (reg.test(Employee_email)){
        var data={
        'Employee_email':Employee_email,
        'u_password':u_password,
        };
        $.ajax({
            'type':"POST",
            'url':"/login/",
            'data':data,
            success:function (result){
                if(result['code'] === 200){
                      window.location.href="/index/"
                }else{
                    window.message.showError(result['message'])
                }
            }
        })
    }else{
        var data={
            'Employee_email':Employee_email,
            'u_password':u_password,
        };
        $.ajax({
            'type':"POST",
            'url':"/login/",
            'data':data,
            success:function (result){
                if(result['code'] === 200){
                        window.location.href="/index/"
                }else{
                    window.message.showError(result['message'])
                }
            }
        })
    }
}
//登出函数
function logout(){
//    var check_out = $("#check_out").val()
    data={
            'check_out':1,
        };
    console.log(data)
    $.ajax({
        type:"POST",
        url:"/login/logout/",
        data:data,
        success:function (result){
            if(result['code'] === 200){
                    window.location.href="/login/"
            }else{
                console.log(result['data'].data)
            }
        }
    })
}
//    console.log("session")
//    alert("清除session")
////    session.removeAttribute("user_Id");
////    sessionStorage.removeItem('user_Id');
//     session.setAttribute("user_Id", null)
//    session.invalidate();
//    localStorage.clear();
//    sessionStrong.removeItem('');
