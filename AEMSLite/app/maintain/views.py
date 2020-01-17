from django.shortcuts import render
from django.shortcuts import render, redirect
# from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from app.login.models import User,Department,Customer,BudgetCodeForm,PartItem,PartItemResult,MaintenanceLog,Configuration,LocationLog
from app.login.views import Update_User_IsActivated
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
import pytz
import time
import xlrd
from openpyxl import load_workbook,Workbook
import json
import re
UpdatedTime = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
#进入保养页面的获取数据以及设置保养次数和天数
class maintain_equipment_info(View):
    @csrf_exempt
    def get(self,request):
        try:
            page = int(request.GET.get('page'))
            number = request.GET.get('num')
            #这里是获取近一周的数据，但是由于数据没有更新，所以捞取全部当前300天的数据，后面进行修改天数
            end_time = datetime.now()
            delta = timedelta(days=300)
            start_time = end_time-delta
            dict_data={}
            count = PartItem.objects.order_by("Id").filter(TrnDate__range=(start_time, end_time)).count()
            if number == "All":
                data = PartItem.objects.order_by("-Id").filter(TrnDate__range=(start_time, end_time))
                data = list(data.values())
                for i in range(0,len(data)):
                    if data[i]['LocationId'] == "null":
                        data[i]["Location"] =" "
                    if data[i]['LocationId'] != "null":
                        name = LocationLog.objects.filter(Id=data[i]['LocationId']).values('Id',"Location")
                        if len(name) != 0:
                            data[i]["Location"] = name[0]["Location"]
                        else:
                            data[i]["Location"] = " "
                dict_data['data'] = data
                dict_data['page_count'] = count
                return restful.ok(data=dict_data)
            if number != "All":
                number = int(number)
                page_num = count // number  # 总共多少页
                if count % number > 0:
                    page_num = page_num + 1
                if page_num >= page:
                    data = PartItem.objects.order_by("-Id").filter(TrnDate__range=(start_time, end_time))[
                                   (page - 1) * number:number * page]
                    data = list(data.values())
                    for i in range(0, len(data)):
                        if data[i]['LocationId'] == "null":
                            data[i]["Location"] = " "
                        if data[i]['LocationId'] != "null":
                            name = LocationLog.objects.filter(Id=data[i]['LocationId']).values('Id', "Location")
                            if len(name) != 0:
                                data[i]["Location"] = name[0]["Location"]
                            else:
                                data[i]["Location"] = " "
                    dict_data['data'] = data
                    dict_data['page_count'] = page_num
                    return restful.ok(data=dict_data)
                else:
                    return restful.params_error(message='it had no others page')
        except Exception as e:
            return restful.params_error(message=repr(e))

#重设SN的保养之前的获取数据
@access_control
def maintain_query_SN(request):
    if request.method == "POST":
        SN = request.POST.get('SN','')
        data = list(PartItem.objects.filter(SN=SN).values('CheckCycleCount','CheckCycle','NextCheckDate','Maintainer'))
        try:
            return restful.ok(data=data)
        except Exception as e:
            return restful.params_error(message=repr(e))
#单独的SN的保养更改
@csrf_exempt
@access_control
def maintain_setup_info(request):
    if request.method == "POST":
        try:
            main_count = request.POST.get('main_count','')
            main_cycle = request.POST.get('main_cycle','')
            main_date = request.POST.get('main_date','')
            main_sn = request.POST.get('main_sn','')
            main_user = request.POST.get('main_user','')
            main_days = request.POST.get('main_days','')
            main_times = request.POST.get('main_times','')
            main_maintainers = request.POST.getlist('main_maintainers[]','')
            modify_ob = PartItem.objects.get(SN=main_sn)
            log_usedTimes = list(MaintenanceLog.objects.filter(PartItemId=modify_ob.Id).order_by('-UpdatedTime').values())
            if main_user != "":
                maintainer = User.objects.filter(Name=main_user).count()
                if maintainer ==0:
                    return restful.params_error(message="user name not exist")
                else:
                    modify_ob.Maintainer = main_user
            #重设保养次数和周期的设置方法 有保养记录和没有保养记录
            if main_count !="" and len(log_usedTimes) !=0:
                if int(main_count)< log_usedTimes[0]['UsedTimes'] and int(main_count) !=0:
                    return restful.params_error(message="modify maintain_count error")
                else:
                    modify_ob.CheckCycleCount =main_count
                    modify_ob.NextCheckCount = int(main_count)+log_usedTimes[0]['UsedTimes']
            if main_count != "" and len(log_usedTimes) == 0:
                if int(main_count)<modify_ob.UsedTimes and int(main_count) !=0:
                    return restful.params_error(message="modify maintain_count error")
                else:
                    modify_ob.CheckCycleCount = main_count
                    modify_ob.NextCheckCount = main_count
            if main_count != "":
                if int(main_count) == 0:
                    modify_ob.CheckCycleCount = 0
                    modify_ob.NextCheckCount = 0
            #重设保养周期和下次保养日期的方法
            if main_cycle != "" and main_date != "" and  int(main_cycle) != 0:
                modify_ob.CheckCycle = main_cycle
                modify_ob.NextCheckDate =main_date
            if main_cycle != "" and main_date == "" and  int(main_cycle) != 0:
                modify_ob.CheckCycle = main_cycle
                if len(log_usedTimes) == 0:
                    modify_ob.NextCheckDate = datetime.strptime(str(modify_ob.UpdatedTime).split(' ')[0], "%Y-%m-%d")+timedelta(days=int(main_cycle))
                else:
                    modify_ob.NextCheckDate = datetime.strptime(str(log_usedTimes[0]['MaintenanceDate']).split(' ')[0],"%Y-%m-%d") + timedelta(days=int(main_cycle))
            if main_cycle =="" and main_date != "":
                modify_ob.NextCheckDate = main_date
            if main_cycle != "":
                if int(main_cycle) == 0:
                    modify_ob.NextCheckDate = None
            #重设保养提前天数和次数以及第二保养人
            if main_days != "":
                modify_ob.WarningBeforeDays = int(main_days)
            if main_times != "":
                modify_ob.WarningBeforeTimes = int(main_times)
            if main_maintainers != "":
                namelist = []
                for i in range(0,len(main_maintainers)):
                    namelist.append(list(User.objects.filter(Id=main_maintainers[i]).values("Name"))[0]['Name'])
                modify_ob.SubMaintainers = ','.join(namelist)
                modify_ob.SubMaintainerIds = ','.join(main_maintainers)
            modify_ob.save()
            return restful.ok(message="maintain modify success")
        except Exception as e:
            return restful.params_error(message=repr(e))

#查询数据的函数
@csrf_exempt
@access_control
def maintain_query_part_name_data(request):
    if request.method == "POST":
        try:
            page = int(request.POST.get('page'))
            number = request.POST.get('num')
            start_time = request.POST['main_start_time']
            end_t = request.POST['main_end_time']
            SN = str(request.POST['main_sn'])
            Spec = str(request.POST['main_partname'])
            main_user = str(request.POST['main_user'])
            main_location = str(request.POST['main_location'])
            main_UseStatus = str(request.POST['main_UseStatus'])
            sql = 'SELECT "Id","SN","PN","PartName","Spec","CheckCycleCount","UsedTimes","CheckCycle","NextCheckDate","Maintainer","LocationId","UseStatus" FROM "PartItem" where 1=1 '
            sql_count ='select count(*) from "PartItem" where 1=1'
            dict_data = {}
            if start_time !="":
                sql = sql+' AND "TrnDate" >=\'%{0}%\''.format(start_time)
                sql_count = sql_count+' AND "TrnDate" >=\'%{0}%\''.format(start_time)
            if end_t !="":
                sql = sql+' AND "TrnDate" <=\'%{0}%\''.format(end_t)
                sql_count = sql_count+' AND "TrnDate" <=\'%{0}%\''.format(end_t)
            if SN !="":
                sql = sql+' AND "SN" =\'' + SN + '\''
                sql_count = sql_count+' AND "SN" =\'' + SN + '\''
            if Spec !="":
                sql = sql+' AND "Spec" ilike \'%' + Spec + '%\''
                sql_count = sql_count+' AND "Spec" ilike \'%' + Spec + '%\''
            if main_user != "":
                sql = sql + 'AND "Maintainer" ilike \'%' + main_user + '%\''
                sql_count = sql_count+'AND "Maintainer" ilike \'%' + main_user + '%\''
            if main_UseStatus != "":
                sql = sql + 'AND "UseStatus" = \'' + main_UseStatus + '\''
                sql_count = sql_count+'AND "UseStatus" = \'' + main_UseStatus + '\''
            if main_location != "":
                isd = 'select "Id" from "LocationLog" where "Location" ilike \'%'+main_location+'%\''
                sql = sql+'AND "LocationId" in ('+isd+')'
                sql_count = sql_count+'AND "LocationId" in ('+isd+')'
            cur = connection.cursor()
            cur.execute(sql_count)
            count = cur.fetchall()  # 获取赛选的条件的总数值
            if number == "All":
                cur = connection.cursor()
                cur.execute(sql+' order by "Id" desc')
                data = cur.fetchall()
                for i in range(0, len(data)):
                    data[i] = list(data[i])
                    if data[i][10] == "null":
                        data[i].append(" ")
                    if data[i][10] != "null":
                        name = LocationLog.objects.filter(Id=data[i][10]).values('Id', "Location")
                        if len(name) != 0:
                            data[i].append(name[0]["Location"])
                        else:
                            data[i].append(" ")
                dict_data['data'] = data
                dict_data['page_count'] = count[0][0]
                return restful.ok(data=dict_data)
            if number != "All":
                number = int(number)
                count_page = count[0][0] // number  # 总数除以一页显示多少条，得到总的页数
                if count[0][0] % number > 0:
                    count_page += 1
                if page <= count_page:
                    sql = sql + ' order by "Id" desc limit ' + str(number) + ' offset ' + str((page - 1)*number)
                    cur = connection.cursor()
                    cur.execute(sql)
                    data = cur.fetchall()
                    for i in range(0, len(data)):
                        data[i]=list(data[i])
                        if data[i][10] == "null":
                            data[i].append(" ")
                        if data[i][10] != "null":
                            name = LocationLog.objects.filter(Id=data[i][10]).values('Id', "Location")
                            if len(name) != 0:
                                data[i].append(name[0]["Location"])
                            else:
                                data[i].append(" ")
                    dict_data['data'] = data
                    dict_data['page_count'] = count_page
                else:
                    return restful.params_error(message="it had no other pages")
                return restful.ok(data=dict_data)
        except Exception as e:
            return restful.params_error(message=repr(e))

