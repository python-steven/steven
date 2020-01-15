# -*- coding: utf-8 -*-
import scrapy
import logging
from myspider.myspider.items import *

logger = logging.getLogger(__name__)

class ItcastSpider(scrapy.Spider):
    name = 'itcast'                                                            #爬虫名字
    allowed_domains = ['itcast.cn']                                            #允许爬取的范围
    start_urls = ['http://www.itcast.cn/channel/teacher.shtml']                #最开始请求的url地址

    def parse(self, response):                                                 #这里是重写了scrapy.Spider的parse
        #处理start url地址的响应
        # ret1 = response.xpath("//div[@class='tea_con']//h3/text()").getall()
        # print(ret1)
        #分组

        li_list = response.xpath("//div[@class='tea_con']//li")                 #提取错误的话就会返回空列表
        for li in li_list:
            item=MyspiderItem()
            item['come_from']="itcast"
            item['name'] = li.xpath(".//h3/text()").get()
            item['title'] = li.xpath(".//h4/text()").get()
            logger.warning(item)
            yield item                                                          #这里不能做列表的[]   只能Request,BaseItem,dict,None
