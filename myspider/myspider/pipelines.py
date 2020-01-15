# -*- coding: utf-8 -*-

# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html
import logging
logger = logging.getLogger(__name__)

class MyspiderPipeline(object):
    def process_item(self, item, spider):               #这里的process——item不能改
        if spider.name == "itcast":                     #这里的spider意思就是ItcastSpider类
            logger.warning("-"*10)
            print(item)
        if spider.name =="hr":
            logger.warning("++"*10)
            print(item)
        return item
