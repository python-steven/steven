import re
import requests
import json
from pprint import pprint
url = "http://36kr.com/"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36"}
html_str = requests.get(url,headers=headers)
# print(html_str.content.decode())
ret = re.findall("<script>window.initialState=(.*?)</script>",html_str.content.decode())[0]
with open("36kr.json","w",encoding="utf-8") as f:
    f.write(ret)
con = json.loads(ret)
pprint(con)
