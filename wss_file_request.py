#coding=utf-8
import urllib
def write_lyric(song_name,lyric):
    print("正在写入歌曲{}".format(song_name))
    with open('lyrics\\{}'.format(song_name),'a',encoding='utf-8') as f:
        f.write(lyric)

def download_song(song_name,song_id):
    signer_url = 'http://music.163.com/song/media/outer/url?id={}.mp3'.format(song_id)
    print("正在下载歌曲：{}".format(song_name))
    urllib.request.urlretrieve(signer_url,'songs\\{}.mp3'.format(song_name))

if __name__ == '__main__':
    singer_id = input("请输入歌手的ID：")
    start_url = "http://music.163.com/artist?id={}".format(singer_id)
    html = get_html(start_url)
    singer_infos = get_singer_info(html)
    for singer_info in singer_infos:
        lyric = get_lyric(singer_info[1])
        write_lyric(singer_info[0],lyric)
        download_song(singer_info[0],singer_info[1])




















# import websocket
#
#
# def on_message(ws, message):
#     print(ws)
#     print(message)
#
#
# def on_error(ws, error):
#     print(ws)
#     print(error)
#
#
# def on_close(ws):
#     print(ws)
#     print("### closed ###")
#
#
# websocket.enableTrace(True)
# ws = websocket.WebSocketApp("wss://117-82-37-36.nhost.00cdn.com:59855/xyvod/p2sp/OCPG126164025",
#                             on_message=on_message,
#                             on_error=on_error,
#                             on_close=on_close)
#
# ws.run_forever()




# import json
# from ws4py.client.threadedclient import WebSocketClient
#
#
# class CG_Client(WebSocketClient):
#
#     def opened(self):
#         req = '{"event":"subscribe", "channel":"eth_usdt.deep"}'
#         self.send(req)
#
#     def closed(self, code, reason=None):
#         print("Closed down:", code, reason)
#
#     def received_message(self, resp):
#         resp = json.loads(str(resp))
#         data = resp['data']
#         if type(data) is dict:
#             ask = data['asks'][0]
#             print('Ask:', ask)
#             bid = data['bids'][0]
#             print('Bid:', bid)
#
#
# if __name__ == '__main__':
#     ws = None
#     try:
#         ws = CG_Client('wss://117-82-37-36.nhost.00cdn.com:59855/xyvod/p2sp/OCPG126164025')
#         # ws = CG_Client('http://www.baidu.com/')
#         ws.connect()
#         ws.run_forever()
#     except KeyboardInterrupt:
#         ws.close()