#by PN的批量更改
@csrf_exempt
@access_control
def maintain_setup_by_pn(request):
    if request.method == "POST":
        try:
            main_pn = request.POST['main_partname']
            main_count = request.POST['main_count']
            main_day = request.POST['main_day']
            main_date = request.POST['main_date']
            main_user = request.POST['main_user']
            main_days = request.POST.get('main_days', '')
            main_times = request.POST.get('main_times', '')
            main_maintainers = request.POST.getlist('main_maintainers[]', '')
            result = PartItem.objects.filter(PN=main_pn).count()
            if result >0:
                SN_ob = list(PartItem.objects.filter(PN=main_pn).values('SN'))
                for i in range(0,len(SN_ob)):
                    modify_ob = PartItem.objects.get(SN=SN_ob[i]['SN'])
                    if main_user != "":
                        maintainer = User.objects.filter(Name=main_user).count()
                        if maintainer == 0:
                            return restful.params_error(message="user name not exist")
                        else:
                            modify_ob.Maintainer = main_user

                    if main_count != "" and modify_ob.UsedTimes <= int(main_count):
                        modify_ob.CheckCycleCount = main_count
                    if main_count != "" and modify_ob.UsedTimes > int(main_count):
                        return restful.params_error(message="modify maintain_count error")

                    if main_day != "" and modify_ob.NextCheckDate == None and main_date == "":
                        modify_ob.CheckCycle = main_day
                        modify_ob.NextCheckDate = datetime.strptime(str(modify_ob.TrnDate).split(' ')[0],
                                                                    "%Y-%m-%d") + timedelta(days=int(main_day))
                    if main_day != "" and modify_ob.NextCheckDate != None and main_date == "":
                        modify_ob.CheckCycle = main_day
                        modify_ob.NextCheckDate = datetime.strptime(str(modify_ob.NextCheckDate).split(' ')[0],
                                                                    "%Y-%m-%d") + timedelta(days=int(main_day))
                    if main_date != "" and main_day != "":
                        modify_ob.CheckCycle = main_day
                        modify_ob.NextCheckDate = main_date
                    if main_days != "":
                        modify_ob.WarningBeforeDays = int(main_days)
                    if main_times != "":
                        modify_ob.WarningBeforeTimes = int(main_times)
                    if main_maintainers != "":
                        namelist = []
                        for i in range(0, len(main_maintainers)):
                            namelist.append(list(User.objects.filter(Id=main_maintainers[i]).values("Name"))[0]['Name'])
                        modify_ob.SubMaintainers = ','.join(namelist)
                        modify_ob.SubMaintainerIds = ','.join(main_maintainers)
                    modify_ob.save()
                return restful.ok(message="maintain modify success")
            else:
                return restful.params_error(message="PN query is null")
        except Exception as e:
            return restful.params_error(message=repr(e))

#添加设备之前的位置获取
def maintain_location(request):
    if request.method == "GET":
        try:
            data = list(LocationLog.objects.order_by("-Id").values("Id","Location"))
            return restful.ok(data=data)
        except Exception as e:
            return restful.params_error(repr(e))

#进入添加设备页面的函数的动作做添加设备手动输入的函数
@csrf_exempt
@access_control
def maintain_add_equipment(request):
    if request.method == "POST":
        try:
            add_dict = {}
            add_dict['USN'] = request.POST.get("USN","")
            add_dict['SN'] = request.POST.get("SN","")
            add_dict['OSN'] = request.POST.get("OSN","")
            add_dict['PN'] = request.POST.get("PN","")
            add_dict['PartName'] = request.POST.get("PartName","")
            add_dict['Spec'] = request.POST.get("Spec","")
            add_dict['UsedTimes'] = request.POST.get("UsedTimes",'')
            add_dict['UpdatedTime']=UpdatedTime
            add_dict['CheckCycle'] = request.POST.get("CheckCycle",'')
            add_dict['CheckCycleCount'] = request.POST.get("CheckCycleCount",'')
            add_dict['NextCheckCount']=''
            add_dict['NextCheckDate'] = request.POST.get("NextCheckDate",'')
            add_dict['ErrorCounts']=0
            add_dict['TrnDate']=datetime.now()
            add_dict['NGRate']=0
            add_dict['Maintainer'] = request.POST.get("Maintainer","")
            add_dict['Asset'] = request.POST.get("Asset","")
            add_dict['CreatorId'] = request.session['user_Id']
            add_dict['LocationId'] = int(request.POST.get("location",""))
            add_dict['UseStatus'] = request.POST.get("usestatus","")
            add_dict['WarningBeforeDays'] = request.POST.get('maintain_days', '')
            add_dict['WarningBeforeTimes'] = request.POST.get('maintain_times', '')
            add_dict['SubMaintainerIds'] = request.POST.getlist('maintainers[]', '')
            #检查SN的查重性
            SN_ob = PartItem.objects.filter(SN=add_dict['SN']).count()
            if SN_ob !=0:
                return restful.params_error(message="SN exist")
            #检查负责人的正确性
            if add_dict['Maintainer'] != "":
                maintainter_ob = list(User.objects.filter(Name=add_dict['Maintainer']).values())
                if len(maintainter_ob) ==0:
                    add_dict.pop('Maintainer')
                    return restful.params_error(message="Maintainter not exist")
                else:
                    add_dict['MaintainerId'] =maintainter_ob[0]['Id']
            # 计算下次保养次数的方法
            if add_dict['CheckCycleCount'] != '':
                add_dict['NextCheckCount'] = int(add_dict['CheckCycleCount'])
            # 计算下次保养日期的方法
            if add_dict['CheckCycle'] != "":
                start = datetime.now()
                add_dict['NextCheckDate'] = (start + timedelta(days=int(add_dict['CheckCycle'])))
            #检查位置是否存在的方法
            #因为这里通过手动添加的是位置是获取的，多以不用去验证
            #判断可以为空的就删除
            if add_dict['USN'] == "":
                add_dict.pop('USN')
            if add_dict['OSN'] == "":
                add_dict.pop('OSN')
            if add_dict['CheckCycle'] == "":
                add_dict.pop('CheckCycle')
            if add_dict['CheckCycleCount'] == "":
                add_dict.pop('CheckCycleCount')
            if add_dict['NextCheckCount'] == "":
                add_dict.pop('NextCheckCount')
            if add_dict['NextCheckDate'] == "":
                add_dict.pop('NextCheckDate')
            if add_dict['Asset'] == "":
                add_dict.pop('Asset')
            if add_dict['Maintainer'] == "":
                add_dict.pop('Maintainer')
            if add_dict['WarningBeforeDays'] == "":
                add_dict.pop('WarningBeforeDays')
            if add_dict['WarningBeforeTimes'] == "":
                add_dict.pop('WarningBeforeTimes')
            if len(add_dict['SubMaintainerIds']) != 0:
                namelist=[]
                for i in range(0,len(add_dict['SubMaintainerIds'])):
                    namelist.append(list(User.objects.filter(Id=add_dict['SubMaintainerIds'][i]).values("Name"))[0]['Name'])
                add_dict['SubMaintainerIds'] =','.join(add_dict['SubMaintainerIds'])
                add_dict['SubMaintainers'] =','.join(namelist)
            PartItem.objects.create(**add_dict)
            return restful.ok(message="add equipment succeed")
        except Exception as e:
            return restful.params_error(repr(e))

