from django.shortcuts import render
from django.shortcuts import render, redirect
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from app.login.models import User,Department,Customer,BudgetCodeForm,PartItem,PartItemResult,MaintenanceLog,Configuration
# from app.login.views import Update_User_IsActivated
from django.views.generic.base import View
from django.db import connection
from django.http import HttpResponseRedirect,HttpResponse
from app import restful,mail
from app.access_control import access_control
from datetime import datetime,timedelta,date
# import datetime
from django.conf import settings
import random
import string
import os
import time
from openpyxl import load_workbook,Workbook
import json
import xlrd
from bs4 import BeautifulSoup
import filetype

#统计分析的数据的 拉出一周的数据， 这里先拉出来前面10条的数据
class analysis_equipment_info(View):
    def get(self,request):
        try:
            start = datetime.now()
            # delta = timedelta(days=20)
            # end = start - delta
            #数据选择区间
            start_select = (list(PartItemResult.objects.order_by("-TrnDate").filter(TrnDate__lte=start).values("TrnDate")))[0]['TrnDate']
            delta_select = timedelta(days=7)
            end_select = start_select - delta_select
            time_select_sql = ' to_char("TrnDate",\'yyyy-MM-dd\') >= \''+ end_select.strftime("%Y-%m-%d")+'\' and to_char("TrnDate",\'yyyy-MM-dd\') <= \''+start_select.strftime("%Y-%m-%d")+'\''
            visua_data = {}              #柱状图需要的数据
            li=[]
            sql1 = 'SELECT "ErrorCode", COUNT("SN") FROM "PartItemResult" where '+time_select_sql+' AND "Result"= \'FAIL\' GROUP BY "ErrorCode" ORDER BY -COUNT(*)'
            cur = connection.cursor()
            cur.execute(sql1)
            visua_data['errorcode'] = cur.fetchall()
            sql2 = 'SELECT "PartName", COUNT("SN") FROM "PartItemResult" where'+time_select_sql+' GROUP BY "PartName" ORDER BY -COUNT("SN")'
            cur = connection.cursor()
            cur.execute(sql2)
            visua_data['Partname'] = cur.fetchall()
            range_area = Configuration.objects.filter(Type="at_count").order_by("Min")          #查用户设定的次数
            if len(range_area) !=0:
                range_sql = 'SELECT COUNT("SN") FROM "PartItemResult" where '+time_select_sql+' AND "Result"= \'FAIL\''
                for i in range(len(range_area)):
                    range_data=range_sql+' AND "UsedTimes">=\''+str(int(range_area[i].Min))+'\' AND "UsedTimes"<=\''+str(int(range_area[i].Max))+'\''
                    cur = connection.cursor()
                    cur.execute(range_data)
                    rank=cur.fetchall()
                    new =[str(int(range_area[i].Min))+'~'+str(int(range_area[i].Max)),rank[0][0]]
                    li.append(new)
                visua_data['user'] =li
            else:
                sql3 = 'SELECT COUNT("SN") FROM "PartItemResult" where '+time_select_sql+' AND "Result"= \'FAIL\' and "UsedTimes">0'
                cur = connection.cursor()
                cur.execute(sql3)
                rankelse = cur.fetchall()
                visua_data['user'] = ['0~0',rankelse[0][0]]

            sql4 = 'SELECT COUNT("SN"),"PartName" FROM (select distinct "SN","PartName","Result" from "PartItemResult" WHERE '+time_select_sql+') as foo where "Result"= \'FAIL\' GROUP BY "PartName" ORDER BY -COUNT("SN")'
            cur = connection.cursor()
            cur.execute(sql4)
            visua_data['filterSN'] = cur.fetchall()
            visua_data['select_start'] = start_select
            visua_data['select_end'] = end_select
            return restful.ok(data=visua_data)
        except Exception as e:
            return restful.params_error(repr(e))


