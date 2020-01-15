# coding=utf-8
import requests

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36"}
urll="https://fanyi.baidu.com/v2transapi"
data ={
    "from": "zh",
    "to": "en",
    "query": "你好",
    "transtype": "translang",
    "simple_means_flag": "3",
    "sign": "232427.485594",
    "token": "e50245e8080c020781dfffa7a6edf0c5"
}

r = requests.post(urll,data=data,headers=headers)
print(r.content.decode())

# p = {"wd": "传智播客"}
# url_temp = "https://tieba.baidu.com/f?ie=utf-8&kw={}&fr=search".format("lol")
# response = requests.get(url_temp, headers=headers)

# print(response.status_code)
# print(response.url)
# print(response.headers)
# print(response.request.headers)
# print(response.content.decode())
