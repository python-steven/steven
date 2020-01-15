# -*- coding: utf-8 -*-

# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html
import re
import json
class YangguangPipeline(object):
    def process_item(self, item, spider):
        print(type(item))
        print(item)
        # item['content'] =self.process_content(item["content"])

        with open("dongguanshixin.json","a",encoding="utf-8") as f:
            f.write("data0:")
            f.write(json.dumps(dict(item),ensure_ascii=False,indent=2))
            f.write("\n")

        return item
    def process_content(self,content):
        content = [re.sub(r"\xa0|\s","",i) for i in content]
        content = [i for i in content if len(i)>0]  #去除空字符串
        return content

    """
    #在爬虫开启的时候执行， 只是执行一次
    def open_spider(self,spider):
        self.file = open(spider.seetings.get("SAVE_FILE","./temp.json"),"w")
    #在爬虫关闭的时候执行， 只是执行一次    
    def close_spider(self,spider):
        self.file.close()

    
    
    
    """