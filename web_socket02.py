import flask
import json
import datetime

server=flask.Flask(__name__)
@server.route('/file_upload',methods=['post'])
def file_upload():
    f=flask.request.files.get('wjm',None)# 上传文件，取一个名字，再给名字一个默认值None
    if f:# 如果文件不为空
        cur_time=datetime.datetime.now().strftime("%Y%m%d%H%M%S")# 如果上传同一个文件两次，会被覆盖，所以加一个当前日期，并指定日期格式strftime("%Y%m%d%H%M%S")
        new_file_name=cur_time+f.filename# 新文件名=时间+原来的文件名
        f.save(new_file_name)#保存文件
        res={"msg":"文件上传成功"}
    else:
        res={"msg":"没有上传文件"}
    return  json.dumps(res,ensure_ascii=False)#防止出现乱码

server.run(port=8888,debug=True)