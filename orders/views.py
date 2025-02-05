# views.py
from django.contrib.auth.models import User

from .models import Order, Item
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import logging
from django.shortcuts import get_object_or_404, redirect
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm

# 配置日志记录
logger = logging.getLogger(__name__)


@csrf_exempt
def create_order(request):
    if request.method == 'POST':
        try:
            # 打印接收到的表单数据
            logger.info(f"Received POST data: {request.POST}")

            # 解析表单数据
            order_data = {
                'order_number': request.POST.get('orderNo'),
                'sender': request.POST.get('senderName', ''),
                'sender_phone': request.POST.get('senderPhone', ''),
                'sender_address': request.POST.get('senderAddress', ''),
                'receiver': request.POST.get('receiverName', ''),
                'receiver_phone': request.POST.get('receiverPhone', ''),
                'receiver_address': request.POST.get('receiverAddress', ''),
                'total_freight': request.POST.get('totalFee', 0),
                'payment_method': request.POST.get('paymentMethod', ''),
                'other_expenses': request.POST.get('otherExpenses', 0),
                'expense_details': request.POST.get('feeDescription', ''),
                'carrier': request.POST.get('carrier', ''),
                'carrier_net': request.POST.get('carrierBranch', ''),
                'departure_station_phone': request.POST.get('departureStationPhone', None),  # 新增字段
                'arrival_station_phone': request.POST.get('arrivalStationPhone', ''),  # 新增字段
                'customer_order_no': request.POST.get('customerOrderNo', ''),  # 新增字段
                'delivery_charge': request.POST.get('deliveryCharge', 0),  # 新增字段
                'insurance_fee': request.POST.get('insuranceFee', 0),  # 新增字段
                'packaging_fee': request.POST.get('packagingFee', 0),  # 新增字段
                'goods_value': request.POST.get('goodsValue', 0),  # 新增字段
                'date': request.POST.get('date'),  # 新增字段
                'departure_station': request.POST.get('departureStation'),  # 新增字段
                'arrival_station': request.POST.get('arrivalStation'),  # 新增字段
                'transport_method': request.POST.get('transportMethod'),  # 新增字段
                'delivery_method': request.POST.get('deliveryMethod'),  # 新增字段
                'sender_sign': request.POST.get('senderSign'),  # 新增字段
                'receiver_sign': request.POST.get('receiverSign'),  # 新增字段
                'id_card': request.POST.get('idCard'),  # 新增字段
                'order_maker': request.POST.get('orderMaker')  # 新增字段
            }

            # 确保所有必需字段都有值
            required_fields = ['order_number', 'sender', 'sender_phone', 'sender_address', 'receiver', 'receiver_phone',
                               'receiver_address']
            for field in required_fields:
                if not order_data[field]:
                    return JsonResponse({'status': 'error', 'message': f'Missing required field: {field}'}, status=400)

            # 创建Order实例
            order = Order.objects.create(**{k: v for k, v in order_data.items() if v is not None})

            # 处理商品数据
            items = []
            i = 0
            while True:
                try:
                    item_key = f'items[{i}][productName]'
                    if item_key not in request.POST:  # 检查是否存在该键
                        break
                    item_data = {
                        'order_id': order.id,
                        'item_name': request.POST[f'items[{i}][productName]'],
                        'package_type': request.POST[f'items[{i}][packageType]'],
                        'quantity': int(request.POST[f'items[{i}][quantity]']),
                        'weight': float(request.POST[f'items[{i}][weight]']),
                        'volume': float(request.POST[f'items[{i}][volume]']),
                        'freight': float(request.POST[f'items[{i}][freight]'])
                    }
                    items.append(Item.objects.create(**item_data))
                    i += 1
                except (KeyError, ValueError) as e:
                    return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
                except IndexError:
                    break

                # 返回包含 orderId 的 JSON 响应
                return JsonResponse({
                    'status': 'success',
                    'message': 'Order created successfully',
                    'orderId': order.id  # 添加 orderId 到响应中
                })

            return JsonResponse({'status': 'success'})
        except Exception as e:
            logger.error(f"Unexpected error creating order: {str(e)}", exc_info=True)
            return JsonResponse(
                {'status': 'error', 'message': f' {str(e)},An unexpected error occurred. Please try again later.'},
                status=500)


def index(request):
    return render(request, 'index.html')


def custom_login_required(view_func):
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('login')
        return view_func(request, *args, **kwargs)

    return wrapper



@custom_login_required
@login_required
def orders(request):
    return render(request, 'order.html')


@custom_login_required
@login_required
def order_history(request):
    orders = Order.objects.all().prefetch_related('items')
    return render(request, 'order_history.html', {'orders': orders})


def get_order_detail(request, order_id):
    try:
        order = Order.objects.prefetch_related('items').get(id=order_id)
        data = {
            'order_number': order.order_number,
            'sender': order.sender,
            'receiver': order.receiver,
            'sender_phone': order.sender_phone,
            'receiver_phone': order.receiver_phone,
            'total_freight': float(order.total_freight),
            'payment_method': order.payment_method,
            'carrier': order.carrier,
            'items': [
                {
                    'item_name': item.item_name,
                    'package_type': item.package_type,
                    'quantity': item.quantity,
                    'weight': float(item.weight),
                    'volume': float(item.volume),
                    'freight': float(item.freight)
                } for item in order.items.all()
            ]
        }
        return JsonResponse({'status': 'success', 'data': data})
    except Order.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': '订单不存在'})


def edit_order(request, order_id):
    order = get_object_or_404(Order.objects.prefetch_related('items'), id=order_id)

    if request.method == 'POST':
        # 更新订单基本信息
        order.sender = request.POST.get('senderName')
        order.receiver = request.POST.get('receiverName')
        # 更新其他字段（按实际字段补充）
        order.save()

        # 更新商品项
        order.items.all().delete()  # 删除旧商品项
        index = 0
        while True:
            product_name = request.POST.get(f'items[{index}][productName]')
            if not product_name:
                break
            Item.objects.create(
                order=order,
                item_name=product_name,
                package_type=request.POST.get(f'items[{index}][packageType]'),
                quantity=request.POST.get(f'items[{index}][quantity]'),
                weight=request.POST.get(f'items[{index}][weight]'),
                volume=request.POST.get(f'items[{index}][volume]'),
                freight=request.POST.get(f'items[{index}][freight]'),
            )
            index += 1
        return redirect('order_history')

    return render(request, 'edit_order.html', {'order': order})


def delete_order(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    order.delete()
    return JsonResponse({'status': 'success'})


def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('/')
        else:
            messages.error(request, '用户名或密码错误，请重试。')
    return render(request, 'login.html')


def register_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password1 = request.POST['password1']
        password2 = request.POST['password2']

        if password1 != password2:
            messages.error(request, '两次输入的密码不一致，请重试。')
        else:
            user = User.objects.create_user(username=username, password=password1)
            login(request, user)  # 自动登录新用户
            messages.success(request, '注册成功！')
            return redirect('/')
    return render(request, 'register.html')


def logout_view(request):
    logout(request)
    return redirect('/')