#数据显示部分
@access_control
def analysis_data(request):
    if request.method == "GET":
        try:
            page = int(request.GET.get('page'))
            number = request.GET.get('num')
            dict_data={}
            count = PartItemResult.objects.order_by("Id").count()
            if number == "All":
                data = PartItemResult.objects.order_by("Id").all().values()
                data =list(data)
                dict_data['data']=data
                dict_data['page_count'] = count
                return restful.ok(data=dict_data)
            if number != "All":
                number = int(number)
                page_num = count // number  # 总共多少页
                if count % number > 0:
                    page_num = page_num + 1
                if page_num >= page:
                    data =PartItemResult.objects.order_by("Id").all().values()[(page-1)*number:number*page]
                    data =list(data)
                    dict_data['data'] = data
                    dict_data['page_count'] = page_num
                    return restful.ok(data=dict_data)
                else:
                    return restful.params_error(message="it had no other pages")
        except:
            return restful.params_error(message="data got fail")

#设置区间的获取的数据
@access_control
def analysis_setup_data(request):
    if request.method == "GET":
        try:
            limit_data = Configuration.objects.filter(Type="at_count").order_by("Id").values("Id","Min","Max")
            limit_data = list(limit_data)
            return restful.ok(data=limit_data)
        except:
            return restful.params_error(message="data error")
#设置区间删除的函数
@access_control
def analysis_delete_data(request):
    if request.method == "POST":
        try:
            range_id = request.POST['div_id']
            range_id = range_id.split('_')[0]
            Configuration.objects.filter(Id=int(range_id)).delete()
            return restful.ok(message="")
        except:
            return restful.params_error(message='data error')

# def typeof(variate):
#     type = None
#     if isinstance(variate, int):
#         type = "int"
#     elif isinstance(variate, str):
#         type = "str"
#     elif isinstance(variate, float):
#         type = "float"
#     elif isinstance(variate, list):
#         type = "list"
#     elif isinstance(variate, tuple):
#         type = "tuple"
#     elif isinstance(variate, dict):
#         type = "dict"
#     elif isinstance(variate, set):
#         type = "set"
#     return type
#设置区间提交的数据摄入表里面
@csrf_exempt
def analysis_setup_value(request):
    if request.method == "POST":
        try:
            form_data = request.POST.get('data')
            form_data = eval(form_data)
            dict_analysis = {}
            for i, j in form_data.items():
                dict_analysis[i.split('[')[0][8] + i.split('[')[1].split(']')[0]] = int(j)
            dict_an = {}
            distinct_li = []
            for i in dict_analysis.keys():
                distinct_li.append(i[1:])
            distinct_li = list(set(distinct_li))
            for k in distinct_li:
                val = []
                for i, j in dict_analysis.items():
                    if i[1:] == k:
                        val.append(j)
                    val.sort()
                dict_an[k] = val
            for key, v in dict_an.items():
                try:
                    analysis_obj = Configuration.objects.get(Id=eval(key))
                    analysis_obj.Min=v[0]
                    analysis_obj.Max=v[1]
                    analysis_obj.save()
                except:
                    Configuration.objects.create(Type="at_count",Min=v[0],Max=v[1])
            return restful.ok(data=form_data,message="setup success")  #("/index/")
        except:
            return restful.params_error(data=request.POST.get('data'))


#数据的获取的数据
@access_control
def analysis_query_data(request):
    if request.method == "GET":
        try:
            data = {}
            stage =list(PartItemResult.objects.all().values("Stage").distinct("Stage"))
            fixtureId = list(PartItemResult.objects.all().values("FixtureId").distinct("FixtureId"))
            USN = list(PartItemResult.objects.all().values("USN").distinct("USN"))
            data['stage']=stage
            data['fixtureId']=fixtureId
            data['USN']=USN
            return restful.ok(data=data)
        except Exception as e:
            return restful.params_error(message=repr(e))

