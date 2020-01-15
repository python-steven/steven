# -*- coding: utf-8 -*-
import scrapy
import re

class GithubSpider(scrapy.Spider):
    name = 'github'
    allowed_domains = ['github.com']
    start_urls = ['https://github.com/login']

    def parse(self, response):#这里是直接请求参数的登入
        authenticity_token = response.xpath("//input[@name='authenticity_token']/@value").get()
        utf8 = response.xpath("//input[@name='utf8']/@value").get()
        commit = response.xpath("//input[@name='commit']/@value").get()
        timestamp = response.xpath("//input[@name='timestamp']/@value").get()
        timestamp_secret = response.xpath("//input[@name='timestamp_secret']/@value").get()
        ga_id = response.xpath("//input[@name='ga_id']/@value").get()
        # webauthn_support = response.xpath("//input[@name='webauthn-support']/@value").get()
        # webauthn_invpaa_support = response.xpath("//input[@name='webauthn_invpaa_support']/@value").get()
        if ga_id is None:
            ga_id ="1380015307.1578623623"
        # if webauthn_support == "unknown" or None:
        webauthn_support = "supported"
        # if webauthn_invpaa_support is None:
        webauthn_invpaa_support = "unsupported"
        # webauthn support= "support"
        post_data = dict(
            commit=commit,
            utf8=utf8,
            authenticity_token=authenticity_token,
            ga_id=ga_id,
            webauthn_support=webauthn_support,
            webauthn_invpaa_support=webauthn_invpaa_support,

            login="1623869514@qq.com",
            password="xuxuwen11044141",
            timestamp=timestamp,
            timestamp_secret=timestamp_secret,

        )
        print(post_data)
        yield scrapy.FormRequest(
            "https://github.com/session",
            formdata=post_data,
            callback=self.after_login

        )

    def after_login(self,response):
        with open("a.html","w",encoding="utf-8") as f:
            f.write(response.body.decode())
        print(re.findall("python-steven", response.body.decode()))