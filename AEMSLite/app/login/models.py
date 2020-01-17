from django.db import models
from datetime import datetime
# Create your models here.

#Department information Form
class Department(models.Model):
    Id = models.AutoField(primary_key=True)
    Department = models.CharField(max_length=50,null=False)               #部门
    IsActivated = models.BooleanField(default=True,null=False)            #激活状态
    UpdatedTime = models.DateTimeField(null=False)     #更新时间
    class Meta:
        db_table = 'Department'

    def __str__(self):
        return 'Id%s: Department(%s)' % (self.Id,self.Department)


#User information Form
class User(models.Model):
    Id = models.AutoField(primary_key=True)
    EmployeeId = models.CharField(max_length=20,null=False)                #员工工号
    Name = models.CharField(max_length=20,null=False)                      #员工名称
    DepartmentId = models.IntegerField(null=False,default=1)               #部门Id
    Password = models.CharField(max_length=50,null=False)                  #登入密码
    Email = models.CharField(max_length=50,null=False)                     #邮箱
    Role = models.CharField(max_length=20,null=False)                      #角色（管理员，设备管理员，。。。）
    IsActivated = models.BooleanField(default=True,null=False)             #激活状态
    CreatedTime = models.DateTimeField(auto_now_add=True,null=False)       #创建时间
    UpdatedTime = models.DateTimeField(null=False)                         #更新时间
    class Meta:
        db_table = 'User'

    def __str__(self):
        return 'Id%s: EmployeeId(%s),Name(%s),Email(%s),Role(%s)' % \
               (self.Id,self.EmployeeId,self.Name,self.Email,self.Role)


# Customer information From
class Customer(models.Model):
    Id = models.AutoField(primary_key=True)
    Customer = models.CharField(max_length=50,null=False)                  #客户名称
    IsActivated = models.BooleanField(default=True,null=False)             #激活状态
    UpdatedTime = models.DateTimeField(null=False)                         #更新时间
    class Meta:
        db_table = 'Customer'

    def __str__(self):
        return 'Id%s:Customer(%s)' % (self.Id,self.Customer)


# #Budgetcode information From
class BudgetCodeForm(models.Model):
    Id = models.BigAutoField(primary_key=True)

    DepartmentId = models.IntegerField(null=False)                         #部门ID(FK: Department Id)
    Department = models.CharField(max_length=10,null=False)                #申请部门
    Remark = models.CharField(max_length=10,null=False)                    #备注/新增或损耗
    Attachment =models.CharField(max_length=100,null=True)                 #评估报告附件(文件名字)
    BillingType = models.CharField(max_length=1,default=0)                 #开单状况(合并开单为设为1，单独开单为0，default:0)
    BudgetCode = models.CharField(max_length=30,null=True)                 #预算编码

    ApplyDate =models.DateTimeField(null=False)                            #申请日期
    ExternalNumberType = models.CharField(max_length=1,null=False)         #外部单号类型，pmcs单号:1; 201单号:2
    ExternalNumber = models.CharField(max_length=40,null=True)             #外部单号，如201单号，pmcs单号
    ExternalNumberEffectiveDate = models.DateTimeField(null=True)          #外部单号生效日期，如201单号，pmcs单号生效日期
    PicId = models.IntegerField(null=True)                                 #负责人的ID

    Pic = models.CharField(max_length=20,null=True)                        #负责人（FK: user id）
    ProductName = models.CharField(max_length=100, null=False)             #设备名称/治具类型
    Model = models.CharField(max_length=100, null=False)                   #规格/型号/版本
    PurchaseType = models.CharField(max_length=30, null=False)             #类别（杂购，折旧摊提）
    UnitPrice = models.FloatField(null=False)                              #单价
    Quantity = models.IntegerField(null=False)                             #申请数量
    Unit = models.CharField(max_length=10, null=False)                     #单位
    Currency = models.CharField(max_length=10, null=False)                 #币种

    CustomerId = models.IntegerField(null=False)                           #客户ID(FK: Customer Id)
    Customer = models.CharField(max_length=50, null=False)                 #客户
    TypeOfMachine = models.CharField(max_length=50, null=False)            #机种
    ProjectCode = models.CharField(max_length=50, null=True,blank=True)
    ApplyReason = models.CharField(max_length=200,null=False)              #申请原因/用途

    SignerId = models.IntegerField(null=False)                             #签核人id(FK: User Id)
    Signer = models.CharField(max_length=20, null=False)                   #签核人
    Status = models.CharField(max_length=20,null=False)                    #表单状态
    CreatedTime = models.DateTimeField(auto_now_add=True,null=False)       #创建时间
    UpdatedTime = models.DateTimeField(null=False)                         #更新时间

    OwnerId = models.IntegerField(null=True)                               #创建人FK：User Id
    MergeId = models.BigIntegerField(null=True)                            #合并开单时产生的ID，使这几个表单相关联
    SignRemarks = models.CharField(max_length=200,null=True)               #签核人的备注
    AttachmentPath = models.CharField(max_length=200,null=True)            #评估报告存放路径
    FormId = models.CharField(max_length=20,null=True,blank=True)          #編號
    PN = models.CharField(max_length=50,null=True,blank=True)              #PN
    ProjectId = models.IntegerField(null=True,blank=True)                  #工程Id
    AccountTitleId = models.IntegerField(null=True,blank=True)             #會計id

    requiredPICId = models.IntegerField(null=True,blank=True)              #需求人的id
    equipmentToFactoryDate = models.DateTimeField(null=True,blank=True)    #需求設備到廠日期
    poNumber = models.CharField(max_length=50,null=True,blank=True)        #PO單號
    toFactoryDate = models.DateTimeField(null=True,blank=True)             #到廠日期
    traceRemark = models.CharField(max_length=200, null=True,blank=True)   #跟蹤備註信息
    class Meta:
        db_table = 'BudgetCodeForm'

    def __str__(self):
        return 'Id%s:BillingType(%s),Department(%s),ApplyDate(%s),Pic(%s),ProductName(%s),Signer(%s),Status(%s),' \
               'BudgetCode(%s),requiredPICId(%s),equipmentToFactoryDate(%s),poNumber(%s),toFactoryDate(%s),traceRemark(%s)' % \
               (self.Id,self.BillingType,self.Department,self.ApplyDate,self.Pic,self.ProductName,self.Signer,
                self.Status,self.BudgetCode,self.requiredPICId,self.equipmentToFactoryDate,self.poNumber,
                self.toFactoryDate,self.traceRemark)


