# forms.py
from django import forms
from .models import Order, Item


class OrderForm(forms.ModelForm):
    class Meta:
        model = Order
        fields = '__all__'
    
    def clean_order_number(self):
        order_number = self.cleaned_data['order_number']
        user = self.instance.user if self.instance else self.initial.get('user')
        
        if not user:
            raise forms.ValidationError("无法确定用户信息")
            
        # 检查当前用户下订单号是否唯一
        qs = Order.objects.filter(user=user, order_number=order_number)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
            
        if qs.exists():
            raise forms.ValidationError("该订单号已被当前用户使用")
            
        return order_number


ItemFormSet = forms.inlineformset_factory(Order, Item, fields=('item_name', 'package_type', 'quantity', 'weight',
                                                               'volume', 'delivery_charge', 'insurance_fee',
                                                               'packaging_fee', 'goods_value', 'freight', 'remarks'),
                                          extra=1)
