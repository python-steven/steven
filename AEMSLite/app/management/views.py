from django.shortcuts import render, redirect
# from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from app.login.models import User,Department,Customer,BudgetCodeForm,PartItem,PartItemResult,MaintenanceLog,Configuration,LocationLog,Project,AccountTitle,ExchangeRate,FeeLimit
from app.login.views import Update_User_IsActivated
from app.auth_user import auth
from django.views.generic.base import View
from django.db import connection
from django.http import HttpResponseRedirect,HttpResponse
from app import restful,mail
from app.access_control import access_control
from datetime import datetime,timedelta,date
from django.conf import settings
import random
import string
import os
import time
from openpyxl import load_workbook,Workbook
import json
UpdatedTime = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

# 用户管理页面的数据的获取和增加用户：
class UserData(View):
    @csrf_exempt
    def get(self, request):
        try:
            page = int(request.GET.get('page'))
            number = request.GET.get('num')
            dict_data = {}
            sql1 = 'SELECT "User"."Id","EmployeeId","Name","Department","Email","Role" FROM "User" INNER JOIN ' \
                   '"Department" ON "User"."DepartmentId" = "Department"."Id" WHERE "User"."IsActivated"=True'
            sql2 = 'select count(*) FROM "User" INNER JOIN "Department" ON "User"."DepartmentId" = "Department"' \
                   '."Id" WHERE "User"."IsActivated"=True'
            cur = connection.cursor()
            cur.execute(sql2)
            count = cur.fetchall()  # 数量的总数
            if number == 'All':
                cur = connection.cursor()
                cur.execute(sql1)
                data = cur.fetchall()
                dict_data['data'] = data
                dict_data['page_count'] = count[0][0]
                return restful.ok(data=dict_data)
            if number != "All":
                number = int(number)
                count_page = count[0][0] // int(number)  # 总数除以一页显示多少条，得到总的页数
                if count[0][0] % number > 0:
                    count_page += 1
                if page <= count_page:
                    sql1 = sql1 + ' order by "Id" desc limit ' + str(number) + ' offset ' + str((page - 1)*number)
                    cur = connection.cursor()
                    cur.execute(sql1)
                    data = cur.fetchall()
                    dict_data['data'] = data
                    dict_data['page_count'] = count_page
                    return restful.ok(data=dict_data)
                else:
                    return restful.params_error(message="it had no other pages")
        except Exception as e:
            return restful.params_error(message=repr(e))
    # 增加用户的功能
    @csrf_exempt
    def post(self, request):
        password = genPassword()
        employee_id = request.POST['userid']
        name = request.POST['username']
        email = request.POST['mail']
        role = request.POST['role']
        department = request.POST['department']
        updated_time = datetime.now()
        created_time = datetime.now()
        try:
            userMail_yanzheng = User.objects.exclude(IsActivated=False).filter(Email=email).count()
            userName = User.objects.exclude(IsActivated=False).filter(Name=name).count()
            userDepartment = Department.objects.filter(Department=department).count()
            userId_yanzheng_activate = User.objects.filter(EmployeeId=employee_id,IsActivated=True).count()
            userId_yanzheng_noactivate = User.objects.filter(EmployeeId=employee_id,IsActivated=False).count()
            # 验证邮箱唯一性
            if userMail_yanzheng >= 1:
                return restful.params_error(message="user Email had used")
            # 验证用户名唯一性
            if userName >= 1:
                return restful.params_error(message='user name had used')
            # 验证部门存在性
            if userDepartment < 1:
                return restful.params_error(message='department no exist')
            #验证工号
            if userId_yanzheng_activate >=1:
                return restful.params_error(message="user EmployeeId had used")
            # 未激活的用户加入
            if userId_yanzheng_noactivate == 1 and userId_yanzheng_activate ==0:
                User.objects.filter(EmployeeId=employee_id).update(IsActivated=True, Name=name, Password=password
                                                                   , Email=email, Role=role, CreatedTime=created_time
                                                                   , UpdatedTime=updated_time)
                subject = "Inform Your New Password in AEMS Lite System"
                mail_data = {'user': employee_id, 'pw': password}
                mail.send_inform_pw_mail([email, ], subject, mail_data)
                return restful.ok(message="user add success")
            # 新工号加入
            if userId_yanzheng_activate == 0 and userId_yanzheng_noactivate == 0:
                department_ob = Department.objects.get(Department=department)
                department_id = department_ob.Id
                User.objects.create(EmployeeId=employee_id, Name=name, Password=password, Email=email,
                                    Role=role, CreatedTime=created_time, UpdatedTime=updated_time,
                                    DepartmentId=department_id)
                subject = "Inform Your New Password in AEMS Lite System"
                mail_data = {'user': employee_id, 'pw': password}
                mail.send_inform_pw_mail([email, ], subject, mail_data)
                return restful.ok(message='User created success')
        except Exception as e:
            return restful.params_error(repr(e))


