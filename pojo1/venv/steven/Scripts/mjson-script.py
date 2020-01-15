#!D:\workspace\spider\pojo1\venv\steven\Scripts\python.exe
# EASY-INSTALL-ENTRY-SCRIPT: 'mjson==0.3.1','console_scripts','mjson'
__requires__ = 'mjson==0.3.1'
import re
import sys
from pkg_resources import load_entry_point

if __name__ == '__main__':
    sys.argv[0] = re.sub(r'(-script\.pyw?|\.exe)?$', '', sys.argv[0])
    sys.exit(
        load_entry_point('mjson==0.3.1', 'console_scripts', 'mjson')()
    )
