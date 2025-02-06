# forms.py
from django import forms
from .models import Order, Item


class OrderForm(forms.ModelForm):
    class Meta:
        model = Order
        fields = ['order_number', 'sender', 'sender_phone', 'sender_address', 'product_code', 'receiver',
                  'receiver_phone',
                  'receiver_address', 'total_freight', 'payment_method', 'return_requirement', 'other_expenses',
                  'expense_details', 'carrier', 'carrier_address', 'arrival_address', 'departure_station_phone',
                  'arrival_station_phone', 'customer_order_no', 'date', 'departure_station', 'arrival_station',
                  'transport_method', 'delivery_method', 'sender_sign', 'receiver_sign', 'id_card', 'order_maker']


ItemFormSet = forms.inlineformset_factory(Order, Item, fields=('item_name', 'package_type', 'quantity', 'weight',
                                                               'volume', 'delivery_charge', 'insurance_fee',
                                                               'packaging_fee', 'goods_value', 'freight', 'remarks'),
                                          extra=1)