# 随机生成密码的函数
def genPassword(length=8, chars=string.digits + string.ascii_letters):
    return ''.join(random.sample(chars * 10, 8))

# 修改用户的相关信息的函数
@csrf_exempt
@access_control
def modify_user(request):
    if request.method == "POST":
        id = int(request.POST.get('id',''))
        session_id = int(request.session['user_Id'])
        username = request.POST.get('username','')
        department = request.POST.get('department','')
        role = request.POST.get('role','')

        check_DepartMent = Department.objects.filter(Department=department)
        check_Name = User.objects.exclude(Id=id).filter(Name=username).count()
        check_Role = User.objects.get(Id=session_id)
        #验证角色是否为admin 是否有权限
        if check_Role.Role != "admin":
            return restful.params_error(message='Connect Administrator to check permission')
        #检查姓名是否用过
        if check_Name >0:
            return restful.params_error(message='User Name Had Used')
        #检查部门的存在性
        if check_DepartMent.count() == 0 :
            return restful.params_error(message='Department Not Exist')
        department_id=list(check_DepartMent.values("Id"))[0]["Id"]
        if session_id == id:
            """修改自己的个人信息"""
            User.objects.filter(Id=id).update(Name=username, Role=role, UpdatedTime=datetime.now(),DepartmentId=department_id)
            return restful.ok(message="user modify success",data={"user":"Myself"})
        else:
            User.objects.filter(Id=id).update(Name=username, Role=role, UpdatedTime=datetime.now(),DepartmentId=department_id)
            return restful.ok(message="user modify success", data={"user": "other"})

# 删除用户的函数
@csrf_exempt
@access_control
def del_user(request):
    if request.method == "POST":
        try:

            name = request.POST['name']
            session_id = request.session['user_Id']
            user_obj = User.objects.get(Id=session_id)
            if user_obj.Role == "admin":
                budget_code = BudgetCodeForm.objects.exclude(Status="Approve").filter(Pic=name)
                if len(budget_code) != 0:
                    return restful.params_error(message="User had using can't delete")
                budget_code2 = BudgetCodeForm.objects.exclude(Status="Approve").filter(Signer=name)
                if len(budget_code2) != 0:
                    return restful.params_error(message="User had using can't delete")
                else:
                    user = User.objects.get(Name=name)
                    user.IsActivated = False
                    user.UpdatedTime = datetime.now()
                    user.save()
                    if user.Id == session_id:
                        return restful.ok(message='delete success',data={'user':'Myself'})
                    else:
                        return restful.ok(message='delete success',data={'user':'other'})
            else:
                return restful.params_error(message="please connect admin")
        except Exception as e:
            return restful.params_error(message=repr(e))

# 修改用户密码
@csrf_exempt
@access_control
def modify_password(request):
    if request.method == "POST":
        OldPwd = request.POST['OldPwd']
        NewPwd = request.POST['NewPwd']
        session_id = request.session['user_Id']
        user_obj = User.objects.get(Id=session_id)
        if user_obj.Password == OldPwd:
            User.objects.filter(Id=session_id).update(Password=NewPwd)
            return restful.ok(message='modify password success')
        else:
            return restful.params_error(message="The original password is wrong")

