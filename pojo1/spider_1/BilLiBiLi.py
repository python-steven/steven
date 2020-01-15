# coding=utf-8
import requests
import json
import re
from lxml import etree,html

class BiLiBiLi:
    def __init__(self,url):
        self.url = url
        #弹幕的消息
        self.danmu_url = 'https://comment.bilibili.com/{}.xml'
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36"

        }

    """发送请求 返回响应"""
    def get_html(self,url):
        return requests.get(url,headers=self.headers).content.decode()
    """保存弹幕信息"""
    def save_danmu(self,l,num):
        with open('./danmu{}.txt'.format(num),'a',encoding='utf-8') as f:
            for danm_str in l:
                print(danm_str)
                f.write(danm_str)
                f.write("\n")

    def run(self):
        #发送请求 获取结果
        bl_html = self.get_html(self.url)
        print(bl_html)
        print("获取cid")
        li = re.findall(r"<option value='.*?' cid='(\d+)'>",bl_html)
        if len(li) == 0:
            li = re.findall(r"window.__INITIAL_STATE__ = ,.*?\"cid\":(\d+),",bl_html)
        #请求xml的url并保存信息
        li.append("29711202")
        print(li)
        for num in li:
            danmu_xml = requests.get(self.danmu_url.format(num))
            xml_obj = etree.HTML(danmu_xml.content)
            l = xml_obj.xpath('//d//text()')
            print(l,"保存数据")
            self.save_danmu(l,num)

if __name__ == '__main__':
    url = 'https://www.bilibili.com/video/av18198653'
    bili = BiLiBiLi(url)
    bili.run()