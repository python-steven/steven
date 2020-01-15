#coding=utf-8
import requests
import json
from lxml import etree

class TiebaSpider:
    def __init__(self,name):
        # self.start_url = "http://tieba.baidu.com/mo/q----,sz@320_240-1-3---2/m?kw=lol%pn=0"
        #https://tieba.baidu.com/f?kw=lol&pn=0&
        self.tieba_name = name
        self.start_url = "https://tieba.baidu.com/f?kw={}&pn={}&"
        self.headers = {
            "User-Agent":"Mozilla/5.0 (Linux; Android 8.0.0; Nexus 6P Build/OPP3.170518.006) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Mobile Safari/537.36",

            "Cookie": "PSTM=1556760707; BIDUPSID=5159BE42EC0C8C4C0121A72E05E58188; BAIDUID=5C971106EEAE6905D470625D4C91D0F2:SL=0:NR=10:FG=1; TIEBA_USERTYPE=723d03f2942c5ebc2c68ce72; bdshare_firstime=1560481351946; TIEBAUID=2efb27f752b1b37339f3e51f; __cfduid=d051f15edea5311b8ac45fa2f01659dfa1572597074; BDSFRCVID=iDFOJeC62614z9RuB9vsMHXdfe_xOYJTH6aoS4HMjWVKzUd1r7dQEG0PDU8g0Ku-S2EqogKK3gOTHxKF_2uxOjjg8UtVJeC6EG0Ptf8g0M5; H_BDCLCKID_SF=tJKeoD_atCK3qJPlDKTJM-Ay2qraetJyaR3DXCnvWJ5TMCozK6QRy4C0Ll5r-fr7yInh0C-KWDo-ShPC-frx35_tjtRuQMTU056q5Jc13l02VM79e-t2ynLV0b5m-4RMW20e0h7mWPnvsxA45J7cM4IseboJLfT-0bc4KKJxbnLWeIJIjjCKejJXDG_Dt6nD2nCjsJ3SaPOBJJ_k-PnVeU-zLtnZKxtqtDjHox3Fat5IqCO1Xf7ib-K8jajZJJ5nWncKaxbmtRIhOp6bylJTKJKYM4v405OTX5-O0KJcbRomVlOGhPJvyTtsXnO7hUnlXbrtXp7_2J0WStbKy4oTjxL1Db3JKjvMtIFtVDDbfID5MD_r-tu_-4_tbh_X5-RLfK5RKq7F5l8-hCLljbCB0RLYeqjeWxvv5Ic-M-nvylcxOKQphp-MyMuq3njihqQbt6uf0UjN3KJmsMK9bT3v5Du9D4oD2-biWb7M2MbdMpvP_IoG2Mn8M4bb3qOpBtQmJeTxoUJ25DnJhhCGe4bK-Tr0DHD8qx5; H_WISE_SIDS=138596_127759_139403_139148_137758_136431_139357_139863_136413_110085_140268_138560_140593_139887_139406_127416_138312_138425_139733_139971_140682_139926_140597_140557; BDORZ=B490B5EBF6F3CD402E515D22BCDA1598; delPer=0; PSINO=6; pgv_pvi=6315401216; pgv_si=s1689570304; wise_device=0; BDUSS=GRlUzY4eUdjVnM2TkdRdH5uT2J1bFd3NVFRaWE5ZjBtS0pQQXRhRmJJdnJMVHBlSUFBQUFBJCQAAAAAAAAAAAEAAACum6RNAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOugEl7roBJed; BDRCVFR[feWj1Vr5u3D]=I67x6TjHwwYf0; Hm_lvt_98b9d8c2fd6608d564bf2ac2ae642948=1578279595,1578279671,1578280889,1578293976; NO_UNAME=1; IS_NEW_USER=bcf772fdfbc6471ed00abfcf; BAIDU_WISE_UID=wapp_1578294038205_246; USER_JUMP=-1; CLIENTWIDTH=412; CLIENTHEIGHT=732; LASW=412; mo_originid=2; recommend_item_click=0; SEENKW=lol%23%E6%9D%8E%E6%AF%85%23%C0%EE%D2%E3; Hm_lpvt_98b9d8c2fd6608d564bf2ac2ae642948=1578295183; WIFI_SF=1578295641; H_PS_PSSID=1445_21079_30211_30284_22158"


        }

    #发送请求 获取响应数据
    def parse_url(self,url):
        response = requests.get(url,headers=self.headers)
        return response.content.decode()

    def get_content_list(self,html_str):
        html = etree.HTML(html_str)
        div_list = html.xpath("//div[@id='tlist']//li")#  所有的//div[@id='tlist']//li/a/div.span
        """
        //div[@id='tlist']//li/div//span[@class='ti_author']  作者
        //div[@id='tlist']//li/div//span[@class='ti_time']    时间
        //div[@id='tlist']//li/a//div[@class='ti_title']    标题
        //div[@id='tlist']//li/a//div[@class='ti_func_btn btn_reply']    点赞次数
        //div[@id='tlist']//li/a/@href    图片链接
        
        
        
        """
        print(len(div_list),div_list)
        content_list = []
        for div in div_list:
            item ={}
            item["author"] = div.xpath("/.//div//span[@class='ti_author']//text()")[0] if len(div.xpath("/.//div//span[@class='ti_author']//text()"))>0 else None
            item["time"] = div.xpath("/.//div//span[@class='ti_time']//text()")[0] if len(div.xpath("/.//div//span[@class='ti_time']//text()"))>0 else None
            item["title"] = div.xpath("/.//a//div[@class='ti_title']//text()")[0] if len(div.xpath("/.//a//div[@class='ti_title']//text()"))>0 else None
            item["count"] = div.xpath("/.//a//div[@class='ti_func_btn btn_reply']//text()")[0] if len(div.xpath("/.//a//div[@class='ti_func_btn btn_reply']//text()"))>0 else None
            item["pic_url"] = div.xpath("/.//a//div[@class='medias_item']//img/@src")[0] if len(div.xpath("/.//a//div[@class='medias_item']//img/@src"))>0 else None
            # item["img_list"] = self.get_img_list(item["pic_url"])
            content_list.append(item)
            print(item)
        print(content_list)
        #提取下一页的url
        pages_obj = html.xpath("//div[@id='tlist']//input/@value") if len(html.xpath("//div[@id='tlist']//input/@value"))>0 else None
        print(pages_obj)
        if pages_obj !=None:
            page_current = pages_obj.split("/")[0]
            page_max = pages_obj.split("/")[1]
        else:
            page_current=None
            page_max=None
        return content_list,page_current,page_max

    def get_img_list(self,detail_url):

        return ""

    def save_content_list(self,content_list):
        file_name = self.tieba_name+".txt"
        with open(file_name,"a",encoding="utf-8") as f:
            for content in content_list:
                if isinstance(content,bytes):
                    content = str(content,encoding='utf-8')
                f.write(json.dumps(content,ensure_ascii=False,indent=2))
                f.write("\n")
        print("保存数据成功")


    def run(self):

        #start_url
        num = 30
        while True:
            #发送请求 获取响应
            print(self.start_url.format(self.tieba_name,num))
            html_str = self.parse_url(self.start_url.format(self.tieba_name,num))
            #提取数据 提取下一页的url地址
            #提取列表页的url地址和标题
            #提取详情页第一页的图片， 提取下一页的地址
            #请求详情下一页的地址， 进入循环

            content_list,page_current,page_max = self.get_content_list(html_str)
            #保存数据
            self.save_content_list(content_list)
            num += 30
            if num >3000:
                break
            #请求下一页的url地址 进入循环
            # if page_current == page_max:
            #     break
            # elif num >= 180:
            #     break
if __name__ == '__main__':
    tieba = TiebaSpider("lol")
    tieba.run()