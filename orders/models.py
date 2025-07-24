from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone


# 在Order模型中添加字段
class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='用户', default=1)  # 将订单与用户关联

    # 订单基本信息
    company_name = models.CharField(max_length=100, verbose_name='托运公司名称', blank=True, null=True)
    order_number = models.CharField(max_length=50, unique=True, verbose_name='运单号', default='123456789')
    sender = models.CharField(max_length=100, verbose_name='发货方', default='Default Carrier')
    sender_phone = models.CharField(max_length=20, verbose_name='发货方手机号', default='000-000-0000')
    sender_address = models.TextField(verbose_name='发货详细地址', default='Default Carrier')
    product_code = models.CharField(max_length=50, verbose_name='货号', blank=True, null=True)
    receiver = models.CharField(max_length=100, verbose_name='收货方', default='Default Carrier')
    receiver_phone = models.CharField(max_length=20, verbose_name='收货方手机号', default='000-000-0000')
    receiver_address = models.TextField(verbose_name='收货详细地址', default='Default Carrier')

    # 其他信息
    total_freight = models.IntegerField(verbose_name='总运费', default='12.00')
    payment_method = models.CharField(max_length=50, verbose_name='付款方式', default='Default Carrier')
    return_requirement = models.CharField(max_length=50, verbose_name='回单要求', default='Default returnRequirement')
    other_expenses = models.CharField(max_length=50, verbose_name='其他支出', default='12.00')
    expense_details = models.TextField(blank=True, null=True, verbose_name='费用说明', default='Default Carrier')
    carrier = models.CharField(max_length=100, verbose_name='承运商', default='Default Carrier')
    carrier_address = models.CharField(max_length=100, verbose_name='发站地址', default='Default Carrier_net')
    arrival_address = models.CharField(max_length=100, verbose_name='到站地址', default='Default Carrier_net')
    departure_station_phone = models.CharField(max_length=20, verbose_name='发站查询电话', blank=True, null=True)
    arrival_station_phone = models.CharField(max_length=20, verbose_name='到站查询电话', default='000-000-0000')
    customer_order_no = models.CharField(max_length=50, verbose_name='客户单号', default='')

    # 新增字段

    date = models.CharField(max_length=20,verbose_name='日期', blank=True, null=True)
    departure_station = models.CharField(max_length=100, verbose_name='发站', blank=True, null=True)
    arrival_station = models.CharField(max_length=100, verbose_name='到站', blank=True, null=True)
    transport_method = models.CharField(max_length=100, verbose_name='运输方式', blank=True, null=True)
    delivery_method = models.CharField(max_length=100, verbose_name='交货方式', blank=True, null=True)
    sender_sign = models.CharField(max_length=100, verbose_name='发货人签名', blank=True, null=True)
    receiver_sign = models.CharField(max_length=100, verbose_name='收货人签名', blank=True, null=True)
    id_card = models.CharField(max_length=20, verbose_name='身份证号', blank=True, null=True)
    order_maker = models.CharField(max_length=100, verbose_name='制单人', blank=True, null=True)
    fee_wan = models.CharField(max_length=10, verbose_name='万位金额', blank=True)
    fee_qian = models.CharField(max_length=10, verbose_name='仟位金额', blank=True)
    fee_bai = models.CharField(max_length=10, verbose_name='佰位金额', blank=True)
    fee_shi = models.CharField(max_length=10, verbose_name='拾位金额', blank=True)
    fee_ge = models.CharField(max_length=10, verbose_name='个位金额', blank=True)

    def __str__(self):
        return self.order_number

    class Meta:
        verbose_name = '新增订单'
        verbose_name_plural = '新增订单'

    def save(self, *args, **kwargs):
        if not self.order_number:  # 如果是新订单
            today = timezone.now().date()
            date_str = today.strftime('%Y%m%d')
            
            # 获取当前用户最新的订单序号
            last_order = Order.objects.filter(
                user=self.user,
                order_number__startswith=date_str
            ).order_by('-order_number').first()
            
            if last_order:
                # 提取序号并加1
                last_seq = int(last_order.order_number.split('-')[1])
                new_seq = last_seq + 1
            else:
                new_seq = 1
                
            self.order_number = f"{date_str}-{new_seq:02d}"
            
        super().save(*args, **kwargs)
    class Meta:
        verbose_name = '新增订单'
        verbose_name_plural = '新增订单'

class Item(models.Model):
    # 关联到订单
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)

    # 物品信息
    item_name = models.CharField(max_length=100, verbose_name='品名')
    package_type = models.CharField(max_length=50, verbose_name='包装')
    quantity = models.IntegerField(verbose_name='件数')
    weight = models.IntegerField(verbose_name='重量(kg)')
    volume = models.DecimalField(max_digits=6, decimal_places=2, verbose_name='体积(m³)')
    delivery_charge = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='送（提）货费')
    insurance_fee = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='保险费')
    packaging_fee = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='包装费')
    goods_value = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='货物价值')
    freight = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='运费(元)')
    remarks = models.CharField(max_length=50, verbose_name='备注', default="无")


    def __str__(self):
        return f'{self.item_name} ({self.quantity} 件)'

    class Meta:
        verbose_name = '商品信息'
        verbose_name_plural = '商品信息'
