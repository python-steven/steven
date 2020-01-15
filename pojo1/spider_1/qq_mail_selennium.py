#coding=utf-8
#安装2.48.0版本的
from selenium import webdriver
import time


driver = webdriver.PhantomJS(executable_path=r'E:\software\selenium\phantomjs-2.1.1-windows\bin\phantomjs.exe')
driver.get("https://mail.qq.com/")
#切换iframe
driver.switch_to_frame("login_frame")
# driver.switch_to_active_element()
driver.find_element_by_id("u").send_keys("1623869514")


time.sleep(3)
driver.quit()