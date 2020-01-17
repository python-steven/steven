import smtplib
from email.mime.text import MIMEText
from email.utils import formataddr
from django.core.mail  import  EmailMultiAlternatives, get_connection
from django.template import Context, loader
import traceback
from zeep import Client
sender = 'WZS-TSC@wistron.com'
password = '123qweASD@'
# def sendmail(receivers, content, subject):
#     ret = True
#     try:
#         msg = MIMEText(content, 'html', 'utf-8')
#         msg['From'] = formataddr(["Devlop", sender])
#         msg['To'] = formataddr(["Signers", ",".join(receivers)])
#         msg['Subject'] = subject
#         conn = smtplib.SMTP('wzsowa.wistron.com', 587) #wistron mail server, port 587
#         conn.starttls()
#         conn.login(sender, password)
#         conn.sendmail(sender, receivers, msg.as_string())
#         conn.quit()
#     except Exception as ex:
#         traceback.print_exc()
#         ret = False
#     return ret

# def send_mail(receivers, subject, content, mail_type):
#     """ 按mail_type选定的格式发送邮件 """
#     ret = True
#     try:
#         msg = MIMEText(content, mail_type, 'utf-8')
#         msg['From'] = formataddr(["Devlop", sender])
#         msg['To'] = formataddr(["Signers", ",".join(receivers)])
#         msg['Subject'] = subject
#         conn = smtplib.SMTP('wzsowa.wistron.com', 587) #wistron mail server, port 587
#         conn.starttls()
#         conn.login(sender, password)
#         conn.sendmail(sender, receivers, msg.as_string())
#         conn.quit()
#     except Exception as ex:
#         traceback.print_exc()
#         ret = False
#     return ret
def sendmail(receivers,content,subject):
    """ 按mail_type选定的格式发送邮件 """
    client = Client("http://10.41.95.141:90/webservice/?wsdl")
    to_receivers = ",".join(receivers)  # mail receiver need
    cc_receivers = ""  # cc information
    title = subject  # mail title

    # contents = content  # mail string information
    contents = content
    result = client.service.SendMail(toReceivers=to_receivers, ccReceivers=cc_receivers
                                     , subject=title, content=contents
                                     , contentImageNameList={}, enclosureList={}
                                     )
    # print(result)
    if result == "OK":
        return True
    else:
        return False
def send_mail(receivers, subject, content, mail_type=""):
    """ 按mail_type选定的格式发送邮件 """
    client = Client("http://10.41.95.141:90/webservice/?wsdl")
    to_receivers = ",".join(receivers)  # mail receiver need
    cc_receivers = ""  # cc information
    title = subject  # mail title

    # contents = content  # mail string information
    if mail_type !="html":
        contents = """<pre>%s</pre>"""%content
    else:
        contents=content
    result = client.service.SendMail(toReceivers=to_receivers, ccReceivers=cc_receivers
                                     , subject=title, content=contents
                                     , contentImageNameList={}, enclosureList={}
                                     )
    # print(result)
    if result == "OK":
        return True
    else:
        return False

def get_html_content(action, context):
    """ 根据action来选approved，rejected，canceled模板，返回模板内容 """
    email_template_name = 'mail_template/budget_form.html'
    context['action'] = action
    t = loader.get_template(email_template_name)
    html_content = t.render(context)
    return html_content

def send_approved_form_mail(to, subject, data):
    """ 签核人同意表单后发邮件提醒申请人 """
    html_content = get_html_content('approved', data)
    send_mail(to, subject, html_content, 'html')

def send_rejected_form_mail(to, subject, data):
    """ 签核人拒签表单后发邮件提醒申请人 """
    html_content = get_html_content('rejected', data)
    send_mail(to, subject, html_content, 'html')

def send_canceled_form_mail(to, subject, data):
    """ 申请人取消表单后发邮件提醒签核人此表单已取消 """
    html_content = get_html_content('canceled', data)
    send_mail(to, subject, html_content, 'html')

def send_inform_pw_mail(to, subject, data):
    """ 添加新用户后系统发邮件给此用户告知账号和密码进行登录 """
    email_content = 'AEMS Lite System has automatically generated a new password for you.\r\n\r\n'
    email_content += "Your Account is: %s.\r\n" % data['user']
    email_content += "Your Password is: %s.\r\n" % data['pw']    
    email_content += "\r\nPlease use your e-mail as user name and this password to login AEMSLite system."
    email_content += "After you login, please remember to change it. \r\n"
    email_content += "\r\n\r\nTHIS EMAIL WAS SENT BY AEMSLite SERVER AUTOMATICALLY. PLEASE DON'T DIRECTLY REPLY!!!\r\n"
    email_content += "AEMS Lite System http://10.41.95.89:90/index/"
    send_mail(to, subject, email_content, 'plain')

def send_apply_form_mail(to, subject, data):
    """ 提交申请单后发送邮件给签核人签核 """
    email_content = 'Dear %s, \n\n' % data['signer']
    email_content += "%s submit a budget code eform waiting for your review/approval.\r\n" % data['applicant']
    email_content += "You can click the below link to approve or reject. Thank you. \r\n"
    email_content += "\r\n\r\nTHIS EMAIL WAS SENT BY AEMSLite SERVER AUTOMATICALLY. PLEASE DON'T DIRECTLY REPLY!!!\r\n"
    email_content += "AEMS Lite System http://10.41.95.89:90/index/"
    send_mail(to, subject, email_content, 'plain')

def send_user_forget_pwd_mail(to, data):
    """ 提交申请单后发送邮件给签核人签核 """
    subject = "Your password on AEMS Lite system has been changed"
    email_content = 'Dear %s, \n\n' % data['user_name']
    email_content += "Your password has been changed as below.\r\n"
    email_content += "%s \r\n" % data['new_pwd']
    email_content += "Please use %s and this password to login and remember to change it after you login successfully.\r\n" % data['employee_id']
    email_content += "\r\n\r\nTHIS EMAIL WAS SENT BY AEMSLite SERVER AUTOMATICALLY. PLEASE DON'T DIRECTLY REPLY!!!\r\n"
    email_content += "AEMS Lite System http://10.41.95.89:90/index/"
    send_mail(to, subject, email_content, 'plain')

def send_remind_form_mail(to, subject, data):
    """ 提交申请单后发送邮件给签核人签核 """
    email_content = 'Dear %s, \n\n' % data['signer']
    email_content += "There are %s budget code forms waiting for your verification.\r\n" % data['applicant_count']
    email_content += "Please check the forms on AEMS Lite System by clicking below link to approve or reject. Thank you. \r\n"
    email_content += "\r\n\r\nTHIS EMAIL WAS SENT BY AEMSLite SERVER AUTOMATICALLY. PLEASE DON'T DIRECTLY REPLY!!!\r\n"
    email_content += "AEMS Lite System http://10.41.95.89:90/index/"
    send_mail(to, subject, email_content, 'plain')
def send_remind_applyer_mail(to, subject, data):
    """ 提交申请单后发送邮件给签核人签核 """
    email_content = 'Dear %s, \n\n' % data['signer']
    email_content += "\tThere are %s budget code forms waiting for your edit.\r\n" % data['applicant_count']
    email_content += "\tPlease check the forms on AEMS Lite System by clicking below link to edit or close. Thank you. \r\n"
    email_content += "\r\n\r\nTHIS EMAIL WAS SENT BY AEMSLite SERVER AUTOMATICALLY. PLEASE DON'T DIRECTLY REPLY!!!\r\n"
    email_content += "AEMS Lite System http://10.41.95.89:90/index/"
    send_mail(to, subject, email_content, 'plain')