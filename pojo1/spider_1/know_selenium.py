#coding=utf-8
#安装2.48.0版本的
from selenium import webdriver
import time

view = webdriver.PhantomJS(executable_path=r'E:\software\selenium\phantomjs-2.1.1-windows\bin\phantomjs.exe')

view.set_window_size(1920,1080)#窗口大小
view.get("http://www.baidu.com")#请求路由
view.save_screenshot("./baidu.png")#截屏

view.find_element_by_id("kw").send_keys("python")
view.find_element_by_id("su").click()
# print(view.page_source)
print(view.current_url)


# cookies = view.get_cookies()
# print(cookies)
# print("*"*100)
# cookies = {i["name"]:i["value"] for i in cookies}
# print(cookies)




time.sleep(3)
view.quit()