#PartItemResult From
class PartItemResult(models.Model):
    Id = models.BigAutoField(primary_key=True)
    USN = models.CharField(max_length=50,null=True,blank=True)
    SN = models.CharField(max_length=50,null=False)
    OSN = models.CharField(max_length=50,null=True,blank=True)
    Asset = models.CharField(max_length=50,null=True,blank=True)
    PN = models.CharField(max_length=20,null=False)                       #料号
    PartName = models.CharField(max_length=50,null=False)                 #料号名
    Spec = models.CharField(max_length=150,null=True,blank=True)                    #品名
    UsedTimes = models.IntegerField(null=False)                           #使用次数
    Stage = models.CharField(max_length=2,null=True,blank=True)                     #站别
    FixtureId = models.CharField(max_length=10,null=True,blank=True)
    Result = models.CharField(max_length=4,null=False)                    #测试结果
    ErrorCode = models.CharField(max_length=30,null=True,blank=True)      #错误类型
    TrnDate = models.DateTimeField(null=False)
    UpdatedTime = models.DateTimeField(auto_now=True)                     #更新时间
    PlantCode = models.CharField(max_length=20, null=True,blank=True)     # 厂别
    class Meta:
        db_table = 'PartItemResult'

    def __str__(self):
        return 'Id%s:USN(%s),SN(%s),OSN(%s),Asset(%s),PN(%s),PartName(%s),Spec(%s),UsedTimes(%s),Stage(%s),' \
               'FixtureId(%s),Result(%s),ErrorCode(%s),TrnDate(%s),UpdatedTime(%s),PlantCode(%s)' % \
               (self.Id,self.USN,self.SN,self.OSN,self.Asset,self.PN,self.PartName,self.Spec,self.UsedTimes,
                self.Stage,self.FixtureId,self.Result,self.ErrorCode,self.TrnDate,self.UpdatedTime,self.PlantCode)