#进入添加设备的页面的 函数的动作 做批量数据的插入表里
@csrf_exempt
@access_control
def maintain_add_equipment_ex(request):
    if request.method == "POST":
        try:
            id = int(request.session['user_Id'])
            file = request.FILES.get('file','')
            file_type = file.name.split('.')[1]
            insert_data = []
            if file_type in ['xlsx','xls']:
                """下面隐藏的部分是保存用户上传的数据，做保存和导入数据库的动作，目前是采用的是不用保存数据的方法"""
                # file_name=file.name
                # file_path = os.path.join(settings.MEDIA_ADD_ROOT, file_name)
                #开始解析上传excle的数据
                # with open(file_path,'wb') as f:
                #     for chunk in file.chunks():
                #         f.write(chunk)
                # wb =xlrd.open_workbook(settings.BASE_DIR+'/maintain/'+file.name)
                # wb =xlrd.open_workbook(file_path)
                wb =xlrd.open_workbook(filename=None,file_contents=file.read())# 不用保存到本地的数据方式
                sheet = wb.sheet_by_index(0)  #拿到第一个文件的簿
                maps ={
                    0:'SN',
                    1:'USN',
                    2:'OSN',
                    3:'Asset',
                    4:'PN',
                    5:'PartName',
                    6:'Spec',
                    7:'UsedTimes',
                    8:'CheckCycle',
                    9:'CheckCycleCount',
                    10:'NextCheckDate',
                    11:'Maintainer',
                    12:'LocationId',
                    13:'UseStatus',
                    14:'WarningBeforeDays',
                    15:'WarningBeforeTimes',
                    16:'SubMaintainers',
                }
                for index in range(1,sheet.nrows):
                    row= sheet.row(index)  #逐行读取文件的内容
                    row_dict = {}
                    for i in range(len(maps)):
                        key = maps[i]
                        cell = row[i]
                        row_dict[key] = str(cell.value)
                        # row_dict['result'] = ""
                    #针对表里面的日期的处理
                    if row_dict['NextCheckDate'] != "":
                        data_value = xlrd.xldate_as_tuple(eval(row_dict['NextCheckDate']), wb.datemode)
                        row_dict['NextCheckDate'] = date(*data_value[:3])
                    else:
                        row_dict.pop('NextCheckDate')
                    if row_dict['UsedTimes'] != "":
                        row_dict['UsedTimes'] = int(eval(row_dict['UsedTimes']))
                    else:
                        row_dict['UsedTimes'] =0
                    if row_dict['CheckCycle'] != "":
                        row_dict['CheckCycle'] = int(eval(row_dict['CheckCycle']))
                    else:
                        row_dict.pop('CheckCycle')
                    if row_dict['CheckCycleCount'] != "":
                        row_dict['CheckCycleCount'] = int(eval(row_dict['CheckCycleCount']))
                    else:
                        row_dict.pop("CheckCycleCount")
                    if row_dict['WarningBeforeDays'] != "":
                        row_dict['WarningBeforeDays'] = int(eval(row_dict['WarningBeforeDays']))
                    else:
                        row_dict.pop("WarningBeforeDays")
                    if row_dict['WarningBeforeTimes'] != "":
                        row_dict['WarningBeforeTimes'] = int(eval(row_dict['WarningBeforeTimes']))
                    else:
                        row_dict.pop("WarningBeforeTimes")
                    if row_dict['SubMaintainers'] != "":
                        namelist = row_dict['SubMaintainers'].split(',')
                        nameIds =[]
                        for i in range(0,len(namelist)):
                            user_yanzheng =User.objects.filter(Name=namelist[i]).values('Id').count()
                            if user_yanzheng==0:
                                return restful.params_error(message="user_name not exist")
                            nameIds.append( str( list(User.objects.filter(Name=namelist[i]).values('Id'))[0]['Id'] ) )
                        row_dict['SubMaintainers'] = ','.join(namelist)
                        row_dict['SubMaintainerIds'] = ','.join(nameIds)
                    else:
                        row_dict.pop("SubMaintainers")
                    row_dict['ErrorCounts']=0
                    row_dict['NGRate']=0
                    row_dict['CreatorId']=id
                    yanzheng = PartItem.objects.filter(SN=row_dict['SN']).count()
                    maintainer = User.objects.filter(Name=row_dict['Maintainer']).count()
                    location = LocationLog.objects.filter(Location=row_dict['LocationId']).count()
                    result = ""
                    if maintainer ==0:
                        result = result +" Maintainer not exist,"
                    if maintainer !=0:
                        row_dict['MaintainerId'] = (User.objects.filter(Name=row_dict['Maintainer']).values('Id'))[0]['Id']
                    if yanzheng !=0:
                        result = result +" SN exist,"
                    if row_dict['SN'] == '':
                        result = result+" SN empty,"
                    if row_dict['PN'] == '':
                        result = result+" PN empty,"
                    if row_dict['PartName'] == '':
                        result = result + " PartName empty,"
                    if row_dict['Spec'] == '':
                        result = result + " Spec empty,"
                    if row_dict['UseStatus'] == '':
                        result = result + " UseStatus empty,"
                    if location ==0:
                        result =result+" Location not exist"
                        row_dict.pop("LocationId")
                    if location !=0:
                        row_dict['LocationId']=(LocationLog.objects.filter(Location=row_dict['LocationId']).values('Id'))[0]['Id']
                    if row_dict['UseStatus'] != '':
                        row_dict['UseStatus']= "".join(re.findall(r'[a-z]',row_dict['UseStatus'].lower()))
                    if yanzheng ==0 and row_dict['PN'] != '' and row_dict['PartName'] != '' and row_dict['Spec'] != '':
                        PartItem.objects.create(**row_dict)
                        result = 'Success'
                        # PartItem.objects.create(SN=row_dict['SN'],USN=row_dict['USN'],OSN=row_dict['OSN'], PN=row_dict['PN']
                        #                         , PartName=row_dict['PartName'], Spec=row_dict['Spec'], UsedTimes=row_dict['UsedTimes']
                        #                         , CheckCycle=row_dict['CheckCycle']
                        #                         , CheckCycleCount=row_dict['CheckCycleCount']
                        #                         , NextCheckDate=row_dict['NextCheckDate']
                        #                         , ErrorCounts=0, NGRate=0, Maintainer=row_dict['Maintainer'],Asset=row_dict['Asset']
                        #                         ,CreatorId=id)
                    row_dict['result'] = result
                    insert_data.append(row_dict)
            else:
                return restful.params_error(message="document file type error")

            return restful.ok(data=insert_data)
        except Exception as e:
            return restful.params_error(message=repr(e))
#进入我添加的设备页面并展示出来
@access_control
def maintain_add_equipment_log(request):
    if request.method == "GET":
        try:
            id = request.session['user_Id']
            page = int(request.GET.get('page'))
            number = request.GET.get('num')
            dict_data = {}
            count = PartItem.objects.order_by("-Id").filter(CreatorId=id).count()
            if number == "All":
                my_data = list(PartItem.objects.order_by("-Id").filter(CreatorId=id).values())
                for i in range(0,len(my_data)):
                    if my_data[i]['LocationId'] == None:
                        my_data[i]["Location"] = " "
                    if my_data[i]['SubMaintainers'] == None:
                        my_data[i]['SubMaintainers'] = ""
                    if my_data[i]['WarningBeforeDays'] == None:
                        my_data[i]['WarningBeforeDays'] = ""
                    if my_data[i]['WarningBeforeTimes'] == None:
                        my_data[i]['WarningBeforeTimes'] = ""
                    if my_data[i]['LocationId'] != None:
                        name = LocationLog.objects.filter(Id=my_data[i]['LocationId']).values('Id',"Location")
                        if len(name) != 0:
                            my_data[i]["Location"] = name[0]["Location"]
                        else:
                            my_data[i]["Location"] = " "
                dict_data['data'] = my_data
                dict_data['page_count'] = count
                return restful.ok(data=dict_data)
            if number != "All":
                number = int(number)
                page_num = count // number  # 总共多少页
                if count % number > 0:
                    page_num = page_num + 1
                if page_num >= page:
                    data = PartItem.objects.order_by("-Id").filter(CreatorId=id).values()[(page - 1) * number:number * page]
                    data = list(data.values())
                    for i in range(0, len(data)):
                        if data[i]['LocationId'] == None:
                            data[i]["Location"] = " "
                        if data[i]['SubMaintainers'] == None:
                            data[i]['SubMaintainers'] = ""
                        if data[i]['WarningBeforeDays'] == None:
                            data[i]['WarningBeforeDays'] = ""
                        if data[i]['WarningBeforeTimes'] == None:
                            data[i]['WarningBeforeTimes'] = ""
                        if data[i]['LocationId'] != None:
                            name = LocationLog.objects.filter(Id=data[i]['LocationId']).values('Id', "Location")
                            if len(name) != 0:
                                data[i]["Location"] = name[0]["Location"]
                            else:
                                data[i]["Location"] = " "
                    dict_data['data'] = data
                    dict_data['page_count'] = page_num
                    return restful.ok(data=dict_data)
                else:
                    return restful.params_error(message='it had no others page')

            return restful.ok(message='')
        except Exception as e:
            return restful.params_error(repr(e))