#根据提交的数据进行查询函数的定义
@csrf_exempt
def analysis_query_info(request):
    if request.method =="POST":
        try:
            startTime = request.POST.get('begin','')
            endTime = request.POST.get('end','')
            stage = request.POST.get('stage','')
            fixture = request.POST.get('fixture','')
            usn = request.POST.get('usn','')
            Spec = request.POST.get('Spec','')
            PN = request.POST.get('PN','')
            PartName = request.POST.get('PartName','')
            visua_data = {}
            sql = 'SELECT "ErrorCode", COUNT("SN") FROM "PartItemResult" where "Result"= \'FAIL\' '
            sql2 = 'SELECT "PartName", COUNT("SN") FROM "PartItemResult" where "Result"= \'FAIL\' '
            sql3 = 'SELECT COUNT("SN") FROM "PartItemResult" where "Result"= \'FAIL\''
            sql4 = 'SELECT COUNT("SN"),"PartName" FROM (select distinct "SN","PartName","Result"' \
                   ',"Stage","FixtureId","USN","TrnDate","PN","Spec" from "PartItemResult") as foo where "Result"= \'FAIL\''
            # 数据选择区间
            start = datetime.now()
            start_select = (list(PartItemResult.objects.order_by("-TrnDate").filter(TrnDate__lte=start).values("TrnDate")))[0]['TrnDate']
            delta_select = timedelta(days=7)
            end_select = start_select - delta_select
            time_select_sql = ' AND to_char("TrnDate",\'yyyy-MM-dd\') >= \'' + end_select.strftime("%Y-%m-%d") + '\' and to_char("TrnDate",\'yyyy-MM-dd\') <= \'' + start_select.strftime("%Y-%m-%d") + '\''
            if startTime == "" and endTime == "" and stage == "" and fixture =="" and usn == "" and Spec == "" and PN == "" and PartName == "":
                # visua_data['select_start']=start_select
                # visua_data['select_end']=end_select
                sql = sql +time_select_sql
                sql2 = sql2 +time_select_sql
                sql3 = sql3 +time_select_sql
                sql4 = sql4 +time_select_sql
            if startTime !="":
                sql = sql+ ' AND "TrnDate" >=\'' + startTime + '\''
                sql2 = sql2+ ' AND "TrnDate" >=\'' + startTime + '\''
                sql3 = sql3+ ' AND "TrnDate" >=\'' + startTime + '\''
                sql4 = sql4+ ' AND "TrnDate" >=\'' + startTime + '\''
            if endTime !="":
                sql = sql+ ' AND "TrnDate" <=\'' + endTime + '\''
                sql2 = sql2+ ' AND "TrnDate" <=\'' + endTime + '\''
                sql3 = sql3+ ' AND "TrnDate" <=\'' + endTime + '\''
                sql4 = sql4+ ' AND "TrnDate" <=\'' + endTime + '\''
            if stage !="" and stage != "null":
                sql = sql+' AND "Stage" ilike \'%' + stage + '%\''
                sql2 = sql2+' AND "Stage"ilike \'%' + stage + '%\''
                sql3 = sql3+' AND "Stage"ilike \'%' + stage + '%\''
                sql4 = sql4+' AND "Stage"ilike \'%' + stage + '%\''
            if stage == "null":
                stage ="Null"
                sql = sql + ' AND "Stage" IS ' + stage
                sql2 = sql2 + ' AND "Stage" IS ' + stage
                sql3 = sql3 + ' AND "Stage" IS ' + stage
                sql4 = sql4 + ' AND "Stage" IS ' + stage
            if fixture != "" and fixture != "null":
                sql = sql + ' AND "FixtureId" ilike \'%' + fixture + '%\''
                sql2 = sql2 + ' AND "FixtureId" ilike \'%' + fixture + '%\''
                sql3 = sql3 + ' AND "FixtureId" ilike \'%' + fixture + '%\''
                sql4 = sql4 + ' AND "FixtureId" ilike \'%' + fixture + '%\''
            if fixture == "null":
                fixture = "Null"
                sql = sql + ' AND "FixtureId" IS ' + fixture
                sql2 = sql2 + ' AND "FixtureId" IS ' + fixture
                sql3 = sql3 + ' AND "FixtureId" IS ' + fixture
                sql4 = sql4 + ' AND "FixtureId" IS ' + fixture
            if usn != "":
                sql = sql + ' AND "USN" ilike \'%' + usn + '%\''
                sql2 = sql2 + ' AND "USN" ilike \'%' + usn + '%\''
                sql3 = sql3 + ' AND "USN" ilike \'%' + usn + '%\''
                sql4 = sql4 + ' AND "USN" ilike \'%' + usn + '%\''

            if Spec !="":
                sql = sql+ ' AND "Spec" ilike \'%' + Spec + '%\''
                sql2 = sql2+ ' AND "Spec" ilike \'%' + Spec + '%\''
                sql3 = sql3+ ' AND "Spec" ilike \'%' + Spec + '%\''
                sql4 = sql4+ ' AND "Spec" ilike \'%' + Spec + '%\''
            if PN !="":
                sql = sql+ ' AND "PN" ilike \'%' + PN + '%\''
                sql2 = sql2+ ' AND "PN" ilike \'%' + PN + '%\''
                sql3 = sql3+ ' AND "PN" ilike \'%' + PN + '%\''
                sql4 = sql4+ ' AND "PN" ilike \'%' + PN + '%\''
            if PartName !="":
                sql = sql+ ' AND "PartName" ilike \'%' + PartName + '%\''
                sql2 = sql2+ ' AND "PartName" ilike \'%' + PartName + '%\''
                sql3 = sql3+ ' AND "PartName" ilike \'%' + PartName + '%\''
                sql4 = sql4+ ' AND "PartName" ilike \'%' + PartName + '%\''
            # 查用户设定的次数
            range_area = Configuration.objects.filter(Type="at_count").order_by("Min")
            li = []
            if len(range_area) != 0:
                for i in range(len(range_area)):
                    range_data = sql3 + ' AND "UsedTimes">=\'' + str(int(range_area[i].Min)) + '\' AND "UsedTimes"<=\'' + str(int(range_area[i].Max)) + '\''
                    cur = connection.cursor()
                    cur.execute(range_data)
                    rank = cur.fetchall()
                    new = [str(int(range_area[i].Min)) + '~' + str(int(range_area[i].Max)), rank[0][0]]
                    li.append(new)
                visua_data['user'] = li
            else:
                range_data =sql3 + ' UsedTimes">0'
                cur = connection.cursor()
                cur.execute(range_data)
                rankelse = cur.fetchall()
                visua_data['user'] = ['0~0', rankelse[0][0]]
            errorcode = sql+ ' GROUP BY "ErrorCode"'                    #按errorcode的分类
            partname = sql2+ ' GROUP BY "PartName"'                     #按partname的分类
            SN = sql4+ ' GROUP BY "PartName"'                           #NG数量的按照partname分类
            cur = connection.cursor()                                   #fail区间的数量的查询-----
            cur.execute(errorcode)
            visua_data['errorcode']= cur.fetchall()
            cur.execute(partname)
            visua_data['Partname'] = cur.fetchall()
            cur.execute(SN)
            visua_data['filterSN'] = cur.fetchall()
            return restful.ok(data=visua_data)
        except Exception as e:
            return restful.params_error(repr(e))

