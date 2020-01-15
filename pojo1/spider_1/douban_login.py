#coding=utf-8
import time
from selenium import webdriver
import requests

driver = webdriver.PhantomJS(executable_path=r'E:\software\selenium\phantomjs-2.1.1-windows\bin\phantomjs.exe')

driver.get("https://www.douban.com")

driver.find_element_by_id("form_email").send_keys("784542623@qq.com")
driver.find_element_by_id("form_password").send_keys("zhoudawei123")

captcha_image_url = driver.find_element_by_id("captcha_image").get_attribute("src")
content = requests.get(captcha_image_url).content


time.sleep(5)

driver.find_element_by_class_name("bn-submit").click()

cookies = driver.get_cookies()
cookies = {i["name"]:i["value"] for i in cookies}


driver.quit()