#对于我添加的设备页面展示出来的信息进行相关查询动作的响应
@access_control
def maintain_query_my_log(request):
    if request.method == "POST":
        try:
            id = str(request.session['user_Id'])
            page = int(request.POST.get('page'))
            number = request.POST.get('num')
            log_s_time = request.POST['log_s_time']
            log_e_time = request.POST['log_e_time']
            log_SN = str(request.POST['log_SN'])
            log_PN = str(request.POST['log_PN'])
            log_Spec = str(request.POST['log_Spec'])
            log_PartName = str(request.POST['log_PartName'])
            log_maintainer = str(request.POST['log_maintainer'])
            log_location = str(request.POST['log_location'])
            log_UseStatus = str(request.POST['log_UseStatus'])
            sql_count = 'select count(*) from "PartItem" where "PartItem"."CreatorId"=\''+id+'\''
            sql = 'select "Id","SN","USN","OSN","Asset","PN","PartName","Spec","CheckCycleCount","CheckCycle","UsedTimes",to_char("NextCheckDate",\'yyyy-MM-dd\'),"Maintainer","CreatedTime","LocationId","UseStatus","WarningBeforeDays","WarningBeforeTimes","SubMaintainers" FROM "PartItem" where "PartItem"."CreatorId"=\''+id+'\''
            dict_data = {}
            if log_s_time != "":
                sql = sql + ' AND "CreatedTime" >=\'%{0}%\''.format(log_s_time)
                sql_count = sql_count + ' AND "CreatedTime" >=\'%{0}%\''.format(log_s_time)
            if log_e_time != "":
                sql = sql + ' AND "CreatedTime" <=\'%{0}%\''.format(log_e_time)
                sql_count = sql_count + ' AND "CreatedTime" <=\'%{0}%\''.format(log_e_time)
            if log_SN != "":
                sql = sql + ' AND "PartItem"."SN" =\'' + log_SN + '\''
                sql_count = sql_count + ' AND "PartItem"."SN" =\'' + log_SN + '\''
            if log_PN != "":
                sql = sql + ' AND "PartItem"."PN" ilike \'%' + log_PN + '%\''
                sql_count = sql_count + ' AND "PartItem"."PN" ilike \'%' + log_PN + '%\''
            if log_Spec != "":
                sql = sql + ' AND "PartItem"."Spec" ilike \'%' + log_Spec + '%\''
                sql_count = sql_count + ' AND "PartItem"."Spec" ilike \'%' + log_Spec + '%\''
            if log_PartName != "":
                sql = sql + ' AND "PartItem"."PartName" ilike \'%' + log_PartName + '%\''
                sql_count = sql_count + ' AND "PartItem"."PartName" ilike \'%' + log_PartName + '%\''
            if log_maintainer != "":
                sql = sql + ' AND "PartItem"."Maintainer" ilike \'%' + log_maintainer + '%\''
                sql_count = sql_count + ' AND "PartItem"."Maintainer" ilike \'%' + log_maintainer + '%\''
            if log_UseStatus != "":
                sql = sql + ' AND "PartItem"."UseStatus" = \'' + log_UseStatus + '\''
                sql_count = sql_count + ' AND "PartItem"."UseStatus" = \'' + log_UseStatus + '\''
            if log_location != "":
                isd = 'select "Id" from "LocationLog" where "Location" ilike \'%'+log_location+'%\''
                sql = sql+'AND "LocationId" in ('+isd+')'
                sql_count = sql_count+'AND "LocationId" in ('+isd+')'
            cur = connection.cursor()
            cur.execute(sql_count)
            count = cur.fetchall()  # 获取赛选的条件的总数值
            if number == "All":
                cur = connection.cursor()
                cur.execute(sql+' order by "Id" desc')
                data = cur.fetchall()
                for i in range(0, len(data)):
                    data[i] = list(data[i])
                    if data[i][14] == "null":
                        data[i].append(" ")
                    if data[i][14] != "null":
                        name = LocationLog.objects.filter(Id=data[i][14]).values('Id', "Location")
                        if len(name) != 0:
                            data[i].append(name[0]["Location"])
                        else:
                            data[i].append(" ")
                dict_data['data'] = data
                dict_data['page_count'] = count[0][0]
                return restful.ok(data=dict_data)
            if number != "All":
                number = int(number)
                count_page = count[0][0] // number  # 总数除以一页显示多少条，得到总的页数
                if count[0][0] % number > 0:
                    count_page += 1
                if page <= count_page:
                    sql = sql + ' order by "Id" desc limit ' + str(number) + ' offset ' + str((page - 1) * number)
                    cur = connection.cursor()
                    cur.execute(sql)
                    data = cur.fetchall()
                    for i in range(0, len(data)):
                        data[i] = list(data[i])
                        if data[i][16] == None:
                            data[i][16] = ""
                        if data[i][17] == None:
                            data[i][17] = ""
                        if data[i][18] == None:
                            data[i][18] = ""
                        if data[i][14] == None:
                            data[i].append(" ")
                        if data[i][14] != None:
                            name = LocationLog.objects.filter(Id=data[i][14]).values('Id', "Location")
                            if len(name) != 0:
                                data[i].append(name[0]["Location"])
                            else:
                                data[i].append(" ")
                    dict_data['data'] = data
                    dict_data['page_count'] = count_page
                else:
                    return restful.params_error(message="it had no other pages")
                return restful.ok(data=dict_data)
            return restful.ok(message='')
        except Exception as e:
            return restful.params_error(repr(e))
#对于我添加的设备页面进行修改动作
@access_control
def maintain_modify_log(request):
    if request.method == "POST":
        try:
            mo_sn = request.POST.get("mo_sn",'')

            mo_usn = request.POST.get("mo_usn",'')
            mo_osn = request.POST.get("mo_osn",'')
            mo_asset = request.POST.get("mo_asset",'')
            mo_pn = request.POST.get("mo_pn",'')
            mo_partname = request.POST.get("mo_partname",'')
            mo_spec = request.POST.get("mo_spec",'')

            mo_used_time = request.POST.get("mo_used_time",'')
            mo_next_time = request.POST.get("mo_next_time",'')

            mo_name = request.POST.get("mo_name",'')
            mo_location = request.POST.get("mo_location",'')
            mo_status = request.POST.get("mo_status",'')

            mo_days = request.POST.get('mo_days', '')
            mo_times = request.POST.get('mo_times', '')

            mo_maintainers = request.POST.getlist('mo_maintainers[]', '')
            # #重设保养次数的方法
            # SN_data =list(PartItem.objects.filter(SN=mo_sn).values("UsedTimes","NextCheckDate","TrnDate"))
            # if mo_count !="" and mo_used_time == "":
            #     if int(SN_data[0].UsedTimes) > int(mo_count):
            #         return restful.params_error(message="modify maintain_count error")
            #     else:
            #         PartItem.objects.filter(SN=mo_sn).update(CheckCycleCount=mo_count)
            # if mo_used_time != "" and mo_count != "":
            #     if int(mo_used_time)>int(mo_count):
            #         return restful.params_error(message="modify maintain_count error")
            #     else:
            #         PartItem.objects.filter(SN=mo_sn).update(CheckCycleCount=mo_count,UsedTimes=mo_used_time)
            # #重设保养周期（时间）的方法
            # if mo_time !="" and SN_data[0]['NextCheckDate'] !=None and mo_next_time == "":
            #     next_time = datetime.strptime(str(SN_data[0]['NextCheckDate']).split(' ')[0], "%Y-%m-%d")+timedelta(days=int(mo_time))
            #     PartItem.objects.filter(SN=mo_sn).update(CheckCycle=mo_time,NextCheckDate=next_time)
            # if mo_time =="" and SN_data[0]['NextCheckDate'] == None and mo_next_time == "":
            #     next_time = datetime.strptime(str(SN_data[0]['TrnDate']).split(' ')[0], "%Y-%m-%d") + timedelta(days=int(mo_time))
            #     PartItem.objects.filter(SN=mo_sn).update(CheckCycle=mo_time, NextCheckDate=next_time)
            # if mo_time !="" and mo_next_time !="":
            #     PartItem.objects.filter(SN=mo_sn).update(CheckCycle=mo_time, NextCheckDate=mo_next_time)
            if mo_usn != "":
                PartItem.objects.filter(SN=mo_sn).update(USN=mo_usn)
            if mo_osn != "":
                PartItem.objects.filter(SN=mo_sn).update(OSN=mo_osn)
            if mo_asset != "":
                PartItem.objects.filter(SN=mo_sn).update(Asset=mo_asset)
            if mo_name != "":
                maintainer = User.objects.filter(Name=mo_name).count()
                if maintainer != 0:
                    PartItem.objects.filter(SN=mo_sn).update(Maintainer=mo_name)
                else:
                    return restful.params_error(message="user name not exist")
            if mo_used_time != "":
                PartItem.objects.filter(SN=mo_sn).update(UsedTimes=mo_used_time)
            if mo_next_time != "":
                PartItem.objects.filter(SN=mo_sn).update(NextCheckDate=mo_next_time)
            if mo_status != "":
                PartItem.objects.filter(SN=mo_sn).update(UseStatus=mo_status)
            if mo_location != "":
                PartItem.objects.filter(SN=mo_sn).update(LocationId=int(mo_location))
            if len(mo_maintainers) != 0:
                namelist = []
                for i in range(0, len(mo_maintainers)):
                    namelist.append(list(User.objects.filter(Id=mo_maintainers[i]).values("Name"))[0]['Name'])
                PartItem.objects.filter(SN=mo_sn).update(SubMaintainers=','.join(namelist),SubMaintainerIds=','.join(mo_maintainers))
            if mo_days =="":
                mo_days=None
            else:
                mo_days =int(mo_days)
            if mo_times =="":
                mo_times=None
            else:
                mo_times =int(mo_times)
            PartItem.objects.filter(SN=mo_sn).update(PN=mo_pn,PartName=mo_partname,Spec=mo_spec,WarningBeforeDays=mo_days,WarningBeforeTimes=mo_times)

            return restful.ok(message="modify data is success")
        except Exception as e:
            return restful.params_error(repr(e))
#对于我添加的设备页面进行删除动作
@access_control
def maintain_delete_log(request):
    if request.method == "POST":
        try:
            id = request.POST.get("id",'')
            PartItem.objects.filter(Id=id).delete()
            MaintenanceLog.objects.filter(PartItemId=id).delete()

            return restful.ok(message='delete success')
        except Exception as e:
            return restful.params_error(repr(e))

