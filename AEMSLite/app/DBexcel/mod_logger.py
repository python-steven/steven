import os
import sys
import time
import logging
"""
@Singleton  #如需打印不同路径的日志（运行日志、审计日志），则不能使用单例模式（注释或删除此行）。此外，还需设定参数name。
:param set_level: 日志级别["NOTSET"|"DEBUG"|"INFO"|"WARNING"|"ERROR"|"CRITICAL"]，默认为INFO
:param name: 日志中打印的name，默认为运行程序的name
:param log_name: 日志文件的名字，默认为当前时间（年-月-日.log）
:param log_path: 日志文件夹的路径，默认为logger.py同级目录中的log文件夹
:param use_console: 是否在控制台打印，默认为True
"""
file_name = os.path.split(os.path.splitext(sys.argv[0])[0])[-1]                     #系统目录名字
file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "log")         #存放路径
log_time = time.strftime("%Y-%m-%d.log", time.localtime())                          #日志文件的名字
class Logger:
    def __init__(self, set_level="INFO",name=file_name,log_name=log_time,log_path=file_path,use_console=True):
        if not set_level:
            set_level = self._exec_type()  # 若设置set_level为None，自动获取当前运行模式
        self.__logger = logging.getLogger(name)

        self.__logger.setLevel(         # 设置日志级别
            getattr(logging, set_level.upper())
            if hasattr(logging, set_level.upper()) else logging.INFO
        )

        if not os.path.exists(log_path):  # 创建日志目录
            os.makedirs(log_path)
        formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")   #日志格式
        handler_list = list()
        handler_list.append(logging.FileHandler(os.path.join(log_path, log_name), encoding="utf-8")) #文件日志

        if use_console:     #控制台日志
            handler_list.append(logging.StreamHandler())
        for handler in handler_list:
            handler.setFormatter(formatter)
            self.addHandler(handler)

    def __getattr__(self, item):
        return getattr(self.logger, item)

    @property
    def logger(self):
        return self.__logger

    @logger.setter
    def logger(self, func):
        self.__logger = func

    def _exec_type(self):
        return "DEBUG" if os.environ.get("IPYTHONENABLE") else "INFO"

