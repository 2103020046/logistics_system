from django.db import models


class Order(models.Model):
    # 订单基本信息
    order_number = models.CharField(max_length=50, unique=True, verbose_name='运单号', default='123456789')
    sender = models.CharField(max_length=100, verbose_name='发货方', default='Default Carrier')
    sender_phone = models.CharField(max_length=20, verbose_name='手机号', default='000-000-0000')
    sender_address = models.TextField(verbose_name='详细地址', default='Default Carrier')

    receiver = models.CharField(max_length=100, verbose_name='收货方', default='Default Carrier')
    receiver_phone = models.CharField(max_length=20, verbose_name='手机号', default='000-000-0000')
    receiver_address = models.TextField(verbose_name='详细地址', default='Default Carrier')

    # 其他信息
    total_freight = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='总运费', default='12')
    payment_method = models.CharField(max_length=50, verbose_name='付款方式', default='Default Carrier')
    other_expenses = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='其他支出', default='12')
    expense_details = models.TextField(blank=True, null=True, verbose_name='费用说明', default='Default Carrier')
    carrier = models.CharField(max_length=100, verbose_name='承运商', default='Default Carrier')
    carrier_net = models.CharField(max_length=100, verbose_name='承运网点', default='Default Carrier_net')
    departure_station_phone = models.CharField(max_length=20, verbose_name='发站电话', blank=True, null=True)
    arrival_station_phone = models.CharField(max_length=20, verbose_name='到站电话', default='000-000-0000')
    transfer_fee = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='中转费', default='111')

    def __str__(self):
        return self.order_number


class Item(models.Model):
    # 关联到订单
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)

    # 物品信息
    item_name = models.CharField(max_length=100, verbose_name='品名')
    package_type = models.CharField(max_length=50, verbose_name='包装')
    quantity = models.IntegerField(verbose_name='件数')
    weight = models.DecimalField(max_digits=6, decimal_places=2, verbose_name='重量(kg)')
    volume = models.DecimalField(max_digits=6, decimal_places=2, verbose_name='体积(m³)')
    freight = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='运费(元)')

    def __str__(self):
        return f'{self.item_name} ({self.quantity} 件)'


if __name__ == "__main__":
    # 当脚本被直接运行时执行这里的代码
    print("This script is being run directly.")
else:
    # 当脚本被作为模块导入时执行这里的代码
    print(f"This script is imported by another module, and its name is {__name__}.")