#查询之前获取后端的数据
@access_control
def analysis_tab_data(request):
    if request.method == "GET":
        try:
            data={}
            Stage = list(PartItemResult.objects.all().values("Stage").distinct("Stage"))
            FixtureId = list(PartItemResult.objects.all().values("FixtureId").distinct("FixtureId"))
            USN = list(PartItemResult.objects.all().values("USN").distinct("USN"))
            Result = list(PartItemResult.objects.all().values("Result").distinct("Result"))
            data['Stage'] = Stage
            data['FixtureId'] = FixtureId
            data['USN'] = USN
            data['Result'] = Result
            return restful.ok(data=data)
        except:
            return restful.params_error(message="data error")

#点击视图需要的条件的查询数据
@access_control
def analysis_visul_data(request):
    if request.method == "POST":
        try:
            errorcode = request.POST.get('errorcode')
            startTime = request.POST.get('begin')
            endTime = request.POST.get('end')
            stage = request.POST.get('stage')
            fixture = request.POST.get('fixture')
            usn = request.POST.get('usn','')
            Spec = request.POST.get('Spec','')
            PN = request.POST.get('PN','')
            PartName = request.POST.get('PartName','')
            #PartName = "CPU"
            visua_data = {}
            sql2 = 'SELECT "PartName", COUNT("SN") FROM "PartItemResult" where "Result"= \'FAIL\' '
            start = datetime.now()
            start_select = (list(PartItemResult.objects.order_by("-TrnDate").filter(TrnDate__lte=start).values("TrnDate")))[0]['TrnDate']
            delta_select = timedelta(days=7)
            end_select = start_select - delta_select
            time_select_sql = ' AND to_char("TrnDate",\'yyyy-MM-dd\') >= \'' + end_select.strftime("%Y-%m-%d") + '\' and to_char("TrnDate",\'yyyy-MM-dd\') <= \'' + start_select.strftime("%Y-%m-%d") + '\''
            if startTime == "" and endTime == "" and stage == "" and fixture == "" and usn == ""and Spec == ""and PN == ""and PartName == "":
                sql2= sql2+time_select_sql
            if errorcode != "":
                sql2 = sql2 + ' AND "ErrorCode" ilike \'%' + errorcode + '%\''
            if Spec != "":
                sql2 = sql2 + ' AND "Spec" ilike \'%' + Spec + '%\''
            if PN != "":
                sql2 = sql2 + ' AND "PN" ilike \'%' + PN + '%\''
            if PartName != "":
                sql2 = sql2 + ' AND "PartName" ilike \'%' + PartName + '%\''
            if stage != "":
                sql2 = sql2 + ' AND "Stage" = \'' + stage + '\''
            if fixture != "":
                sql2 = sql2 + ' AND "FixtureId" = \'' + fixture + '\''
            if usn != "":
                sql2 = sql2 + ' AND "USN" ilike \'%' + usn + '%\''
            if startTime != "":
                sql2 = sql2 + ' AND "TrnDate" >=\'' + startTime + '\''
            if endTime != "":
                sql2 = sql2 + ' AND "TrnDate" <=\'' + endTime + '\''
            partname = sql2 + ' GROUP BY "PartName"'                                        # 按partname的分类
            cur = connection.cursor()
            cur.execute(partname)
            visua_data['Partname'] = cur.fetchall()
            return restful.ok(data=visua_data)
        except Exception as e:
            return restful.params_error(message=repr(e))