# 增加客户和获取客户的信息
class CustomerInfo(View):
    @csrf_exempt
    def get(self, request):
        try:
            page = int(request.GET.get('page'))
            number = request.GET.get('num')
            dict_data ={}
            count = Customer.objects.exclude(IsActivated='False').count()
            if number == "All" :
                customerinfo = Customer.objects.exclude(IsActivated='False')
                customerinfo = customerinfo.values()
                customerinfo = list(customerinfo)
                dict_data['data'] =customerinfo
                dict_data['page_count'] =count
                return restful.ok(data=dict_data)
            if number != "All":
                number = int(number)
                page_num = count // number  # 总共多少页
                if count % number > 0:
                    page_num = page_num + 1
                if page_num >= page:
                    customerinfo = Customer.objects.exclude(IsActivated='False')[(page-1)*number:number*page]
                    customerinfo = customerinfo.values()
                    customerinfo = list(customerinfo)
                    dict_data['data'] = customerinfo
                    dict_data['page_count'] = page_num
                    return restful.ok(data=dict_data)
                else:
                    return restful.params_error(message="it had no other pages")
        except Exception as e:
            return restful.params_error(message=repr(e))
    @csrf_exempt
    def post(self, request):
        customer = request.POST['customer_val']
        updatedtime = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        try:
            customer_ob = Customer.objects.get(Customer=customer)
            if customer_ob.Id and customer_ob.IsActivated == False:
                customer_ob.IsActivated = True
                customer_ob.save()
                return restful.ok(message="Customer add success")
            else:
                return restful.params_error(message="Customer had exist")
        except:
            Customer.objects.create(Customer=customer, UpdatedTime=updatedtime)
            return restful.ok(message='Customer add success')

# 修改客户数据
@csrf_exempt
@access_control
def modify_customer(request):
    if request.method == "POST":
        customer = request.POST['customer_name']
        customer_id = request.POST['customer_id']
        try:
            customer_ob = Customer.objects.exclude(Id=customer_id).get(Customer=customer)
            if customer_ob:
                return restful.params_error(message="Customer already exist")
        except:
            Customer.objects.filter(Id=customer_id).update(Customer=customer, UpdatedTime=UpdatedTime)
            return restful.ok(message="customer had modify")

# 删除客户数据
@csrf_exempt
@access_control
def del_customer(request):
    if request.method == "POST":
        customer = request.POST['del_nm']
        try:
            budget_code = BudgetCodeForm.objects.exclude(Status="Approve").filter(Customer=customer)
            if len(budget_code) != 0:
                return restful.params_error(message="customer had using can't delete")
            else:
                cus = Customer.objects.get(Customer=customer)
                cus.IsActivated = False
                cus.save()
                return restful.ok(message="Customer delete success")
        except:
            return restful.params_error(message='please connect admin')

# 增加部门和获取部门数据
class DepartmentInfo(View):
    @csrf_exempt
    def get(self, request):
        try:
            page = int(request.GET.get('page'))
            number = request.GET.get('num')
            dict_data = {}
            count = Department.objects.exclude(IsActivated='False').count()
            if number == "All":
                department_info = Department.objects.exclude(IsActivated='False')
                department_info = list(department_info.values())
                dict_data['data'] = department_info
                dict_data['page_count'] = count
                return restful.ok(data=dict_data)
            if number != "All":
                number = int(number)
                page_num = count // number  # 总共多少页
                if count % number > 0:
                    page_num = page_num + 1
                if page_num >= page:
                    department_info = Department.objects.exclude(IsActivated='False')[(page-1)*number:number*page]
                    department_info = list(department_info.values())
                    dict_data['data'] = department_info
                    dict_data['page_count'] = page_num
                    return restful.ok(data=dict_data)
                else:
                    return restful.params_error(message="it had no other pages")
        except Exception as e:
            return restful.params_error(message=repr(e))
    @csrf_exempt
    def post(self, request):
        department = request.POST['department']
        updatedtime = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        try:
            part = Department.objects.get(Department=department)
            if part.Id and part.IsActivated == False:
                part.IsActivated = True
                part.save()
                return restful.ok(message="Department create success")
            else:
                return restful.params_error(message="Department had Exist")
        except:
            Department.objects.create(Department=department, UpdatedTime=updatedtime)
            return restful.ok(message='Department create success')