#PartItem Form
class PartItem(models.Model):
    Id = models.BigAutoField(primary_key=True)
    USN = models.CharField(max_length=50,null=True,blank=True)
    SN = models.CharField(max_length=50,unique=True)                         #唯一键
    OSN = models.CharField(max_length=50,null=True,blank=True)
    PN = models.CharField(max_length=20, null=False)                         #料号
    PartName = models.CharField(max_length=50, null=False)                   #料号名
    Spec = models.CharField(max_length=150, null=False)                      #品名
    UsedTimes = models.IntegerField(null=False)                              #使用次数
    CreatedTime = models.DateTimeField(auto_now_add=True,null=False)         #创建时间
    UpdatedTime = models.DateTimeField(auto_now=True,null=False)             #更新时间

    CheckCycle = models.IntegerField(null=False,default=0)                   #保养周期
    CheckCycleCount = models.IntegerField(null=False,default=0)              #保养次数
    NextCheckCount = models.IntegerField(null=False,default=0)               #下次保养次数
    NextCheckDate = models.DateTimeField(null=True,blank=True)               #下次保养时间
    ErrorCounts = models.IntegerField(null=False)                            #累积错误次数
    TrnDate = models.DateTimeField(null=False,default=datetime.now())
    NGRate = models.FloatField(null=True)                                    #产品率
    Maintainer = models.CharField(max_length=50, null=True)                  #保养人
    MaintainerId = models.IntegerField(null=True,blank=True)                 #保养人
    Asset = models.CharField(max_length=50,null=True,blank=True)             #采编
    CreatorId = models.IntegerField(null=True,blank=True)                    #添加此设备的人的Id
    LocationId = models.IntegerField(null=True,blank=True)                   #新增加的位置点
    UseStatus = models.CharField(max_length=30,null=False,default='normal')  #normal, repaired, scrapped, lost
    SubMaintainers =models.CharField(max_length=300,null=True)               #多个替补保养人，以逗号分隔
    SubMaintainerIds = models.CharField(max_length=300,null=True)            #多个替补保养人Id，以逗号分隔
    WarningBeforeDays = models.IntegerField(null=True)                       #设备保养周期要提前多少天提醒
    WarningBeforeTimes = models.IntegerField(null=True)                      #设备保养次数要提前多少次提醒
    PlantCode = models.CharField(max_length=20,null=True,blank=True)         #厂别
    class Meta:
        db_table = 'PartItem'

    def __str__(self):
        return 'Id%s:USN(%s),SN(%s),OSN(%s),PN(%s),PartName(%s),Spec(%s),UsedTimes(%s),CheckCycle(%s),' \
               'CheckCycleCount(%s),NextCheckCount(%s),NextCheckDate(%s),ErrorCounts(%s),CreatorId(%s)' \
               ',SubMaintainers(%s),SubMaintainerIds(%s),WarningBeforeDays(%s),WarningBeforeTimes(%s),PlantCode(%s)' % \
               (self.Id,self.USN,self.SN,self.OSN,self.PN,self.PartName,self.Spec,self.UsedTimes,self.CheckCycle,
                self.CheckCycleCount,self.NextCheckCount,self.NextCheckDate,self.ErrorCounts,self.CreatorId
                ,self.SubMaintainers,self.SubMaintainerIds,self.WarningBeforeDays,self.WarningBeforeTimes,self.PlantCode)


#Maintenance Form
class MaintenanceLog(models.Model):
    Id = models.BigAutoField(primary_key=True)
    PartItemId = models.IntegerField(null=False,default=73)             #设备USN
    PartName = models.CharField(max_length=50, null=False)               #料号名
    UpdatedTime = models.DateTimeField(auto_now=True,null=False)         #更新时间
    Status = models.CharField(max_length=10, null=False)                 #状态NG or Pass
    Content = models.CharField(max_length=300, null=False)               #保养内容
    OperatorId = models.IntegerField(null=False)                         #操作员
    CheckDueDate = models.DateTimeField(null=True)                       #既定检查日期
    CheckCount = models.IntegerField(null=True)                          #既定检查次数
    UsedTimes = models.IntegerField(null=True)                           #已使用次数
    Remark = models.CharField(max_length=200,null=True)                  #备注
    MaintenanceDate = models.DateTimeField(max_length=50,null=True)      #保养时间
    class Meta:
        db_table = 'MaintenanceLog'

    def __str__(self):
        return 'Id%s:PartItemId(%s),PartName(%s),Status(%s),Content(%s),OperatorId(%s),CheckDueDate(%s),' \
               'CheckCount(%s),UsedTimes(%s),Remark(%s),MaintenanceDate(%s)'  % \
               (self.Id,self.PartItemId,self.PartName,self.Status,self.Content,self.OperatorId,self.CheckDueDate,
                self.CheckCount,self.UsedTimes,self.Remark,self.MaintenanceDate)



#Configuration Form model
class Configuration(models.Model):
    Id = models.BigAutoField(primary_key=True)
    Type = models.CharField(max_length=10, null=False)                   #设定类型
    Max = models.FloatField(null=False)                                  #设定区间最大值
    Min = models.FloatField(null=False)                                  #设定区间最小值
    Reminders = models.TextField(null=False)                             #设定邮件提醒人员名单
    class Meta:
        db_table = 'Configuration'

    def __str__(self):
        return 'Id%s:Type(%s),Min(%s),Max(%s),Reminders(%s)' %(self.Id,self.Type,self.Min,self.Max,self.Reminders)



