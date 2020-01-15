# -*- coding: utf-8 -*-
import scrapy
from yangguang.items import YangguangItem
from copy import deepcopy

class YgSpider(scrapy.Spider):
    name = 'yg'
    allowed_domains = ['sun0769.com']
    start_urls = ['http://wz.sun0769.com/index.php/question/questionType?type=4&page=0']



    """
    如果需要模拟登陆的话，需要如下操作
        def start_requests(self):
        cookies = "yfx_sv_c_g_u_id=_ck20010914590010934553283476500;"
        cookies = {i.split("=")[0]:i.split("=")[1] for i in cookies.split(";")}
        yield scrapy.Request(
            self.start_urls[0],
            callback=self.parse,
            cookies=cookies
            
        )
    
    #查询是否有传cookies的话，就可以修改Setting.py文件中加入     COOKIES_DEBUG = True
                                                           COOKIES_ENABLED = False
    
    """

    def parse(self, response):
        tr_list = response.xpath("//div[@class='greyframe']/table[2]/tr/td/table/tr")
        print(len(tr_list))
        for tr in tr_list:
            item = YangguangItem()
            item["title"] = tr.xpath("./td[2]/a[@class='news14']/@title").get()
            item["href"] = tr.xpath("./td[2]/a[@class='news14']/@href").get()
            item["publish_date"] = tr.xpath("./td[last()]/text()").get()

            yield scrapy.Request(
                item['href'],
                callback = self.parse_detail,
                meta={"item":deepcopy(item)}

            )
            #翻页
            next_url = response.xpath("//a[text()='>']/@href").get()
            if next_url is not None:
                yield scrapy.Request(
                    next_url,
                    callback=self.parse
                )
    def parse_detail(self,response):
        item = response.meta["item"]
        item["content"] = response.xpath("//div[@class='contentext']//text()").get()
        item["content_img"] =response.xpath("//div[@class='textpic']//img/@src").getall()
        item["content_img"] =["http://wz.sun0769.com/" +i for i in item["content_img"]]
        # print(item)
        yield item
