# -*- coding: utf-8 -*-
import scrapy
from copy import deepcopy
import json
import urllib
import time
class JdSpider(scrapy.Spider):
    name = 'jd'
    allowed_domains = ['jd.com','p.3.cn']
    start_urls = ['https://book.jd.com/booksort.html']

    def parse(self, response):
        dt_list = response.xpath("//div[@class='mc']/dl/dt") #大分类列表
        for dt in dt_list:
            item ={}
            item['b_cate']=dt.xpath("./a/text()").get()
            em_list = dt.xpath("./following::dd[1]/em") #小分类地址
            for em in em_list:
                item["s_href"] = em.xpath("./a/@href").get()
                item["s_cate"] = em.xpath("./a/text()").get()
                if item["s_href"] is not None:
                    item["s_href"] = "https:"+item["s_href"]
                yield scrapy.Request(
                    item["s_href"],
                    callback=self.parse_book_list,
                    meta={"item":deepcopy(item)}

                )
    def parse_book_list(self,response):#解析列表页
        item = response.meta["item"]
        li_list = response.xpath("//div[@id='plist']/ul/li")
        for li in li_list:
            item["book_img"] = li.xpath(".//div[@class='p-img']/@src").get()
            if item["book_img"] is None:
                item["book_img"] = li.xpath(".//div[@class='p-img']//img/@data-lazy-img").get()
            item["book_img"] = "https:"+item["book_img"] if item["book_img"] is not None else None
            item["book_name"] = li.xpath(".//div[@class='p-name']/a/em/text()").get().strip()
            item["book_author"] = li.xpath(".//span[@class='author_type_1']/a/text()").getall()
            item["book_press"] = li.xpath(".//span[@class='p-bi-store']/a/@title").get()
            item["book_publish_date"] = li.xpath(".//span[@class='p-bi-date']/text()").get().strip()
            item["book_sku"] = li.xpath("./div/@data-sku").get()
            yield scrapy.Request(
                "https://p.3.cn/prices/mgets?skuIds=J_{}".format(item["book_sku"]),
                callback=self.parse_book_price,
                meta={"item":deepcopy(item)}

            )
        #翻页

        time.sleep(2)
        next_url = response.xpath("//a[@class='pn-next']/@href").get()
        if next_url is not None:
            next_url = urllib.parse.urljoin(response.url,next_url)
            yield scrapy.Request(
                next_url,
                callback=self.parse,
                meta={"item":item}

            )

    def parse_book_price(self,response):
        item = response.meta["item"]
        item["book_price"]= json.loads(response.body.decode())[0]["op"]
        print("小说详细信息如下：")
        print(item)
        print("^^^^^"*16)