class LocationLog(models.Model):
    Id = models.BigAutoField(primary_key=True)
    Location = models.CharField(max_length=50,null=False)
    IsActivated = models.BooleanField(default=True,null=False)        #0:inactivated;1:activated(default)
    UpdatedTime = models.DateTimeField(auto_now=True, null=False)  # 更新时间
    CreatedTime = models.DateTimeField(auto_now_add=True, null=False)  # 创建时间
    class Meta:
        db_table = 'LocationLog'

    def __str__(self):
        return 'Id%s:Location(%s),IsActivated(%s),UpdatedTime(%s)' %(self.Id,self.Location,self.IsActivated,self.UpdatedTime)


class Project(models.Model):
    Id = models.BigAutoField(primary_key=True)
    Name = models.CharField(max_length=50,null=False)               # project name
    Code = models.CharField(max_length=50,null=True)                # project code
    IsActivated = models.BooleanField(default=True,null=False)      # 0:inactivated;1:activated(default)
    UpdatedTime = models.DateTimeField(auto_now=True, null=False)   # 更新时间
    class Meta:
        db_table = 'Project'

    def __str__(self):
        return 'Id%s:Name(%s),Code(%s),IsActivated(%s),UpdatedTime(%s)' %(self.Id,self.Name,self.Code,self.IsActivated,self.UpdatedTime)

class AccountTitle(models.Model):
    Id = models.BigAutoField(primary_key=True)
    Type = models.CharField(max_length=100,null=False)                # 会计科目
    Rule = models.CharField(max_length=100,null=False)               # 计算公式模型 存number值
    Remark = models.CharField(max_length=200,null=True,blank=True)   # 备注
    IsActivated = models.BooleanField(default=True,null=False)       # 0:inactivated;1:activated(default)
    UpdatedTime = models.DateTimeField(auto_now=True, null=False)    # 更新时间

    class Meta:
        db_table = 'AccountTitle'

    def __str__(self):
        return 'Id%s:Type(%s),Rule(%s),IsActivated(%s),UpdatedTime(%s)' %(self.Id,self.Type,self.Rule,self.IsActivated,self.UpdatedTime)

"""汇率表的建立function"""
class ExchangeRate(models.Model):
    Id = models.BigAutoField(primary_key=True)
    CreatorId = models.IntegerField(null=False)                      # User Id 用户的Id
    CurrencyFrom = models.CharField(max_length=100,null=False)       # 原始币种
    CurrencyTo = models.CharField(max_length=20,null=False)          # 目标货币
    ExchangeRate = models.FloatField(null=False)                     # 汇率
    IsActivated = models.BooleanField(default=True,null=False)       # 0:inactivated;1:activated(default)
    UpdatedTime = models.DateTimeField(auto_now=True, null=False)    # 更新时间

    class Meta:
        db_table = 'ExchangeRate'

    def __str__(self):
        return 'Id%s:CreatorId(%s),CurrencyFrom(%s),CurrencyTo(%s),IsActivated(%s),UpdatedTime(%s)' %(self.Id,self.CreatorId,self.CurrencyFrom,self.CurrencyTo,self.IsActivated,self.UpdatedTime)
""" feeGoal """
class FeeLimit(models.Model):
    Id = models.BigAutoField(primary_key=True)                       #创建id
    DepartmentId = models.IntegerField(null= False)                  #费用部门Id
    AccountTitleId = models.IntegerField(null= False)                #会计科目id
    LimitCost = models.FloatField(null= False,default=0)             #限制费用
    LimitPeriod = models.CharField(max_length=30,null=False)         #By月or by周 值为monthy weekly year 目前都是monthly
    CreatorId = models.IntegerField(null=False)                      #创建用户的id
    IsActivated = models.BooleanField(default=True,null=False)       #确认是否处于使用状态中
    UpdatedTime = models.DateTimeField(auto_now=True, null=False)     #数据的创建时间记录

    class Meta:
        db_table = 'FeeLimit'

    def __str__(self):
        return 'Id%s:DepartmentId(%s),AccountTitleId(%s),LimitCost(%s),LimitPeriod(%s),CreatorId(%s),IsActivated(%s),UpdatedTime(%s)'\
               %(self.Id,self.DepartmentId,self.AccountTitleId,self.LimitCost,self.LimitPeriod,self.CreatorId,self.IsActivated,self.UpdatedTime)