# 修改部门数据
@csrf_exempt
@access_control
def modify_department(request):
    if request.method == "POST":
        depart = request.POST['modifyPartName']
        depart_id = request.POST['modifyPartId']
        try:
            depart_ob = Department.objects.exclude(Id=depart_id).get(Department=depart)
            if depart_ob:
                return restful.params_error(message="Department already exist")
        except:
            Department.objects.filter(Id=depart_id).update(Department=depart, UpdatedTime=UpdatedTime)
            return restful.ok(message="Department had modify")

# 删除部门数据
@csrf_exempt
@access_control
def delete_department(request):
    if request.method == "POST":
        depart_name = request.POST['delPart']
        try:
            budget_code = BudgetCodeForm.objects.exclude(Status="Approve").filter(Department=depart_name)
            if len(budget_code) != 0:
                return restful.params_error(message="department had using can't delete")
            else:
                depart = Department.objects.get(Department=depart_name)
                depart.IsActivated = False
                depart.save()
                return restful.ok(message='department delete success')
        except:
            return restful.params_error(message='please connect admin')


#位置管理数据 获取GET
@csrf_exempt
@access_control
def Location_list(request):
    if request.method == "GET":
        try:
            page = int(request.GET.get('page'))
            number = request.GET.get('num')
            dict_data = {}
            count=LocationLog.objects.exclude(IsActivated='False').count()
            if number == "All":
                data = list(LocationLog.objects.filter(IsActivated=True).order_by("-Id").values("Id", "Location"))
                dict_data['data'] = data
                dict_data['page_count'] = count
                return restful.ok(data=dict_data)
            if number != "All":
                number = int(number)
                page_num = count // number  # 总共多少页
                if count % number > 0:
                    page_num = page_num + 1
                if page_num >= page:
                    location_ob = LocationLog.objects.order_by("-Id").exclude(IsActivated='False')[(page - 1) * number:number * page]
                    dict_data['data'] = list(location_ob.values("Id", "Location"))
                    dict_data['page_count'] = page_num
                    return restful.ok(data=dict_data)
                else:
                    return restful.params_error(message="it had no other pages")
        except Exception as e:
            return restful.params_error(repr(e))
#位置管理提交的增加的数据的功能的实现
@csrf_exempt
@access_control
def Location_add(request):
    if request.method == "POST":
        try:
            location_name = request.POST.get('location_name','')
            #检验是否存在
            jianyan_location = LocationLog.objects.filter(Location=location_name,IsActivated=True).count()
            jianyan_location_is = LocationLog.objects.filter(Location=location_name,IsActivated=False).count()
            if jianyan_location==0 and jianyan_location_is==0:  #新位置的添加
                LocationLog.objects.create(Location=location_name,UpdatedTime=datetime.now(),IsActivated=True)
                return restful.ok(message="location add success")
            if jianyan_location ==0 and jianyan_location_is ==1:   #被删除的位置的启用
                LocationLog.objects.filter(Location=location_name).update(Location=location_name,IsActivated=True,UpdatedTime=datetime.now())
                return restful.ok(message="location activated success")
            else:
                return restful.params_error(message="add location error")
        except Exception as e:
            return restful.params_error(repr(e))
#位置管理的提交编辑数据的功能的实现
@csrf_exempt
@access_control
def Location_edit(request):
    if request.method == "POST":
        try:
            mod_location_name= request.POST.get('mod_location_name')
            mod_location_id= int(request.POST.get('mod_location_id'))
            mod_name_count = LocationLog.objects.exclude(Id=mod_location_id,IsActivated=False).filter(Location=mod_location_name).count()
            if mod_name_count !=0:
                return restful.params_error(message="modify location had exist")
            if mod_name_count == 0:
                LocationLog.objects.filter(Id=mod_location_id).update(Location=mod_location_name,UpdatedTime=datetime.now())
                return restful.ok(message="modify location success")
        except Exception as e:
            return restful.params_error(repr(e))



#位置管理的提交删除数据的功能的实现
@csrf_exempt
@access_control
def Location_delete(request):
    if request.method == "POST":
        try:
            del_location_name = request.POST.get('del_location_name','')
            del_id = LocationLog.objects.get(Location=del_location_name).Id
            PartItem_count = PartItem.objects.filter(LocationId=del_id).count()
            if PartItem_count != 0:
                return restful.params_error(message="PartItem had using can't delete")
            else:
                Location_ob = LocationLog.objects.get(Location=del_location_name)
                Location_ob.IsActivated = False
                Location_ob.save()
                return restful.ok(message='Location delete success')
        except Exception as e:
            return restful.params_error(repr(e))


