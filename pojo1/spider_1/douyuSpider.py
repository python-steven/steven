#coding=utf-8
from selenium import webdriver
import requests
import time

class DouYuSpider:
    def __init__(self):
        self.start_url = "https://www.douyu.com/directory/all"
        self.driver = webdriver.PhantomJS(executable_path=r'E:\software\selenium\phantomjs-2.1.1-windows\bin\phantomjs.exe')

    def get_content_list(self):
        li_list = self.driver.find_elements_by_xpath("//ul[@class='layout-Cover-list']/li")
        print(len(li_list))
        content_list=[]
        for li in li_list:
            item={}
            # item['room_image'] = li.find_element_by_xpath("//div[@class='DyListCover-imgWrap']/div/img").get_attribute("src")
            item['room_image'] = li.find_element_by_xpath("./div[1]/a[1]/div[1]/div[1]/img").get_attribute("src")
            item['room_title'] = li.find_element_by_xpath(".//div[@class='DyListCover-content']//h3").get_attribute("title")
            item['room_cate'] = li.find_element_by_xpath(".//div[@class='DyListCover-info']/span[@class='DyListCover-zone']").text
            item['anchor_name'] = li.find_element_by_xpath(".//div[@class='DyListCover-content']//h2").text
            item['watch_num'] = li.find_element_by_xpath(".//div[@class='DyListCover-info']/span[@class='DyListCover-hot']").text
            print(item)
            content_list.append(item)
        next_url = self.driver.find_elements_by_xpath("//div[@class='ListFooter']/ul/li[@class='dy-Pagination-next']")
        next_url = next_url[0] if len(next_url)>0 else None
        return content_list,next_url

    def save_content_list(self,content_list):
        pass

    def run(self):#实现主要的逻辑
        #1.start_url
        #2.发送请求 获取响应
        self.driver.get(self.start_url)
        #3.提取数据，提取下一页的元素
        content_list,next_url = self.get_content_list()
        #4.保存数据
        self.save_content_list(content_list)
        #5.点击下一页元素，循环
        while next_url is not None:
            next_url.click()
            time.sleep(3)
            # 3.提取数据，提取下一页的元素
            content_list, next_url = self.get_content_list()
            # 4.保存数据
            self.save_content_list(content_list)

if __name__ == '__main__':
    douyu = DouYuSpider()
    douyu.run()