#进入设备保养的筛选出来用户需要的数据之后给页面
# @csrf_exempt
# @access_control
# def maintain_query_operation(request):
#     if request.method =="POST":
#         try:
#             SN = str(request.POST['sn'])
#             PN = str(request.POST['pn'])
#             Status = request.POST['status']
#             Next_maintain_time = request.POST['next_time']
#             Next_maintain_time_1 = request.POST['next_time_1']
#             dict_data={}
#             end_time = datetime.now()
#             current_time = end_time.strftime('%Y-%m-%d')
#             count = Configuration.objects.get(Type="mt_count")
#             date = Configuration.objects.get(Type="mt_date")
#             date = int(date.Max)
#             delta = timedelta(date)
#             check_time = end_time + delta
#             count = str(int(count.Max))
#             limit_value1 = list(Configuration.objects.filter(Type="mt_count").values("Max", "Id"))
#             limit_value2 = list(Configuration.objects.filter(Type="mt_date").values("Max", "Id"))
#             sql = 'SELECT "Id","SN","PN","CheckCycleCount","UsedTimes","CheckCycle","NextCheckDate","NextCheckCount","PartName" FROM "PartItem" where 1=1 '
#             # 正常的条件设置
#             sql_n_t = 'OR ( to_char("NextCheckDate",\'yyyy-MM-dd\') !=\'None\' AND "NextCheckCount" =0 AND to_char("NextCheckDate",\'yyyy-MM-dd\') >\'' + check_time.strftime("%Y-%m-%d") + '\')'
#             sql_n_c = 'OR ("NextCheckDate" IS NULL AND "NextCheckCount" !=0 AND "NextCheckCount"-"UsedTimes" > ' + count + ')'
#             # 预警的条件设置
#             sql_w_t = 'OR (to_char("NextCheckDate",\'yyyy-MM-dd\') !=\'None\' AND "NextCheckCount" =0 AND to_char("NextCheckDate",\'yyyy-MM-dd\') >=\'' + end_time.strftime(
#                 "%Y-%m-%d") + '\' AND to_char("NextCheckDate",\'yyyy-MM-dd\') <= \'' + check_time.strftime("%Y-%m-%d") + '\')'
#             sql_w_c = 'OR ( "NextCheckDate" IS NULL AND "NextCheckCount" !=0 AND "NextCheckCount"-"UsedTimes" <= ' + count + ' AND "NextCheckCount"-"UsedTimes" >= 0)'
#             # 超标的条件设置
#             sql_t = 'OR ( to_char("NextCheckDate",\'yyyy-MM-dd\') !=\'None\' AND "NextCheckCount" =0 AND "NextCheckDate" <\'' + current_time + '\')'
#             sql_c = 'OR ("NextCheckDate" IS NULL AND "NextCheckCount" !=0 AND "NextCheckCount"-"UsedTimes" < 0 ) '
#             if SN !="":
#                 sql = sql+' AND "SN" =\'' + SN + '\''
#             if PN !="":
#                 sql = sql+' AND "PN" ilike \'%' + PN + '%\''
#             if Status == "正常":
#                 sql = sql + 'AND (to_char("NextCheckDate",\'yyyy-MM-dd\') !=\'None\' AND "NextCheckCount" !=0 AND "NextCheckCount"-"UsedTimes" > '+count+' AND "NextCheckDate" >\''+check_time.strftime("%Y-%m-%d")+'\')'
#                 sql= sql +sql_n_t+sql_n_c
#             if Status == "预警":
#                 sql = sql + ' AND (to_char("NextCheckDate",\'yyyy-MM-dd\') !=\'None\' AND "NextCheckCount" !=0 AND (("NextCheckCount"-"UsedTimes" <= ' + count + ' AND "NextCheckCount"-"UsedTimes" >= 0 AND "NextCheckDate" >=\'' + current_time + '\')'
#                 sql = sql + ' OR  (to_char("NextCheckDate",\'yyyy-MM-dd\')>=\'' + current_time + '\' AND "NextCheckDate" <= \'' + check_time.strftime("%Y-%m-%d") + '\' AND "NextCheckCount"-"UsedTimes">=0))'
#                 sql = sql + sql_w_t+sql_w_c+')'
#             if Status == "超标":
#                 sql = sql + ' AND ( (to_char("NextCheckDate",\'yyyy-MM-dd\') !=\'None\' AND "NextCheckCount" !=0 AND ("NextCheckCount"-"UsedTimes" < 0 OR "NextCheckDate" < \''+current_time+'\') )'
#                 sql= sql + sql_t+ sql_c+')'
#             if Next_maintain_time !="" and Next_maintain_time_1 =="":
#                 sql ='SELECT * FROM(' + sql+') as t1 WHERE "NextCheckDate" >= \''+Next_maintain_time+'\''
#             if Next_maintain_time_1 !=""and Next_maintain_time =="":
#                 sql = 'SELECT * FROM(' + sql+') as t1 WHERE AND "NextCheckDate" <= \''+Next_maintain_time_1+'\''
#             if Next_maintain_time != "" and Next_maintain_time_1 !="":
#                 sql = 'SELECT * FROM(' + sql + ') as t1 WHERE "NextCheckDate" >= \'' + Next_maintain_time + '\' AND "NextCheckDate" <= \''+Next_maintain_time_1+'\''
#             cur = connection.cursor()
#             cur.execute(sql)
#             data = cur.fetchall()
#             for i in range(len(data)):
#                 data[i] = list(data[i])
#                 if data[i][6] == None:
#                     data[i].append("null")
#                 else:
#                     start_time = datetime.strptime(str(datetime.now()).split(' ')[0], "%Y-%m-%d")
#                     time_end = datetime.strptime(str(data[i][6]).split(' ')[0], "%Y-%m-%d")  # 获取数据表里面的日期数
#                     days = time_end - start_time
#                     data[i].append(days.days)
#                 if data[i][7] == 0:
#                     data[i].append("null")
#                 else:
#                     data[i].append(data[i][7] - data[i][4])
#             dict_data['limit_value1'] = limit_value1
#             dict_data['limit_value2'] = limit_value2
#             dict_data['data'] = data
#             return restful.ok(data=dict_data)
#         except:
#             return restful.params_error(message='need setup maintain data')

#用户使用保养得页面进行保养动作的函数
@csrf_exempt
@access_control
def maintain_query_operation(request):
    if request.method =="POST":
        try:
            dict_data={}
            page = int(request.POST.get('page'))
            number = request.POST.get('num')
            SN = str(request.POST.get('sn',''))
            PN = str(request.POST.get('pn',''))
            Status = request.POST.get('status','')
            Next_maintain_time = request.POST.get('next_time','')
            Next_maintain_time_1 = request.POST.get('next_time_1','')
            maintainers = request.POST.get('maintainers','')
            location = request.POST.get('location','')
            limit_value1 = list(Configuration.objects.filter(Type="mt_count").values("Max", "Id"))
            limit_value2 = list(Configuration.objects.filter(Type="mt_date").values("Max", "Id"))
            # sql = 'SELECT "Id","SN","PN","CheckCycleCount","UsedTimes","CheckCycle","NextCheckDate","NextCheckCount","PartName" FROM "PartItem" where 1=1 '
            sql = 'SELECT "Id","SN","PN","CheckCycleCount","UsedTimes","CheckCycle","NextCheckDate","NextCheckCount","PartName","WarningBeforeDays","WarningBeforeTimes" FROM "PartItem" where "UseStatus"=\'normal\' '
            sql_count ='SELECT COUNT(*) FROM "PartItem" where "UseStatus"=\'normal\' '
            if Status == "正常":
                sql = sql_select(sql,Status,limit_value1[0]['Max'],limit_value2[0]['Max'])
                sql_count = sql_select(sql_count,Status,limit_value1[0]['Max'],limit_value2[0]['Max'])
            if Status == "预警":
                sql = sql_select(sql,Status,limit_value1[0]['Max'],limit_value2[0]['Max'])
                sql_count = sql_select(sql_count,Status,limit_value1[0]['Max'],limit_value2[0]['Max'])
            if Status == "超标":
                sql = sql_select(sql,Status,limit_value1[0]['Max'],limit_value2[0]['Max'])
                sql_count = sql_select(sql_count,Status,limit_value1[0]['Max'],limit_value2[0]['Max'])
            if SN !="":
                sql = sql+' AND "SN" =\''+SN+'\''
                sql_count = sql_count+' AND "SN" =\''+SN+'\''
            if PN !="":
                sql = sql+' AND "PN" ilike \'%' + PN + '%\''
                sql_count = sql_count+' AND "PN" ilike \'%' + PN + '%\''
            if maintainers !="":
                sql = sql+' AND "Maintainer" ilike \'%' + maintainers + '%\''
                sql_count = sql_count+' AND "Maintainer" ilike \'%' + maintainers + '%\''
            if location !="":
                sql = sql+' AND "LocationId" = \'' + location + '\''
                sql_count = sql_count+' AND "LocationId" = \'' + location + '\''
            if Next_maintain_time !="" and Next_maintain_time_1 =="":
                sql ='SELECT * FROM(' + sql+') as t1 WHERE "NextCheckDate" >= \''+Next_maintain_time+'\''
                sql_count ='SELECT * FROM(' + sql_count+') as t1 WHERE "NextCheckDate" >= \''+Next_maintain_time+'\''
            if Next_maintain_time_1 !=""and Next_maintain_time =="":
                sql = 'SELECT * FROM(' + sql+') as t1 WHERE AND "NextCheckDate" <= \''+Next_maintain_time_1+'\''
                sql_count = 'SELECT * FROM(' + sql_count+') as t1 WHERE AND "NextCheckDate" <= \''+Next_maintain_time_1+'\''
            if Next_maintain_time != "" and Next_maintain_time_1 !="":
                sql = 'SELECT * FROM(' + sql + ') as t1 WHERE "NextCheckDate" >= \'' + Next_maintain_time + '\' AND "NextCheckDate" <= \''+Next_maintain_time_1+'\''
                sql_count = 'SELECT * FROM(' + sql_count + ') as t1 WHERE "NextCheckDate" >= \'' + Next_maintain_time + '\' AND "NextCheckDate" <= \''+Next_maintain_time_1+'\''
            cur = connection.cursor()
            cur.execute(sql_count)
            count = cur.fetchall()
            number = int(number)
            count_page = count[0][0] // number  # 总数除以一页显示多少条，得到总的页数
            if count[0][0] % number > 0:
                count_page += 1
            if page <= count_page:
                sql = sql + ' order by "Id" desc limit ' + str(number) + ' offset ' + str((page - 1) * number)
                cur = connection.cursor()
                cur.execute(sql)
                data = cur.fetchall()
                data = tidy(data)
                dict_data['data'] = data
                dict_data['page_count'] = count_page
            return restful.ok(data=dict_data)
        except:
            return restful.params_error(message='need setup maintain data')