#点击饼状态的图片的条件的查询数据
@access_control
def analysis_vi_part(request):
    if request.method == "POST":
        try:
            errorcode = request.POST.get('errorcode','')
            startTime = request.POST.get('begin','')
            endTime = request.POST.get('end','')
            stage = request.POST.get('stage','')
            fixture = request.POST.get('fixture','')
            usn = request.POST.get('usn','')
            Spec = request.POST.get('Spec', '')
            PN = request.POST.get('PN', '')
            PartName = request.POST.get('PartName', '')
            visua_data = {}
            sql = 'SELECT "ErrorCode", COUNT("SN") FROM "PartItemResult" where "Result"= \'FAIL\' '
            start = datetime.now()
            start_select = (list(PartItemResult.objects.order_by("-TrnDate").filter(TrnDate__lte=start).values("TrnDate")))[0]['TrnDate']
            delta_select = timedelta(days=7)
            end_select = start_select - delta_select
            time_select_sql = ' AND to_char("TrnDate",\'yyyy-MM-dd\') >= \'' + end_select.strftime("%Y-%m-%d") + '\' and to_char("TrnDate",\'yyyy-MM-dd\') <= \'' + start_select.strftime("%Y-%m-%d") + '\''
            if errorcode == "" and startTime == "" and endTime == "" and stage == "" and fixture == "" and usn == "" and Spec == ""and PN == ""and PartName == "":
                sql = sql + time_select_sql
            if errorcode != "":
                sql = sql + ' AND "ErrorCode"= \'%' + errorcode + '%\''
            if Spec != "":
                sql = sql + ' AND "Spec" ilike \'%' + Spec + '%\''
            if PN != "":
                sql = sql + ' AND "PN" ilike \'%' + PN + '%\''
            if PartName != "":
                sql = sql + ' AND "PartName" ilike \'%' + PartName + '%\''
            if stage != "":
                sql = sql + ' AND "Stage"= \'' + stage + '\''
            if fixture != "":
                sql = sql + ' AND "FixtureId"=\'' + fixture + '\''
            if usn != "":
                sql = sql + ' AND "USN"=\'%' + usn + '%\''
            if startTime != "":
                sql = sql + ' AND "TrnDate" >=\'' + startTime + '\''
            if endTime != "":
                sql = sql + ' AND "TrnDate" <=\'' + endTime + '\''
            errorcode = sql + ' GROUP BY "ErrorCode"'                                          # 按errorcode的分类
            cur = connection.cursor()
            cur.execute(errorcode)
            visua_data['errorcode'] = cur.fetchall()
            return restful.ok(data=visua_data)
        except Exception as e:
            return restful.params_error(message=repr(e))


