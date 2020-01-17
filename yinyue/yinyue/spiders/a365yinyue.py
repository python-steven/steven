# -*- coding: utf-8 -*-
import scrapy
import json
class A365yinyueSpider(scrapy.Spider):
    name = 'a365yinyue'
    allowed_domains = ['caihaibo.cn']
    start_urls = ['https://music.163.com/#/discover/toplist']


    def parse(self, response):
        print(dir(response))
        print(response.body.decode())
        with open("wangyi.html",'w',encoding='utf-8') as f:
            f.write(response.body.decode())

"""
class A365yinyueSpider(scrapy.Spider):
    name = 'a365yinyue'
    allowed_domains = ['yue365.com']
    start_urls = ['http://www.yue365.com/bang/tag193.shtml']
    num=1


    def parse(self, response):
        li_list = response.xpath("//ul[@id='songlist']/li")
        print("计算歌曲的数量：",len(li_list))
        for li in li_list:
            item={}
            item["class"]=response.xpath("//ul[@id='bangNav']/li[{}]/a/text()".format(self.num)).get()
            item["number"] = li.xpath(".//div[contains(@class,'num')]/text()").get()
            item["image_href"] = li.xpath(".//div[@class='songInfo']/img/@src").get()
            item["name"] = li.xpath(".//div[@class='song']/a/@title").get()
            item['singer'] = li.xpath(".//div[@class='singer']/a/@title").get()
            item['degree'] = li.xpath(".//p[@class='progress']/span/@style").get()
            if item['degree'] is not None:
                item['degree'] = ((item["degree"]).split(":"))[1]

            item["geci_href"] = li.xpath(".//div[@class='icolink']/a[2]/@href").get()
            if item["geci_href"] is not None:
                item["geci_href"] = "http://www.yue365.com"+item["geci_href"]
                yield scrapy.Request(
                    item["geci_href"],
                    callback=self.parse_geci,
                    meta={"item":item}
                )
        #构造下一页的数据
        if self.num !=11:
            self.num +=1
            next_url = response.xpath("//ul[@id='bangNav']/li[{}]/a/@href".format(self.num)).get()
        else:
            self.num = 1
            next_url = response.xpath("//ul[@id='bangNav']/li[{}]/a/@href".format(self.num)).get()

        if next_url is not None:
            next_url = "http://www.yue365.com"+next_url
            print("这里是下一页的地址：", next_url)
            yield scrapy.Request(
                next_url,
                callback=self.parse,
            )
    def parse_geci(self,response):
        item =response.meta["item"]
        item["geci_text"] = response.xpath("//div[@id='txtgc']//text()").getall()
        with open("douying365.json","a",encoding='utf-8') as f:
            f.write(json.dumps(dict(item),ensure_ascii=False,indent=2)+"\n")
        # print(item)
"""