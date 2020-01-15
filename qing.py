import requests

url = "http://127.0.0.1:8888/login"
data = {"username":"guangnai","password":"1234567890"}
r = requests.post(url,data=data)
print(r.text)