#机种管理的提交添加数据的
@csrf_exempt
@access_control
def Model_add(request):
    if request.method == "POST":
        try:
            model={}
            model['Name'] = request.POST.get("model_name",'')
            model['Code'] = request.POST.get("model_code",'')
            name_count = Project.objects.filter(Name=model['Name'],IsActivated=True).count()   #激活的名字
            code_count_2 = Project.objects.filter(Name=model['Name'], IsActivated=False).count()
            if model['Code'] == "":
                model.pop("Code")
            if name_count ==0 and code_count_2 ==0: #新机种的添加
                Project.objects.create(**model)
                return restful.ok(message="Project name add success")
            if name_count == 0 and code_count_2 == 1: #删除的机种重新添加
                Project.objects.filter(Name=model['Name']).update(Code=model['Code'],IsActivated=True,UpdatedTime=datetime.now())
                return restful.ok(message="Project name add success")
            else:
                return restful.params_error("model name had exist")
        except Exception as e:
            return restful.params_error(repr(e))
@csrf_exempt
@access_control
def Model_info(request):
    if request.method == "GET":
        try:
            page = int(request.GET.get('page'))
            number = request.GET.get('num')
            dict_data = {}
            count = Project.objects.filter(IsActivated=True).count()
            if number == "All":
                data = list(Project.objects.filter(IsActivated=True).order_by("-Id").values("Id","Name","Code"))
                dict_data['data'] = data
                dict_data['page_count'] = count
                return restful.ok(data=dict_data)
            if number != "All":
                number = int(number)
                page_num = count // number  # 总共多少页
                if count % number > 0:
                    page_num = page_num + 1
                if page_num >= page:
                    project_ob = Project.objects.order_by("-Id").filter(IsActivated=True)[
                                  (page - 1) * number:number * page]
                    dict_data['data'] = list(project_ob.values("Id","Name","Code"))
                    dict_data['page_count'] = page_num
                    return restful.ok(data=dict_data)
                else:
                    return restful.params_error(message="it had no other pages")


            # data =list(Project.objects.filter(IsActivated=True).values("Id","Name","Code"))
            # return restful.ok(data=data)
        except Exception as e:
            return restful.params_error(repr(e))


#修改机种
def Model_modify(request):
    if request.method == "POST":
        try:
            model={}
            id = request.POST.get("Id",'')
            model['Name'] = request.POST.get("model_name",'')
            model['Code'] = request.POST.get("model_code",'')
            model['UpdatedTime']=datetime.now()
            if model['Code'] == "":
                model.pop("Code")
            if model['Name'] == "":
                model.pop("Name")
            Project.objects.filter(Id=id).update(**model)
            return restful.ok(message="Project modify success")
        except Exception as e:
            return restful.params_error(repr(e))


#删除机种
@csrf_exempt
@access_control
def Model_delete(request):
    if request.method == "POST":
        try:
            name = request.POST.get("model_name", '')
            # model_obj= Project.objects.get(Name=name)
            # model_obj.IsActivated=False
            # model_obj.save()
            Project.objects.filter(Name=name).update(IsActivated=False,UpdatedTime=datetime.now())
            return restful.ok(message="Project delete success")
        except Exception as e:
            return restful.params_error(repr(e))

#科目添加
@csrf_exempt
@access_control
def Subjects_add(request):
    if request.method == "POST":
        try:
            subjects={}
            subjects['Type'] = request.POST.get("add_subject",'')
            subjects['Remark'] = request.POST.get("add_mark",'')
            subjects['Rule'] = request.POST.get("add_rule",'')
            subject_is = AccountTitle.objects.filter(Type=subjects['Type'],IsActivated=True).count()   #激活的名字
            subject_no = AccountTitle.objects.filter(Type=subjects['Type'], IsActivated=False).count()
            if subject_is ==0 and subject_no ==0: #新机种的添加
                AccountTitle.objects.create(**subjects)
                return restful.ok(message="AccountTitle name add success")
            if subject_is == 0 and subject_no == 1: #删除的机种重新添加
                AccountTitle.objects.filter(Type=subjects['Type']).update(Rule=subjects['Rule'],Remark=subjects['Rule'],IsActivated=True,UpdatedTime=datetime.now())
                return restful.ok(message="AccountTitle name add success")
            else:
                return restful.params_error("AccountTitle Type had exist")
        except Exception as e:
            return restful.params_error(repr(e))
