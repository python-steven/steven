# -*- coding: utf-8 -*-
import scrapy
import re

class RenrenSpider(scrapy.Spider):
    name = 'renren'
    allowed_domains = ['renren.com']
    start_urls = ['http://renren.com/']

    def start_requests(self):#携带cookies去登陆网页
        cookies = "has_recent_activity=1; logged_in=no; _octo=GH1.1.1549461457.1578623577; _ga=GA1.2.1380015307.1578623623; _gat=1; tz=Asia%2FShanghai; _gh_sess=a1hmTEJTODBBY2RnN2FURUZ2UnNsMVFrSTVLUVo0bFRMWlIzdmcvR2MvTVhJeWhNNzZmbFJVVkZKd0Y0MEVqK1JTaFpLNlNNN2c4RzBYWkNIVFgzV0ZiWUJUQWhpZ0hLdTcwbk53WnExemd2N3R1dnN0dTRtL0pEeDV2bmdpU3ppRnFjUXJ1aEV0bUpBd0JtTVltMk93cTh5TFFOaENJM1kvWkNiOWhIQjQ3Ri9XNjd4ME10b2hoWUEzRG8yRjJ0WlMwZ3dLdTFMd2dpeWx4T1loTlVMdGlaQTFEQ011cGxKY3l0RlJwWW40WktSZy9UN0MreDdIcld6eUkxMEtKUC0tOFZ0MDRDREFJdExWOExLcmQ2UURUZz09--ebe3582b4dbb88cce5fb9a31c75fa627a0b2c686"
        cookies = {i.split("=")[0]:i.split("=")[1] for i in cookies.split(";")}
        yield scrapy.Request(
            self.start_urls[0],
            callback=self.parse,
            cookies =cookies
        )
    ##这里是登陆模块的携带cookies 直接去登陆
    #后面访问的url就会直接使用携带的cookies

    def parse(self, response):
        re.findall("username",response.body.decode())
        print(response.body.decode())