@csrf_exempt
@access_control
def maintain_query_maintain(request):
    if request.method == "POST":
        try:
            maintain_ids = request.POST.getlist('statement_mt[]')
            maintain_date = request.POST['maintain_date']
            maintain_operator = request.POST['maintain_operator']
            maintain_status = request.POST['maintain_status']
            maintain_text = request.POST['maintain_text']
            maintain_remark = request.POST.get('maintain_remark','')
            maintain_locations = request.POST.get('maintain_locations','')
            #写入保养计入原有的数据到记录表
            operator = User.objects.filter(Name__icontains=maintain_operator).values("Id")
            if operator.count() !=1:
                return restful.params_error(message="maintainer not exist")
            for j in list(maintain_ids):
                maintain_log = PartItem.objects.get(Id=int(j))
                MaintenanceLog.objects.create(PartItemId=j,PartName=maintain_log.PartName,UpdatedTime=UpdatedTime
                                             ,Status=maintain_status,Content=maintain_text,OperatorId=operator[0]["Id"]
                                             ,CheckDueDate=maintain_log.NextCheckDate,CheckCount=maintain_log.NextCheckCount
                                             ,UsedTimes=maintain_log.UsedTimes,Remark=maintain_remark,MaintenanceDate=maintain_date)
                maintain_obj = PartItem.objects.get(Id=int(j))
                if maintain_locations != "":
                    maintain_obj.LocationId =int(maintain_locations)
                if maintain_status != "":
                    maintain_obj.UseStatus = maintain_status
                if maintain_obj.CheckCycleCount != None or maintain_obj.UsedTimes !=None:
                    maintain_obj.NextCheckCount = maintain_obj.CheckCycleCount+maintain_obj.UsedTimes
                    maintain_obj.save()
                if maintain_obj.CheckCycle != None:
                    user_time = datetime.strptime(str(maintain_date).split(' ')[0], "%Y-%m-%d")
                    # start_time = datetime.now()
                    delta = timedelta(days=maintain_obj.CheckCycle)
                    maintain_obj.NextCheckDate = user_time+delta
                    maintain_obj.save()
            return restful.ok(message="maintain ok")
        except Exception as e:
            return restful.params_error(message=repr(e))

#设备保养记录数据获取函数
@csrf_exempt
@access_control
def maintain_equipment_log(request):
    if request.method == "GET":
        try:
            page = int(request.GET.get('page'))
            number = request.GET.get('num')
            dict_data ={}
            sql_count = 'select count(*) from "MaintenanceLog" left outer join "PartItem" on "MaintenanceLog"."PartItemId" ="PartItem"."Id" left outer join "User" on "MaintenanceLog"."OperatorId" ="User"."Id" '
            sql = 'select "PartItem"."SN","PartItem"."PN","PartItem"."Spec","Status","User"."Name","Content"' \
                  ',to_char("MaintenanceDate",\'yyyy-MM-dd\'),"PartItemId","MaintenanceLog"."Id","MaintenanceLog"."UpdatedTime","Remark" FROM "MaintenanceLog" left outer join "PartItem" on "MaintenanceLog"."PartItemId" ="PartItem"."Id" left outer join "User" on "MaintenanceLog"."OperatorId" ="User"."Id" '
            cur = connection.cursor()
            cur.execute(sql_count)
            count = cur.fetchall()  # 获取赛选的条件的总数值
            if number == "All":
                cur = connection.cursor()
                cur.execute(sql)
                data = cur.fetchall()
                dict_data['data'] = data
                dict_data['page_count'] = count[0][0]
                return restful.ok(data=dict_data)
            if number != "All":
                number = int(number)
                count_page = count[0][0] // number  # 总数除以一页显示多少条，得到总的页数
                if count[0][0] % number > 0:
                    count_page =count_page+ 1
                if page <= count_page:
                    sql = sql + ' order by "MaintenanceLog"."UpdatedTime" desc limit ' + str(number) + ' offset ' + str((page - 1) * number)
                    cur = connection.cursor()
                    cur.execute(sql)
                    data = cur.fetchall()
                    dict_data['data'] = data
                    dict_data['page_count'] = count_page
                    return restful.ok(data=dict_data)
                else:
                    return restful.params_error(message="it had no other pages")
        except Exception as e:
            return restful.params_error(repr(e))
#设备保养记录的查询函数的调用
@access_control
def maintain_query_log(request):
    if request.method == "POST":
        try:
            page = int(request.POST.get('page'))
            number = request.POST.get('num')
            log_s_time = request.POST['log_s_time']
            log_e_time = request.POST['log_e_time']
            log_SN = str(request.POST['log_SN'])
            log_PN = str(request.POST['log_PN'])
            log_Spec = str(request.POST['log_Spec'])
            log_maintainer = str(request.POST['log_maintainer'])
            log_content = str(request.POST.get('log_content',''))
            sql = 'select "PartItem"."SN","PartItem"."PN","PartItem"."Spec","Status","User"."Name","Content",to_char("MaintenanceDate",\'yyyy-MM-dd\')' \
                  ',"PartItemId","OperatorId","Remark" from "PartItem" right join "MaintenanceLog"  on ("PartItem"."Id" = "MaintenanceLog"."PartItemId") left join "User" on ("MaintenanceLog"."OperatorId" = "User"."Id") where 1=1'
            sql_count = 'select count(*) from "PartItem" right join "MaintenanceLog"  on ("PartItem"."Id" = "MaintenanceLog"."PartItemId") left join "User" on ("MaintenanceLog"."OperatorId" = "User"."Id") where 1=1  '

            dict_data = {}
            if log_s_time != "":
                sql = sql + ' AND "MaintenanceLog"."MaintenanceDate" >=\'%{0}%\''.format(log_s_time)
                sql_count = sql_count + ' AND "MaintenanceLog"."MaintenanceDate" >=\'%{0}%\''.format(log_s_time)
            if log_e_time != "":
                sql = sql + ' AND "MaintenanceLog"."MaintenanceDate" <=\'%{0}%\''.format(log_e_time)
                sql_count = sql_count + ' AND "MaintenanceLog"."MaintenanceDate" <=\'%{0}%\''.format(log_e_time)
            if log_SN != "":
                sql = sql + ' AND "PartItem"."SN" =\'' + log_SN + '\''
                sql_count = sql_count + ' AND "PartItem"."SN" =\'' + log_SN + '\''
            if log_PN != "":
                sql = sql + ' AND "PartItem"."PN" ilike \'%' + log_PN + '%\''
                sql_count = sql_count + ' AND "PartItem"."PN" ilike \'%' + log_PN + '%\''
            if log_Spec != "":
                sql = sql + ' AND "PartItem"."Spec" ilike \'%' + log_Spec + '%\''
                sql_count = sql_count + ' AND "PartItem"."Spec" ilike \'%' + log_Spec + '%\''
            if log_maintainer != "":
                sql = sql + ' AND "User"."Name" ilike \'%'+log_maintainer+'%\''
                sql_count = sql_count + ' AND "User"."Name" ilike  \'%'+log_maintainer+'%\''
            if log_content != "":
                sql = sql + ' AND "MaintenanceLog"."Content" ilike \'%'+log_content+'%\''
                sql_count = sql_count + ' AND "MaintenanceLog"."Content" ilike \'%'+log_content+'%\''
            cur = connection.cursor()
            cur.execute(sql_count)
            count = cur.fetchall()  # 获取赛选的条件的总数值
            if number == "All":
                cur = connection.cursor()
                cur.execute(sql)
                data = cur.fetchall()
                dict_data['data'] = data
                dict_data['page_count'] = count[0][0]
                return restful.ok(data=dict_data)
            if number != "All":
                number = int(number)
                count_page = count[0][0] // number  # 总数除以一页显示多少条，得到总的页数
                if count[0][0] % number > 0:
                    count_page += 1
                if page <= count_page:
                    sql = sql + ' order by "Maintainer" limit ' + str(number) + ' offset ' + str((page - 1) * number)
                    cur = connection.cursor()
                    cur.execute(sql)
                    data = cur.fetchall()
                    dict_data['data'] = data
                    dict_data['page_count'] = count_page
                    return restful.ok(data=dict_data)
                else:
                    return restful.params_error(message="it had no other pages")
        except Exception as e:
            return restful.params_error(message=repr(e))

