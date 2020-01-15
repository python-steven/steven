import flask
import json

server=flask.Flask(__name__)

@server.route('/login',methods=['post'])
def login():
                                                                                                                        #登录需要两个参数，name和pwd
    uname=flask.request.values.get('username')                                                                          # 传参，前面的是变量，括号里面是key, postman 传递的是formData的数据
    passwd=flask.request.values.get('password')                                                                         #args只能获取到跟在url后面的参数，所以我们改用values
    if uname and passwd:                                                                                                # 非空为真
        res={"error_code":1000,"mag":"登录成功","data":{'Name':uname,'password':passwd}}                                 # 接口返回的都是json，所以要这样写。先导入json模块，import json
    else:
        res={"error_code":3000,"mag":"必填参数未填，请查看接口文档！"}
    return  json.dumps(res,ensure_ascii=False)#防止出现乱码；json.dumps()函数是将字典转化为字符串

server.run(port=8888,debug=True)