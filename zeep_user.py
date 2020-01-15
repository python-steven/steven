#!/usr/bin/python
# coding:utf-8

from zeep import Client

ip = '127.0.0.1'
port = 8000
client = Client("http://%s:%s/?wsdl" % (ip, port))
# print(client.wsdl.dump())

### say_hello
factory = client.type_factory("ns0")
r = client.service.say_hello('zhansgan', 3)
print(r,factory)

### say_hello_1
# factory = client.type_factory("ns0")
# person = factory.Person(name='zhangsan', age=23)
# persons = factory.PersonArray([person, person])
# r = client.service.say_hello_1(persons)
# print(r)
#
#
# ### say_hello_2
# factory = client.type_factory("ns0")
# persons = factory.stringArray(["zhansgan", "lisi"])
# r = client.service.say_hello_2(persons)
# print(r)