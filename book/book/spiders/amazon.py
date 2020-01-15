# -*- coding: utf-8 -*-
import scrapy
from scrapy.linkextractors import LinkExtractor
from scrapy.spiders import CrawlSpider, Rule
from scrapy_redis.spiders import RedisCrawlSpider
import pprint

class AmazonSpider(RedisCrawlSpider):
    name = 'amazon'
    allowed_domains = ['amazon.cn']
    #start_urls = ['https://www.amazon.cn/%E5%9B%BE%E4%B9%A6/b/ref=sd_allcat_books_l1?ie=UTF8&node=658390051']
    redis_key = "amazon"
    rules = (
        # 匹配大分类和小分类的地址
        Rule(LinkExtractor(restrict_xpaths=("//div[@id='leftNav']/ul[1]/ul//li")), follow=True),
        # 匹配书本里面的url标签
        Rule(LinkExtractor(restrict_xpaths=("//div[@id='mainResults']/ul/li//h2/..")), callback="parse_book_detail"),

        # 匹配列表页的翻页
        # Rule(LinkExtractor(restrict_xpaths=("//ul[@class='a-pagination']/li[last()]")), follow=True ),

    )


    def parse_book_detail(self, response):
        item = {}
        print("进入解析页")
        item["book_title"] = response.xpath("//span[@id='ebooksProductTitle']/text()").get()
        item["book_author"] = response.xpath("//div[@id='bylineInfo']/span[@class='author notFaded']/a/text()").getall()
        item["book_publish_date"] = response.xpath("//div[@id='twister']//div//table//span[@class='title-text']/span/text()").get()
        # if item["book_publish_date"] is not None:
        #     item["book_publish_date"] = item["book_publish_date"].split(",")[1]
        item["book_img"] = response.xpath("//div[@id='ebooks-img-canvas']/img/@src").get()
        item["book_prices"] = response.xpath("//div[@id='twister']//div//table//tr/td[2]//span[@class='a-size-small a-color-price']/text()").get()
        item["book_publish"] = response.xpath("//table[@id='productDetailsTable']//div//li[3]/text()").get()
        # if item["book_publish_date"] is not None:
        #     item["book_publish_date"] = item["book_publish_date"].strip().split(",")[1]
        pprint.pprint(item)
        # return item