#科目的数据抓取
@csrf_exempt
@access_control
def Subjects_info(request):
    if request.method == "GET":
        try:
            page = int(request.GET.get('page'))
            number = request.GET.get('num')
            dict_data = {}
            count = AccountTitle.objects.filter(IsActivated=True).count()
            if number == "All":
                data = list(AccountTitle.objects.filter(IsActivated=True).order_by("-Id").values("Id","Type","Rule","Remark"))
                dict_data['data'] = data
                dict_data['page_count'] = count
                return restful.ok(data=dict_data)
            if number != "All":
                number = int(number)
                page_num = count // int(number)  # 总共多少页
                if count % number > 0:
                    page_num = page_num + 1
                if page_num >= page:
                    accountitle_ob = AccountTitle.objects.order_by("-Id").filter(IsActivated=True)[
                                     (page - 1) * number:number * page]
                    dict_data['data'] = list(accountitle_ob.values("Id","Type","Rule","Remark"))
                    dict_data['page_count'] = page_num
                    return restful.ok(data=dict_data)
                else:
                    return restful.params_error(message="it had no other pages")

            # data =list(AccountTitle.objects.filter(IsActivated=True).values("Id","Type","Rule"))
            # return restful.ok(data=data)
        except Exception as e:
            return restful.params_error(repr(e))
#科目的修改
def Subjects_modify(request):
    if request.method == "POST":
        try:
            subjects={}
            id = request.POST.get("mo_su_id",'')
            subjects['Type'] = request.POST.get("mo_su_type",'')
            subjects['Remark'] = request.POST.get("mo_su_rule",'')
            subjects['Rule'] = request.POST.get("mo_su_formula",'')
            subjects['UpdatedTime']=datetime.now()
            if subjects['Rule'] == "":
                subjects.pop("Rule")
            if subjects['Type'] == "":
                return restful.params_error("subject can't empty")
            AccountTitle.objects.filter(Id=id).update(**subjects)
            return restful.ok(message="AccountTitle modify success")
        except Exception as e:
            return restful.params_error(repr(e))


#删除科目
@csrf_exempt
@access_control
def Subjects_delete(request):
    if request.method == "POST":
        try:
            type = request.POST.get("subjects_type", '')
            AccountTitle.objects.filter(Type=type).update(IsActivated=False,UpdatedTime=datetime.now())
            return restful.ok(message="AccountTitle delete success")
        except Exception as e:
            return restful.params_error(repr(e))
#获取huilv
@csrf_exempt
@access_control
def Rate_info(request):
    if request.method == "GET":
        try:
            dict_data={}
            dict_data['data'] = list(ExchangeRate.objects.filter(IsActivated=True).values())
            return restful.ok(data=dict_data)
        except Exception as e:
            return restful.params_error(repr(e))

#添加
@csrf_exempt
@access_control
def Rate_add(request):
    if request.method == "POST":
        try:
            rate={}
            rate['CreatorId'] = request.session.get('user_Id')
            rate['CurrencyFrom'] = request.POST.get("change_currency", '')
            rate['CurrencyTo'] = request.POST.get("to_currency", '')
            rate['ExchangeRate'] = request.POST.get("change_rate", '')
            rate['UpdatedTime'] = datetime.now()
            ExchangeRate.objects.create(**rate)
            return restful.ok(message="add success")
        except Exception as e:
            return restful.params_error(repr(e))

#修改
@csrf_exempt
@access_control
def Rate_modify(request):
    if request.method == "POST":
        try:
            rate={}
            id = request.POST.get('change_id')
            rate['CurrencyFrom'] = request.POST.get("change_currency", '')
            rate['CurrencyTo'] = request.POST.get("to_currency", '')
            rate['ExchangeRate'] = request.POST.get("change_rate", '')
            rate['UpdatedTime'] = datetime.now()
            ExchangeRate.objects.filter(Id=id).update(**rate)
            return restful.ok(message="modify success")
        except Exception as e:
            return restful.params_error(repr(e))

