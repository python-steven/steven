#coding=utf-8
import requests
import json

class DoubanSpider:
    def __init__(self):
        self.url_temp = "https://m.douban.com/rexxar/api/v2/subject_collection/tv_american/items?start={}&count=18&loc_id=108288"
        self.headers = {
            "user-agent": "Mozilla/5.0 (Linux; Android 8.0.0; Nexus 6P Build/OPP3.170518.006) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Mobile Safari/537.36"}



    def paser_url(self,url):
        response = requests.get(url,self.headers)
        return response.content.decode()

    def get_content_list(self,json_str):
        dict_json = json.loads(json_str)#把字符串变成字典
        content_list = dict_json["subject_collection_items"]#字典的数据
        total = dict_json["total"]
        return content_list,total

    def save_content_list(self,content_list):
        with open("douban.txt","a",encoding="utf-8") as f:
            for content in content_list:
                f.write(json.dumps(content,ensure_ascii=False))#把字典变成字符串写入文件
                f.write("\n\n")

    def run(self):
        num = 0
        total = 100
        while total+18 > num:
            # 构造start Url
            url = self.url_temp.format(num)
            # 发送请求  获取响应
            json_str = self.paser_url(url)
            # 提取数据
            content_list,total = self.get_content_list(json_str)
            # 保存
            self.save_content_list(content_list)
            # if len(content_list)<18:
            #     break
            # 够构造下一页的url地址
            num += 18
if __name__ == '__main__':
    spideer = DoubanSpider()
    spideer.run()
"""
json.dumps() 用于将字典转换为字符串格式

json.loads() 用于将字符串转换为字典格式

"""
#https://m.douban.com/rexxar/api/v2/subject_collection/tv_american/items?os=android&for_mobile=1&callback=jsonp1&start=0&count=18&loc_id=108288&_=1578125934033
#https://m.douban.com/rexxar/api/v2/subject_collection/tv_american/items?os=android&for_mobile=1&callback=jsonp1&start=0&count=18&loc_id=108288&_=0