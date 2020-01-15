# -*- coding: utf-8 -*-
import scrapy
import json
from myspider.myspider.items import MyspiderItem

class HrSpider(scrapy.Spider):
    name = 'hr'
    allowed_domains = ['tencent.com']
    start_urls = ['https://careers.tencent.com/tencentcareer/api/post/Query?pageIndex=1&pageSize=10']
    # start_urls = ['https://careers.tencent.com/search.html']

    def parse(self, response):
        rs = json.loads(response.text)
        # print(rs["Data"]["Posts"][0]["RecruitPostName"])

        if rs['Code'] == 200:
            for i in range(0,len(rs["Data"]['Posts'])):
                item =MyspiderItem()
                item['职位'] = rs["Data"]["Posts"][i]["RecruitPostName"]
                item['国家'] = rs["Data"]["Posts"][i]["CountryName"]
                item['城市'] = rs["Data"]["Posts"][i]["LocationName"]
                item['类型'] = rs["Data"]["Posts"][i]["CategoryName"]
                item['更新时间'] = rs["Data"]["Posts"][i]["LastUpdateTime"]
                item['详情url'] = rs["Data"]["Posts"][i]["PostURL"]
                print(item)

            page = rs["Data"]["Count"]
            if page is not None:
                for i in range(1,page):
                    next_url = "https://careers.tencent.com/tencentcareer/api/post/Query?pageIndex={}&pageSize=10".format(i)
                    yield scrapy.Request(
                        next_url,
                        callback=self.parse,

                    )
        # tr_list = response.xpath("//div[@class='recruit-list']")[1:-1]
        # print(tr_list)
        # for tr in tr_list:
        #     item={}
        #     item['title'] = tr.xpath(".//h4/text()").get()
        #     item['position'] = tr.xpath(".//p[@class='recruit-text']/text()").get()
        #     item['publish_date'] = tr.xpath(".//p[@class='recruit-tips']/span[4]/text()").get()
        #     yield item
        # #找到下一页的地址
        # next_url = response.xpath("//a[@id='next']/@href").get()
        # if next_url != "javascript:;":
        #     next_url = "http://hr.te/"+next_url
        #     yield scrapy.Request(
        #
        #         next_url,
        #         callback=self.parse,
        #         meta = {"item":item}
        #     )


        #scrapy.Request 里面可以添加（url[,callback,method='GET',headers,body,cookies,meta,dont_filter=False]）