#数据表的数据查询数据
@access_control
def analysis_query_tab_info(request):
    if request.method == "POST":
        try:
            page = int(request.POST.get('page'))
            number = request.POST.get('num')
            startTime = request.POST.get('begin','')
            endTime = request.POST.get('end','')
            stage = request.POST.get('stage','')
            fixture = request.POST.get('fixture','')
            usn = request.POST.get('usn','')
            result = request.POST.get('result','')
            Spec = request.POST.get('Spec','')
            PN = request.POST.get('PN','')
            PartName = request.POST.get('PartName','')
            dict_data = {}
            sql2='select count(*) from "PartItemResult" where 1=1'
            sql = 'SELECT * FROM "PartItemResult" where 1=1 '
            if startTime != "":
                sql = sql + 'AND "TrnDate" >=\'' + startTime + '\''
                sql2 = sql2 + 'AND "TrnDate" >=\'' + startTime + '\''
            if endTime != "":
                sql = sql + 'AND "TrnDate" <=\'' + endTime + '\''
                sql2 = sql2 + 'AND "TrnDate" <=\'' + endTime + '\''
            if stage != "" and stage != "null":
                sql = sql + 'AND "Stage" ilike \'%' + stage + '%\''
                sql2 = sql2 + 'AND "Stage" ilike \'%' + stage + '%\''
            if stage == "null":
                sql = sql + 'AND "Stage" IS NULL'
                sql2 = sql2 + 'AND "Stage" IS NULL'
            if fixture != "" and fixture != "null":
                sql = sql + 'AND "FixtureId" ilike \'%' + fixture + '%\''
                sql2 = sql2 + 'AND "FixtureId" ilike \'%' + fixture + '%\''
            if fixture == "null":
                sql = sql + 'AND "FixtureId" IS NULL'
                sql2 = sql2 + 'AND "FixtureId" IS NULL'
            if usn != "":
                sql = sql + 'AND "USN" ilike \'%' + usn + '%\''
                sql2 = sql2 + 'AND "USN" ilike \'%' + usn + '%\''
            if result != "":
                sql = sql + 'AND "Result"=\'' + result + '\''
                sql2 = sql2 + 'AND "Result"=\'' + result + '\''
            if Spec != "":
                sql = sql + 'AND "Spec" ilike \'%' + Spec + '%\''
                sql2 = sql2 + 'AND "Spec" ilike \'%' + Spec + '%\''
            if PN != "":
                sql = sql + 'AND "PN" ilike \'%' + PN + '%\''
                sql2 = sql2 + 'AND "PN" ilike \'%' + PN + '%\''
            if PartName != "":
                sql = sql + 'AND "PartName" ilike \'%' + PartName + '%\''
                sql2 = sql2 + 'AND "PartName" ilike \'%' + PartName + '%\''

            cur = connection.cursor()
            cur.execute(sql2)
            count = cur.fetchall()
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
                    sql = sql +' order by "Id" limit '+str(number)+' offset ' + str((page-1)*number)
                    cur = connection.cursor()
                    cur.execute(sql)
                    data = cur.fetchall()
                    dict_data['data']=data
                    dict_data['page_count']=count_page
                    return restful.ok(data=dict_data)
                else:
                    return restful.params_error(message="it had no other pages")
        except Exception as e:
            return restful.params_error(message=repr(e))