#删除汇率
@csrf_exempt
@access_control
def Rate_delete(request):
    if request.method == "POST":
        try:
            Id = request.POST.get("del_id", '')
            ExchangeRate.objects.filter(Id=Id).update(IsActivated=False,UpdatedTime=datetime.now())
            return restful.ok(message="ExchangeRate delete success")
        except Exception as e:
            return restful.params_error(repr(e))


#获取费用的信息
@csrf_exempt
@access_control
def Fee_detail(request):
    if request.method == "GET":
        try:
            #连表查询数据
            sql = 'SELECT "FeeLimit"."Id","FeeLimit"."DepartmentId","Department"."Department","FeeLimit"."AccountTitleId","AccountTitle"."Type","LimitCost","LimitPeriod" FROM "FeeLimit"' \
                  ' INNER JOIN "Department" ON "FeeLimit"."DepartmentId" = "Department"."Id" INNER JOIN "AccountTitle" ON "FeeLimit"."AccountTitleId" = "AccountTitle"."Id" '
            cur = connection.cursor()
            cur.execute(sql)
            desc = cur.description
            data = [dict(zip([col[0] for col in desc], row)) for row in cur.fetchall()]
            return restful.ok(data=data)
            # data = list(FeeLimit.objects.filter(Isactivated=True).order_by("Id").values('Id',"D"))
        except Exception as e:
            return restful.params_error(repr(e))



#费用额度限制获取部门和会计科目的数据
@csrf_exempt
@access_control
def Fee_info(request):
    if request.method == "GET":
        try:
            data = {}
            depart_info = list(Department.objects.filter(IsActivated=True).order_by("Id").values("Id","Department"))
            account_info = list(AccountTitle.objects.filter(IsActivated = True).order_by("Id").values("Id","Type"))
            data['depart']=depart_info
            data['account']=account_info
            return restful.ok(data=data)
        except Exception as e:
            return restful.params_error(repr(e))

@csrf_exempt
@access_control
def FeeAdd_limit(request):
    if request.method == "POST":
        try:
            fee = {}
            fee['DepartmentId'] = request.POST.get("DepartmentId", '')
            fee['AccountTitleId'] = request.POST.get("AccountId", '')
            fee['LimitCost'] = request.POST.get("Fee", '')
            fee['LimitPeriod'] = request.POST.get("Fee_period", '')
            fee['CreatorId'] = request.session.get('user_Id')
            fee['UpdatedTime'] = datetime.now()
            if FeeLimit.objects.filter(DepartmentId=fee['DepartmentId'],AccountTitleId=fee['AccountTitleId'],IsActivated=True).count() != 0:
                return restful.params_error(message="this Fee had exist")
            else:
                FeeLimit.objects.create(**fee)
                return restful.ok(message="add success")
        except Exception as e:
            return restful.params_error(repr(e))

@csrf_exempt
@access_control
def FeeModify_limit(request):
    if request.method == "POST":
        try:
            fee = {}
            Id = request.POST.get("Id",'')
            fee['DepartmentId'] = request.POST.get("DepartmentId", '')
            fee['AccountTitleId'] = request.POST.get("AccountId", '')
            fee['LimitCost'] = request.POST.get("Fee", '')
            fee['LimitPeriod'] = request.POST.get("Fee_period", '')
            fee['CreatorId'] = request.session.get('user_Id')
            fee['UpdatedTime'] = datetime.now()
            if FeeLimit.objects.exclude(Id=Id).filter(DepartmentId=fee['DepartmentId'],AccountTitleId=fee['AccountTitleId'],IsActivated=True).count() != 0:
                return restful.params_error(message="this Fee had exist")
            else:
                FeeLimit.objects.filter(Id=Id).update(**fee)
                return restful.ok(message="modify success")
        except Exception as e:
            return restful.params_error(repr(e))

@csrf_exempt
@access_control
def FeeDel_limit(request):
    if request.method == "POST":
        try:
            id = request.POST.get("del_id",'')
            FeeLimit.objects.filter(Id=id).update(Isactivated = False)
            return restful.ok(message='delete success')
        except Exception as e:
            return restful.params_error(repr(e))








