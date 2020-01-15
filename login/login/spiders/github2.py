# -*- coding: utf-8 -*-
import scrapy
import re

class Github2Spider(scrapy.Spider):
    name = 'github2'
    allowed_domains = ['github.com']
    start_urls = ['https://github.com/login']

    def parse(self, response):
        yield scrapy.FormRequest.from_response(
            response,#自动从response 中寻找form表单
            formdata={"login":"1623869514@qq.com","password":"xuxuwen11044141"},
            callback = self.after_login

        )
    def after_login(self,response):
        with open("a.html","w",encoding="utf-8") as f:
            f.write(response.body.decode())
        print(re.findall("python-steven", response.body.decode()))
        print(len( re.findall("python-steven", response.body.decode()) ) )
