from django.db import models
from django.core.validators import RegexValidator

class CustomerOrder(models.Model):
    TRANSPORT_TYPES = [('fast', '快运'), ('normal', '普通运输')]
    PAYMENT_METHODS = [('prepay', '提付'), ('collect', '到付')]
    
    order_number = models.CharField('订单编号', max_length=20, unique=True)
    departure = models.CharField('出发地', max_length=100)
    destination = models.CharField('到达地', max_length=100)
    
    # 发货人信息
    shipper_name = models.CharField('发货人姓名', max_length=50)
    shipper_phone = models.CharField('联系电话', max_length=11, validators=[
        RegexValidator(r'^1[3-9]\d{9}$', '请输入有效的手机号码')])
    shipper_address = models.TextField('详细地址')
    
    # 收货人信息
    receiver_name = models.CharField('收货人姓名', max_length=50)
    receiver_phone = models.CharField('联系电话', max_length=11)
    receiver_address = models.TextField('详细地址')
    
    # 商品信息
    goods_name = models.CharField('商品名称', max_length=100)
    package_type = models.CharField('包装类型', max_length=50)
    quantity = models.PositiveIntegerField('件数')
    weight = models.DecimalField('重量(kg)', max_digits=10, decimal_places=2)
    volume = models.DecimalField('体积(m³)', max_digits=10, decimal_places=2)
    
    # 运输信息
    delivery_method = models.CharField('交货方式', max_length=20)
    transport_type = models.CharField('运输要求', max_length=20, choices=TRANSPORT_TYPES)
    payment_method = models.CharField('付款方式', max_length=20, choices=PAYMENT_METHODS)
    receipt_requirements = models.TextField('回单要求', blank=True)
    remarks = models.TextField('备注', blank=True)
    
    order_date = models.DateTimeField('下单时间', auto_now_add=True)
    status = models.CharField('订单状态', max_length=20, default='待处理')
    
    def __str__(self):
        return f"{self.order_number} - {self.shipper_name}"

    class Meta:
        verbose_name = '客户下单'
        verbose_name_plural = '客户下单'
