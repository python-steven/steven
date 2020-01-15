# coding=utf-8
import requests
import json
import sys
from retrying import retry

class BaiduFanyi:
    def __init__(self, trans_str):
        self.trans_str = trans_str
        self.lang_detect_url = "https://fanyi.baidu.com/langdetect"
        self.trans_url = "https://fanyi.baidu.com/basetrans"
        self.headers = {
            "user-agent": "Mozilla/5.0 (Linux; Android 8.0.0; Nexus 6P Build/OPP3.170518.006) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Mobile Safari/537.36"}

    def parse_url(self, url, data):
        response = requests.post(url, data=data, headers=self.headers)
        return json.loads(response.content.decode())

    # 提取翻译的结果
    def get_ret(self, dict_response):
        ret = dict_response["trans"][0]["dst"]
        print("result is :", ret)

    @retry(stop_max_attempt_number=3)
    def run(self):
        # 获取语言类型
        # 准备POST 的url地址    post——data
        lang_detect_data = {"query": self.trans_str}
        # 发送post请求 获取响应
        lang = self.parse_url(self.lang_detect_url, lang_detect_data)['lan']
        print(lang*20)
        # 提取语言类型

        # 准备post的数据
        trans_data = {
            "query": self.trans_str,
            "from": "zh",
            "to": "en",
        } if lang == "zh" else {
            "query": self.trans_str,
            "from": "en",
            "to": "zh",
        }
        print(trans_data)
        # 发送请求，获取响应
        dict_response = self.parse_url(self.trans_url, trans_data)
        # 提取翻译的结果
        self.get_ret(dict_response)


if __name__ == '__main__':
    trans_str = sys.argv[1]
    baidu_fanyi = BaiduFanyi(trans_str)
    baidu_fanyi.run()
