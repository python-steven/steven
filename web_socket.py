#coding=utf-8
import flask,json
server=flask.Flask(__name__)#__name__代表当前的python文件。把当前的python文件当做一个服务启动
@server.route('/index',methods=['post'])
#第一个参数就是路径,第二个参数支持的请求方式，不写的话默认是get，
#加了@server.route才是一个接口，不然就是一个普通函数
def index():
    parmas = flask.request.json
    if parmas:
        Name=parmas.get('name')
        Ps= parmas.get('ps')
        res = {'code':200,"data":{"Name":Name,"Ps":Ps}}
        return json.dumps(res, ensure_ascii=False)
    else:
        f = open('jiekou.html',encoding='utf-8')
        res1 = f.read()
        f.close()
        return res1
                                                                                                                            #json.dumps 序列化时对中文默认使用的ascii编码，输出中文需要设置ensure_ascii=False

if __name__ == '__main__':
    # port可以指定端口，默认端口是5000
    # host默认是服务器，默认是127.0.0.1
    # debug=True 修改时不关闭服务
    server.run(port=999,debug=True)