@csrf_exempt
def analysis_upload_file_excle(request):
    if request.method == "POST":
        try:
            file = request.FILES.get('file', '')
            file_type = file.name.split('.')[1]
            insert_list = []
            if file_type in ['xlsx', 'xls']:
                time_num = int(time.time())
                time_num = str(time_num)
                file_name = file.name
                file_sp_name = file_name.split('.')[0]
                file_ven_name = file_sp_name + time_num + '.' + file_name.split('.')[1]
                file_path = os.path.join(settings.BASE_DIR, 'app/DBexcel/solved/'+file_ven_name)
                # 开始解析上传excle的文件到服务器
                with open(file_path,'wb') as f:
                    for chunk in file.chunks():
                        f.write(chunk)
                    f.close()
                if filetype.guess(file_path):
                    datas = read_by_row(file_path)
                else:
                    datas = deal_not_excel(file_path)
                # datas = read_by_row(file_path)
                for data in datas[1:]:
                    flag = True
                    data[12] = datetime.strptime(data[12], '%m/%d/%Y %H:%M:%S %p')
                    # return restful.params_error(data={'time':data[12]})
                    SN_foo = PartItemResult.objects.filter(SN=data[1])
                    if SN_foo:
                        if data[12] in [SN.TrnDate for SN in SN_foo]:
                            flag =False
                    if flag:
                        if 'fail' in data[10].lower():
                            data[10] = 'FAIL'
                        else:
                            data[10] = 'PASS'
                        case = PartItemResult(
                            USN=data[0], SN=data[1], OSN=data[2], Asset=data[3],
                            PN=data[4], PartName=data[5], Spec=data[6],
                            UsedTimes=data[7], Stage=data[8], FixtureId=data[9],
                            Result=data[10], ErrorCode=data[11], TrnDate=data[12],
                        )
                        insert_list.append(case)
                PartItemResult.objects.bulk_create(insert_list)
                update_for_partItem()
                return restful.ok(message="upload and updated OK")
            else:
                return restful.params_error(message='文件格式不对')
        except Exception as e:
            return restful.params_error(repr(e))

def deal_not_excel(filepath):
    with open(filepath,'r') as f:
        content = f.read()
    content.strip().replace('\ufeff', '')
    soup = BeautifulSoup(content, 'lxml')
    table = soup.findAll("table")[0]
    rows = table.findAll("tr")
    result = []
    for row in rows:
        cols = row.findAll(['td', 'th'])
        foo = []
        for col in cols:
            foo.append(col.getText())
        result.append(foo)
    return result
def read_by_row(file_path):
    results = []
    wb = xlrd.open_workbook(file_path)
    for sheet in wb.sheets():
        nrow = sheet.nrows
        for i in range(1, nrow):
            data_one_row = sheet.row_values(i, start_colx=0, end_colx=None)
            data_one_row.append(date.today())
            results.append(data_one_row)
    return results
#批量插入到PartItem 表的数据
def update_for_partItem():
    sql = 'select max("USN"),"SN",max("OSN"),max("PN"),max("PartName"),max("Spec"),max("UsedTimes") as "UsedTimes",' \
          'count(case when "Result"=\'FAIL\' then "Result" else null end) as "ErrorCounts",max("TrnDate") as TrnDate ' \
          'from "PartItemResult" group by "SN";'
    insert_list = []

    with connection.cursor() as cursor:
        start_time = time.time()
        cursor.execute(sql)
        datas = cursor.fetchall()

    for data in datas:
        SN_foo = PartItem.objects.filter(SN=data[1])
        NG_rate = round(data[7] / data[6], 2) if data[6] > 0 else 0
        if SN_foo:
            SN_foo[0].UsedTimes = data[6]
            SN_foo[0].ErrorCounts = data[7]
            SN_foo[0].TruDate = data[8]
            SN_foo[0].NGRate = NG_rate
            SN_foo[0].save()
        else:
            case = PartItem(
                SN=data[1], OSN=data[2],PN=data[3],
                PartName=data[4], Spec=data[5],
                UsedTimes=data[6], NextCheckDate=None,
                ErrorCounts=data[7],TrnDate=data[8],
                NGRate=NG_rate,
            )
            insert_list.append(case)
    if insert_list:
        PartItem.objects.bulk_create(insert_list)