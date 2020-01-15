#coding=utf-8
#安装2.48.0版本的
from selenium import webdriver
import time

driver = webdriver.PhantomJS(executable_path=r'E:\software\selenium\phantomjs-2.1.1-windows\bin\phantomjs.exe')
driver.get("https://www.baidu.com/s?wd=python&rsv_spt=1&rsv_iqid=0xdec9c9b800009b84&issp=1&f=8&rsv_bp=1&rsv_idx=2&ie=utf-8&rqlang=cn&tn=baiduhome_pg&rsv_enter=0&rsv_dl=tb&oq=selenium.common.exceptions.NoSuch%2526gt%253Blement%2526gt%253Bxception%253A%2520Screenshot%253A%2520available%2520via&inputT=3510&rsv_t=89821xj4EGgmaMSoZcGNNnbA9dQUBGAcSU5N7eiWnS4r4Zcd%2FdzEH08%2BHMjBi%2FObWs3A&rsv_pq=b99f58740001241b&rsv_sug3=12&rsv_sug1=4&rsv_sug7=100&rsv_sug2=0&rsv_sug4=5019")
print(driver.find_element_by_link_text("下一页>").get_attribute("href"))
print(driver.find_element_by_partial_link_text("下一页").get_attribute("href"))#连接中包含的文本信息


driver.quit()









# driver.get("http://36kr.com/")
#
# ret1 = driver.find_elements_by_xpath("//div[@class='kr-home-flow-list']/div")
# print(len(ret1))
#
# for li in ret1:
#     # obk = li.find_element_by_xpath(".//div")
#     obk = li.find_element_by_xpath(".//div//img")
#     time.sleep(3)
#     print(obk.get_attribute("src"))
