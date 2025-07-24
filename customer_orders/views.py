import time
from django.shortcuts import render, redirect
from django.contrib import messages
from django.db.models import Count
from datetime import datetime
from .forms import CustomerOrderForm
from .models import CustomerOrder
from django.core.paginator import Paginator
from django.shortcuts import get_object_or_404

def customer_order_create(request):
    if request.method == 'POST':
        form = CustomerOrderForm(request.POST)
        if form.is_valid():
            try:
                instance = form.save(commit=False)
                
                # 生成订单号：年月日 + 当天第几单
                today = datetime.now().date()
                today_orders_count = CustomerOrder.objects.filter(
                    order_date__date=today
                ).count() + 1
                
                instance.order_number = f"{today.strftime('%Y%m%d')}{today_orders_count:04d}"
                instance.status = '待处理'
                instance.save()
                
                messages.success(
                    request, 
                    f'订单提交成功！您的订单号为: {instance.order_number}',
                    extra_tags='customer_order'  # 添加标记
                )
                return redirect('customer_order_create')
            except Exception as e:
                messages.error(
                    request, 
                    f'订单提交失败: {str(e)}',
                    extra_tags='customer_order'  # 添加标记
                )
        else:
            messages.error(request, '请检查表单中的错误')
    else:
        form = CustomerOrderForm()
    
    return render(request, 'customer_orders/create.html', {
        'form': form,
        'messages': messages.get_messages(request)
    })

def customer_order_records(request):
    search_query = request.GET.get('q', '')
    page_number = request.GET.get('page', 1)
    
    orders = CustomerOrder.objects.filter(
        order_number__icontains=search_query
    ).order_by('-order_date')
    
    paginator = Paginator(orders, 15)
    page_obj = paginator.get_page(page_number)
    
    return render(request, 'customer_orders/records.html', {
        'orders': page_obj,
        'search_query': search_query
    })


def order_detail(request, order_id):
    order = get_object_or_404(CustomerOrder, pk=order_id)
    return render(request, 'customer_orders/detail.html', {'order': order})

def order_delete(request, order_id):
    if request.method == 'POST':
        order = get_object_or_404(CustomerOrder, pk=order_id)
        try:
            order.delete()
            messages.success(request, '订单删除成功')
        except Exception as e:
            messages.error(request, f'删除失败: {str(e)}')
        return redirect('customer_order_records')
