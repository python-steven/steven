from django.contrib import admin

# Register your models here.
from .models import User,Customer,Department,BudgetCodeForm,PartItemResult,PartItem,MaintenanceLog,Configuration,LocationLog,Project,AccountTitle,ExchangeRate,FeeLimit

class UserAdmin(admin.ModelAdmin):
    list_display = ('Id','EmployeeId','Name','DepartmentId','Password','Email','Role','IsActivated','CreatedTime','UpdatedTime')
    search_fields = ('Name',)
    ordering = ('Name',)


class CustomerAdmin(admin.ModelAdmin):
    list_display = ('Id','Customer','IsActivated','UpdatedTime')
    search_fields = ('Customer',)
    ordering = ('Customer',)


class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('Id','Department','IsActivated','UpdatedTime')
    search_fields = ('Department',)
    ordering = ('Department',)


class BudgetCodeFormAdmin(admin.ModelAdmin):
    list_display = ('Id','DepartmentId','Department','Remark','Attachment','BillingType','BudgetCode','ApplyDate'
                    ,'ExternalNumberType','ExternalNumber','ExternalNumberEffectiveDate','PicId','Pic','ProductName'
                    ,'Model', 'PurchaseType', 'UnitPrice', 'Quantity', 'Unit','Currency','CustomerId','Customer'
                    ,'TypeOfMachine', 'ProjectCode', 'ApplyReason', 'SignerId', 'Signer', 'Status', 'CreatedTime'
                    , 'UpdatedTime','OwnerId','MergeId','SignRemarks','AttachmentPath','FormId','PN','ProjectId'
                    ,'AccountTitleId','requiredPICId','equipmentToFactoryDate','poNumber','toFactoryDate','traceRemark'
                    )
    search_fields = ('ExternalNumber',)
    ordering = ('Id',)


class PartItemResultAdmin(admin.ModelAdmin):
    list_display = ('Id','USN','SN','OSN','Asset','PN','PartName','Spec','UsedTimes','Stage','FixtureId','Result'
                    ,'ErrorCode','TrnDate','UpdatedTime','PlantCode')
    search_fields = ('PartName',)
    ordering = ('Id',)


class PartItemAdmin(admin.ModelAdmin):
    list_display = ('Id','USN','SN','OSN','PN','PartName','Spec','UsedTimes','CreatedTime','UpdatedTime','CheckCycle'
                    ,'CheckCycleCount','NextCheckCount','NextCheckDate','ErrorCounts','TrnDate','NGRate','MaintainerId'
                    ,'Maintainer','Asset','CreatorId','LocationId','UseStatus','SubMaintainers','SubMaintainerIds','WarningBeforeDays','WarningBeforeTimes','PlantCode')
    search_fields = ('PartName',)
    ordering = ('Id',)


class MaintenanceLogAdmin(admin.ModelAdmin):
    list_display = ('Id','PartItemId','PartName','UpdatedTime','Status','Content','OperatorId','CheckDueDate'
                    ,'CheckCount','UsedTimes','Remark','MaintenanceDate')
    search_fields = ('PartName',)
    ordering = ('Id',)

class ConfigurationAdmin(admin.ModelAdmin):
    list_display = ('Id','Type','Max','Min','Reminders')
    search_fields = ('Type',)
    ordering = ('Id',)

class LocationLogAdmin(admin.ModelAdmin):
    list_display = ('Id','Location','IsActivated','UpdatedTime')
    search_fields = ('Location',)
    ordering = ('Id',)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('Id','Name','Code','IsActivated','UpdatedTime')
    search_fields = ('Name',)
    ordering = ('Id',)
class AccountTitleAdmin(admin.ModelAdmin):
    list_display = ('Id','Type','Rule','IsActivated','UpdatedTime')
    search_fields = ('Type',)
    ordering = ('Id',)
class ExchangeRateAdmin(admin.ModelAdmin):
    list_display = ('Id','CurrencyFrom','CurrencyTo','ExchangeRate','IsActivated','UpdatedTime','CreatorId')
    search_fields = ('CurrencyFrom',)
    ordering = ('Id',)
class FeeLimitAdmin(admin.ModelAdmin):
    list_display = ('Id','DepartmentId','AccountTitleId','LimitCost','LimitPeriod','CreatorId','IsActivated','UpdatedTime')
    search_fields = ('DepartmentId',)
    ordering = ('Id',)

admin.site.register(User,UserAdmin)
admin.site.register(Customer,CustomerAdmin)
admin.site.register(Department,DepartmentAdmin)
admin.site.register(BudgetCodeForm,BudgetCodeFormAdmin)
admin.site.register(PartItemResult,PartItemResultAdmin)
admin.site.register(PartItem,PartItemAdmin)
admin.site.register(MaintenanceLog,MaintenanceLogAdmin)
admin.site.register(Configuration,ConfigurationAdmin)
admin.site.register(LocationLog,LocationLogAdmin)
admin.site.register(Project,ProjectAdmin)
admin.site.register(AccountTitle,AccountTitleAdmin)
admin.site.register(ExchangeRate,ExchangeRateAdmin)
admin.site.register(FeeLimit,FeeLimitAdmin)
