from django.views.generic import ListView
from django.contrib.auth.decorators import user_passes_test
from django.utils.decorators import method_decorator
from django.db.models import Sum, Q
from django.http import HttpResponse
from openpyxl import Workbook
from orders.models import Order
from .models import FinanceRecord
from django.utils import timezone
from django.shortcuts import get_object_or_404, redirect
from django.contrib import messages
from django.views.generic import DetailView

def finance_permission_check(user):
    return user.is_staff or (hasattr(user, 'is_vip') and user.is_vip)

class FinanceListView(ListView):
    model = FinanceRecord
    template_name = 'finance_list.html'
    context_object_name = 'records'
    paginate_by = 20

    def dispatch(self, request, *args, **kwargs):
        if not finance_permission_check(request.user):
            return self.handle_no_permission()
        return super().dispatch(request, *args, **kwargs)

    def handle_no_permission(self):
        from django.http import HttpResponseForbidden
        from django.template import loader
        template = loader.get_template('finance_list.html')
        context = {
            'no_permission': True,
            'user': self.request.user
        }
        return HttpResponseForbidden(template.render(context, self.request))

    def get_queryset(self):
        # 确保所有订单都有对应的财务记录
        orders_without_record = Order.objects.filter(user=self.request.user).exclude(
            id__in=FinanceRecord.objects.values('order_id')
        )
        for order in orders_without_record:
            FinanceRecord.objects.create(order=order)
        
        # 继续原有筛选逻辑，但只查询当前用户的订单
        qs = super().get_queryset().filter(order__user=self.request.user)
        time_filter = self.request.GET.get('time_filter')
        verified_filter = self.request.GET.get('verified_filter')
        
        if time_filter == 'today':
            today = timezone.now().date().strftime('%Y-%m-%d')
            qs = qs.filter(order__date=today)
        elif time_filter == 'week':
            start_date = (timezone.now() - timezone.timedelta(days=7)).date().strftime('%Y-%m-%d')
            qs = qs.filter(order__date__gte=start_date)
        elif time_filter == 'month':
            start_date = (timezone.now() - timezone.timedelta(days=30)).date().strftime('%Y-%m-%d')
            qs = qs.filter(order__date__gte=start_date)
            
        if verified_filter == 'verified':
            qs = qs.filter(is_verified=True)
        elif verified_filter == 'unverified':
            qs = qs.filter(is_verified=False)
            
        return qs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        qs = self.get_queryset()
        
        # 统计信息
        total = qs.aggregate(total=Sum('order__total_freight'))['total'] or 0
        verified = qs.filter(is_verified=True).aggregate(verified=Sum('order__total_freight'))['verified'] or 0
        
        context.update({
            'total_freight': total,
            'verified_amount': verified,
            'unverified_amount': total - verified,
            'time_filter': self.request.GET.get('time_filter', ''),
            'verified_filter': self.request.GET.get('verified_filter', ''),
            'page_obj': context.get('page_obj'),  # 确保传递分页对象
        })
        return context

class ExportExcelView(FinanceListView):
    def get(self, request, *args, **kwargs):
        response = HttpResponse(content_type='application/ms-excel')
        response['Content-Disposition'] = 'attachment; filename="核销记录.xlsx"'
        
        wb = Workbook()
        ws = wb.active
        ws.title = "财务记录"
        
        # 添加表头
        headers = ["运单号", "总运费", "是否核销", "核销日期", "发货方", "收货方"]
        ws.append(headers)
        
        # 添加数据，使用get_queryset确保只导出当前用户的数据
        for record in self.get_queryset():
            ws.append([
                record.order.order_number,
                record.order.total_freight,
                "已核销" if record.is_verified else "未核销",
                record.verify_date or "",
                record.order.sender,
                record.order.receiver
            ])
        
        wb.save(response)
        return response


def verify_order(request, record_id):
    if not request.user.has_perm('finance.change_financerecord'):
        messages.error(request, '您没有权限执行此操作', extra_tags='finance')
        return redirect('finance_list')
    
    # 确保只能操作自己的订单
    record = get_object_or_404(FinanceRecord, id=record_id, order__user=request.user)
    
    record.is_verified = not record.is_verified
    record.verify_date = timezone.now().date() if record.is_verified else None
    record.save()
    
    messages.success(
        request, 
        f'成功{"核销" if record.is_verified else "取消核销"}订单 {record.order.order_number}',
        extra_tags='finance'
    )
    return redirect('finance_list')


class FinanceOrderDetailView(DetailView):
    model = FinanceRecord
    template_name = 'finance_order_detail.html'
    context_object_name = 'record'
    
    def get_queryset(self):
        return super().get_queryset().filter(order__user=self.request.user)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['items'] = self.object.order.items.all()
        return context
