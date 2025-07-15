from django import forms
from .models import CustomerOrder
from django.core.validators import RegexValidator, MinValueValidator

class CustomerOrderForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # 为所有必填字段添加required类
        for field in self.fields.values():
            if field.required:
                field.widget.attrs['class'] = field.widget.attrs.get('class', '') + ' required'

    receiver_phone = forms.CharField(
        label='收货人电话',
        validators=[RegexValidator(r'^1[3-9]\d{9}$', '请输入有效的手机号码')],
        widget=forms.TextInput(attrs={
            'pattern': '^1[3-9]\\d{9}$',
            'class': 'form-control',
            'placeholder': '请输入11位手机号码'
        })
    )
    
    class Meta:
        model = CustomerOrder
        exclude = ['order_number', 'order_date', 'status']
        widgets = {
            'departure': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '请输入出发地'
            }),
            'destination': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '请输入到达地'
            }),
            'shipper_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '请输入发货人姓名'
            }),
            'shipper_phone': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '请输入11位手机号码',
                'pattern': '^1[3-9]\\d{9}$'
            }),
            'receiver_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '请输入收货人姓名'
            }),
            'goods_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '请输入商品名称'
            }),
            'package_type': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '请输入包装类型'
            }),
            'quantity': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '1',
                'placeholder': '请输入件数'
            }),
            'weight': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '0.1',
                'step': '0.01',
                'placeholder': '请输入重量(kg)'
            }),
            'volume': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '0.1',
                'step': '0.01',
                'placeholder': '请输入体积(m³)'
            }),
            'delivery_method': forms.Select(attrs={
                'class': 'form-select'
            }, choices=[
                ('', '请选择交货方式'),
                ('self', '自提'),
                ('delivery', '送货上门')
            ]),
            'transport_type': forms.Select(attrs={
                'class': 'form-select'
            }, choices=CustomerOrder.TRANSPORT_TYPES),
            'payment_method': forms.Select(attrs={
                'class': 'form-select'
            }, choices=CustomerOrder.PAYMENT_METHODS),
            'shipper_address': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 2,
                'placeholder': '请输入详细发货地址'
            }),
            'receiver_address': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 2,
                'placeholder': '请输入详细收货地址'
            }),
            'receipt_requirements': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 2,
                'placeholder': '请输入回单要求(可选)'
            }),
            'remarks': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': '请输入备注信息(可选)'
            })
        }