def setup_maintainer(request):
    if request.method == "GET":
        data = list(User.objects.filter(IsActivated=True).order_by("-Id").values("Id",'Name'))
        return restful.ok(data=data)


#第二版
def sql_select(sql,Status,count,date):
    # 针对SN的 WarningBeforeDays，WarningBeforeTimes有设定的分析
    user_sn_1 = ' ("WarningBeforeDays" IS NOT NULL AND "WarningBeforeTimes" IS NOT NULL) AND '
    user_sn_2 = ' ("WarningBeforeDays" IS NOT NULL AND "WarningBeforeTimes" IS NULL) AND '
    user_sn_3 = ' ("WarningBeforeDays" IS NULL AND "WarningBeforeTimes" IS NOT NULL) AND '
    user_sn_4 = ' ("WarningBeforeDays" IS NULL AND "WarningBeforeTimes" IS NULL) AND '
    # 正常的条件设置01
    n1 = '('+user_sn_4+'"NextCheckDate" IS NOT NULL AND "NextCheckCount" !=0 AND "NextCheckCount"-"UsedTimes">'+str(count)+'*"CheckCycleCount" AND extract(day from("NextCheckDate"-current_date))>'+str(date)+'*"CheckCycle")'
    n2 = '('+user_sn_4+'"NextCheckDate" IS NOT NULL AND "NextCheckCount" =0 AND extract(day from("NextCheckDate"-current_date))>'+str(date)+'*"CheckCycle")'
    n3 = '('+user_sn_4+'"NextCheckDate" IS NULL AND "NextCheckCount" !=0 AND "NextCheckCount"-"UsedTimes">'+str(count)+'*"CheckCycleCount")'
    # 正常的条件设置02
    n11 = '('+user_sn_3+'"NextCheckDate" IS NOT NULL AND "NextCheckCount" !=0 AND "NextCheckCount"-"UsedTimes">"WarningBeforeTimes" AND extract(day from("NextCheckDate"-current_date))>'+str(date)+'*"CheckCycle")'
    n21 = '('+user_sn_3+'"NextCheckDate" IS NOT NULL AND "NextCheckCount" =0 AND extract(day from("NextCheckDate"-current_date))>'+str(date)+'*"CheckCycle")'
    n31 = '('+user_sn_3+'"NextCheckDate" IS NULL AND "NextCheckCount" !=0 AND "NextCheckCount"-"UsedTimes">"WarningBeforeTimes")'
    # 正常的条件设置03
    n12 = '('+user_sn_2+'"NextCheckDate" IS NOT NULL AND "NextCheckCount" !=0 AND "NextCheckCount"-"UsedTimes">'+str(count)+'*"CheckCycleCount" AND extract(day from("NextCheckDate"-current_date))>"WarningBeforeDays")'
    n22 = '('+user_sn_2+'"NextCheckDate" IS NOT NULL AND "NextCheckCount" =0 AND extract(day from("NextCheckDate"-current_date))>"WarningBeforeDays")'
    n32 = '('+user_sn_2+'"NextCheckDate" IS NULL AND "NextCheckCount" !=0 AND "NextCheckCount"-"UsedTimes">'+str(count)+'*"CheckCycleCount")'
    # 正常的条件设置04
    n13 = '('+user_sn_1+'"NextCheckDate" IS NOT NULL AND "NextCheckCount" !=0 AND "NextCheckCount"-"UsedTimes">"WarningBeforeTimes" AND extract(day from("NextCheckDate"-current_date))>"WarningBeforeDays")'
    n23 = '('+user_sn_1+'"NextCheckDate" IS NOT NULL AND "NextCheckCount" =0 AND extract(day from("NextCheckDate"-current_date))>"WarningBeforeDays")'
    n33 = '('+user_sn_1+'"NextCheckDate" IS NULL AND "NextCheckCount" !=0 AND "NextCheckCount"-"UsedTimes">"WarningBeforeTimes")'


    # 预警的条件设置01
    w1 = '('+user_sn_4+'"NextCheckDate" IS NOT NULL AND "NextCheckCount" !=0 AND (("NextCheckCount"-"UsedTimes"<='+str(count)+'*"CheckCycleCount" AND "NextCheckCount"-"UsedTimes">= 0 AND extract(day from("NextCheckDate"-current_date))>=0)'
    w1 = w1+'OR ("NextCheckCount"-"UsedTimes">= 0 AND extract(day from("NextCheckDate"-current_date))>=0 AND extract(day from("NextCheckDate"-current_date))<='+str(date)+'*"CheckCycle")))'
    w2 = '('+user_sn_4+'"NextCheckDate" IS NOT NULL AND "NextCheckCount" =0 AND extract(day from("NextCheckDate"-current_date))<='+str(date)+'*"CheckCycle" AND extract(day from("NextCheckDate"-current_date))>=0)'
    w3 = '('+user_sn_4+'"NextCheckDate" IS NULL AND "NextCheckCount" !=0 AND "NextCheckCount"-"UsedTimes"<='+str(count)+'*"CheckCycleCount" AND "NextCheckCount"-"UsedTimes">=0)'
    # 预警的条件设置02
    w11 = '('+user_sn_3+'"NextCheckDate" IS NOT NULL AND "NextCheckCount" !=0 AND (("NextCheckCount"-"UsedTimes"<="WarningBeforeTimes" AND "NextCheckCount"-"UsedTimes">=0 AND extract(day from("NextCheckDate"-current_date))>=0)'
    w11 = w11 + 'OR ("NextCheckCount"-"UsedTimes">= 0 AND extract(day from("NextCheckDate"-current_date))>=0 AND extract(day from("NextCheckDate"-current_date))<=' + str(date) + '*"CheckCycle")))'
    w21 = '('+user_sn_3+'"NextCheckDate" IS NOT NULL AND "NextCheckCount" =0 AND extract(day from("NextCheckDate"-current_date))<=' + str(date) + '*"CheckCycle" AND extract(day from("NextCheckDate"-current_date))>=0)'
    w31 = '('+user_sn_3+'"NextCheckDate" IS NULL AND "NextCheckCount" !=0 AND "NextCheckCount"-"UsedTimes"<="WarningBeforeTimes" AND "NextCheckCount"-"UsedTimes">=0)'
    # 预警的条件设置03
    w12 = '('+user_sn_2+'"NextCheckDate" IS NOT NULL AND "NextCheckCount" !=0 AND (("NextCheckCount"-"UsedTimes"<=' + str(count) + '*"CheckCycleCount" AND "NextCheckCount"-"UsedTimes">= 0 AND extract(day from("NextCheckDate"-current_date))>=0)'
    w12 = w12 + 'OR ("NextCheckCount"-"UsedTimes">= 0 AND extract(day from("NextCheckDate"-current_date))>=0 AND extract(day from("NextCheckDate"-current_date))<="WarningBeforeDays")))'
    w22 = '('+user_sn_2+'"NextCheckDate" IS NOT NULL AND "NextCheckCount" =0 AND extract(day from("NextCheckDate"-current_date))<="WarningBeforeDays" AND extract(day from("NextCheckDate"-current_date))>=0)'
    w32 = '('+user_sn_2+'"NextCheckDate" IS NULL AND "NextCheckCount" !=0 AND "NextCheckCount"-"UsedTimes"<=' + str(count) + '*"CheckCycleCount" AND "NextCheckCount"-"UsedTimes">=0)'
    # 预警的条件设置04
    w13 = '('+user_sn_1+'"NextCheckDate" IS NOT NULL AND "NextCheckCount" !=0 AND (("NextCheckCount"-"UsedTimes"<="WarningBeforeTimes" AND "NextCheckCount"-"UsedTimes">=0 AND extract(day from("NextCheckDate"-current_date))>=0)'
    w13 = w13 + 'OR ("NextCheckCount"-"UsedTimes">=0 AND extract(day from("NextCheckDate"-current_date))>=0 AND extract(day from("NextCheckDate"-current_date))<="WarningBeforeDays")))'
    w23 = '('+user_sn_1+'"NextCheckDate" IS NOT NULL AND "NextCheckCount" =0 AND extract(day from("NextCheckDate"-current_date))<="WarningBeforeDays" AND extract(day from("NextCheckDate"-current_date))>=0)'
    w33 = '('+user_sn_1+'"NextCheckDate" IS NULL AND "NextCheckCount" !=0 AND "NextCheckCount"-"UsedTimes"<="WarningBeforeTimes" AND "NextCheckCount"-"UsedTimes">=0)'

    # 超标的条件设置
    c1 ='("NextCheckDate" IS NOT NULL AND "NextCheckCount" !=0 AND ("NextCheckCount"-"UsedTimes"<0 OR extract(day from("NextCheckDate"-current_date))<0))' #下次日期和下次保养次数不为空
    c2 ='("NextCheckDate" IS NOT NULL AND "NextCheckCount" =0 AND extract(day from("NextCheckDate"-current_date))<0)'                                      #下次日期不为空
    c3 ='("NextCheckDate" IS NULL AND "NextCheckCount" !=0 AND "NextCheckCount"-"UsedTimes"<0)'                                                            #下次保养次数不为空

    noon = '("NextCheckDate" IS NULL AND "NextCheckCount"=0)'
    if Status == "正常":
        sql = sql + ' AND('+n1+'OR'+n2+'OR'+n3+'OR'+n11+'OR'+n21+'OR'+n31+'OR'+n12+'OR'+n22+'OR'+n32+'OR'+n13+'OR'+n23+'OR'+n33+')'
    if Status == "预警":
        sql = sql + ' AND('+w1+'OR'+w2+'OR'+w3+'OR'+w11+'OR'+w21+'OR'+w31+'OR'+w12+'OR'+w22+'OR'+w32+'OR'+w13+'OR'+w23+'OR'+w33+')'
    if Status == "超标":
        sql = sql + ' AND('+c1+'OR'+c2+'OR'+c3+')'
    if Status == "未设定":
        sql = sql +' AND('+noon+')'
    return sql
#整理查询出来的数据 数据清洗
def tidy(data):
    limit_value1 = list(Configuration.objects.filter(Type="mt_count").values("Max", "Id"))
    limit_value2 = list(Configuration.objects.filter(Type="mt_date").values("Max", "Id"))
    for i in range(len(data)):
        data[i] = list(data[i])
        if data[i][6] == None:
            data[i].append("null")
        else:
            start_time = datetime.strptime(str(datetime.now()).split(' ')[0], "%Y-%m-%d")
            time_end = datetime.strptime(str(data[i][6]).split(' ')[0], "%Y-%m-%d")  # 获取数据表里面的日期数
            days = time_end - start_time
            data[i].append(days.days)
        if data[i][7] == 0:
            data[i].append("null")
        else:
            data[i].append(data[i][7] - data[i][4])

        if data[i][9] == None and data[i][10] == None:
            if data[i][11] != "null" and data[i][12] != "null":
                if data[i][11]> limit_value2[0]['Max']*data[i][5] and data[i][12]>limit_value1[0]['Max']*data[i][3]:
                    data[i].append('normal')
                if 0<=data[i][11]<= limit_value2[0]['Max']*data[i][5] and 0<=data[i][12]:
                    data[i].append('warning')
                if 0<=data[i][12]<= limit_value1[0]['Max']*data[i][3] and 0<=data[i][11]:
                    data[i].append('warning')
                if data[i][11]<0 or data[i][12]<0:
                    data[i].append('danger')
            if data[i][11] != "null" and data[i][12] == "null":
                if data[i][11] > limit_value2[0]['Max']*data[i][5]:
                    data[i].append('normal')
                if 0 <= data[i][11] <= limit_value2[0]['Max']*data[i][5]:
                    data[i].append('warning')
                if data[i][11]<0:
                    data[i].append('danger')
            if data[i][11] == "null" and data[i][12] != "null":
                if data[i][12]>limit_value1[0]['Max']*data[i][3]:
                    data[i].append('normal')
                if 0<=data[i][12]<= limit_value1[0]['Max']*data[i][3]:
                    data[i].append('warning')
                if data[i][12]<0:
                    data[i].append('danger')
            if data[i][11] == "null" and data[i][12] == "null":
                data[i].append('none')
        if data[i][9] == None and data[i][10] != None:
            if data[i][11] != "null" and data[i][12] != "null":
                if data[i][11]> limit_value2[0]['Max']*data[i][5] and data[i][12]>data[i][10]:
                    data[i].append('normal')
                if 0<=data[i][11]<= limit_value2[0]['Max']*data[i][5] and 0<=data[i][12]:
                    data[i].append('warning')
                if 0<=data[i][12]<= data[i][10] and 0<=data[i][11]:
                    data[i].append('warning')
                if data[i][11]<0 or data[i][12]<0:
                    data[i].append('danger')
            if data[i][11] != "null" and data[i][12] == "null":
                if data[i][11] > limit_value2[0]['Max']*data[i][5]:
                    data[i].append('normal')
                if 0 <= data[i][11] <= limit_value2[0]['Max']*data[i][5]:
                    data[i].append('warning')
                if data[i][11]<0:
                    data[i].append('danger')
            if data[i][11] == "null" and data[i][12] != "null":
                if data[i][12]>data[i][9]:
                    data[i].append('normal')
                if 0<=data[i][12]<= data[i][9]:
                    data[i].append('warning')
                if data[i][12]<0:
                    data[i].append('danger')
            if data[i][11] == "null" and data[i][12] == "null":
                data[i].append('none')
        if data[i][9] != None and data[i][10] == None:
            if data[i][11] != "null" and data[i][12] != "null":
                if data[i][11]> data[i][9] and data[i][12]>limit_value1[0]['Max']*data[i][3]:
                    data[i].append('normal')
                if 0<=data[i][11]<= data[i][9] and 0<=data[i][12]:
                    data[i].append('warning')
                if 0<=data[i][12]<= limit_value1[0]['Max']*data[i][3] and 0<=data[i][11]:
                    data[i].append('warning')
                if data[i][11]<0 or data[i][12]<0:
                    data[i].append('danger')
            if data[i][11] != "null" and data[i][12] == "null":
                if data[i][11] > data[i][9]:
                    data[i].append('normal')
                if 0 <= data[i][11] <= data[i][9]:
                    data[i].append('warning')
                if data[i][11]<0:
                    data[i].append('danger')
            if data[i][11] == "null" and data[i][12] != "null":
                if data[i][12]>limit_value1[0]['Max']*data[i][3]:
                    data[i].append('normal')
                if 0<=data[i][12]<= limit_value1[0]['Max']*data[i][3]:
                    data[i].append('warning')
                if data[i][12]<0:
                    data[i].append('danger')
            if data[i][11] == "null" and data[i][12] == "null":
                data[i].append('none')
        if data[i][9] != None and data[i][10] != None:
            if data[i][11] != "null" and data[i][12] != "null":
                if data[i][11]> data[i][9] and data[i][12]>data[i][10]:
                    data[i].append('normal')
                if 0<=data[i][11]<= data[i][9] and 0<=data[i][12]:
                    data[i].append('warning')
                if 0<=data[i][12]<= data[i][10] and 0<=data[i][11]:
                    data[i].append('warning')
                if data[i][11]<0 or data[i][12]<0:
                    data[i].append('danger')
            if data[i][11] != "null" and data[i][12] == "null":
                if data[i][11] > data[i][9]:
                    data[i].append('normal')
                if 0 <= data[i][11] <= data[i][9]:
                    data[i].append('warning')
                if data[i][11]<0:
                    data[i].append('danger')
            if data[i][11] == "null" and data[i][12] != "null":
                if data[i][12]>data[i][10]:
                    data[i].append('normal')
                if 0<=data[i][12]<= data[i][10]:
                    data[i].append('warning')
                if data[i][12]<0:
                    data[i].append('danger')
            if data[i][11] == "null" and data[i][12] == "null":
                data[i].append('none')
    return data
#查询函数的sql语句调用
# def sql_select(sql,Status,count,date):
#     # 正常的条件设置
#     n1 = '("NextCheckDate" IS NOT NULL AND "NextCheckCount" !=0 AND "NextCheckCount"-"UsedTimes">'+str(count)+'*"CheckCycleCount" AND extract(day from("NextCheckDate"-current_date))>'+str(date)+'*"CheckCycle")'
#     n2 = '("NextCheckDate" IS NOT NULL AND "NextCheckCount" =0 AND extract(day from("NextCheckDate"-current_date))>'+str(date)+'*"CheckCycle")'
#     n3 = '("NextCheckDate" IS NULL AND "NextCheckCount" !=0 AND "NextCheckCount"-"UsedTimes">'+str(count)+'*"CheckCycleCount")'
#     # 预警的条件设置
#     w1 = '("NextCheckDate" IS NOT NULL AND "NextCheckCount" !=0 AND (("NextCheckCount"-"UsedTimes"<='+str(count)+'*"CheckCycleCount" AND "NextCheckCount"-"UsedTimes">= 0 AND extract(day from("NextCheckDate"-current_date))>=0)'
#     w1 = w1+'OR ("NextCheckCount"-"UsedTimes">= 0 AND extract(day from("NextCheckDate"-current_date))>=0 AND extract(day from("NextCheckDate"-current_date))<='+str(date)+'*"CheckCycle")))'
#     w2 = '("NextCheckDate" IS NOT NULL AND "NextCheckCount" =0 AND extract(day from("NextCheckDate"-current_date))<='+str(date)+'*"CheckCycle" AND extract(day from("NextCheckDate"-current_date))>=0)'
#     w3 = '("NextCheckDate" IS NULL AND "NextCheckCount" !=0 AND "NextCheckCount"-"UsedTimes"<='+str(count)+'*"CheckCycleCount" AND "NextCheckCount"-"UsedTimes">=0)'
#     # 超标的条件设置
#     c1 ='("NextCheckDate" IS NOT NULL AND "NextCheckCount" !=0 AND ("NextCheckCount"-"UsedTimes"<0 OR extract(day from("NextCheckDate"-current_date))<0))'
#     c2 ='("NextCheckDate" IS NOT NULL AND "NextCheckCount" =0 AND extract(day from("NextCheckDate"-current_date))<0)'
#     c3 ='("NextCheckDate" IS NULL AND "NextCheckCount" !=0 AND "NextCheckCount"-"UsedTimes"<0)'
#     # 未设定的条件设置
#     noon = '("NextCheckDate" IS NULL AND "NextCheckCount"=0)'
#     if Status == "正常":
#         sql = sql + ' AND('+n1+'OR'+n2+'OR'+n3+')'
#     if Status == "预警":
#         sql = sql + ' AND('+w1+'OR'+w2+'OR'+w3+')'
#     if Status == "超标":
#         sql = sql + ' AND('+c1+'OR'+c2+'OR'+c3+')'
#     if Status == "未设定":
#         sql = sql +' AND('+noon+')'
#     return sql
