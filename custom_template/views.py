from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from reportlab.lib.units import cm

from orders.models import Order
from .models import CustomTemplate
from django.http import FileResponse, HttpResponseRedirect, JsonResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import landscape
from io import BytesIO
import json
from django.contrib.auth.decorators import login_required


def custom_login_required(view_func):
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('login')
        return view_func(request, *args, **kwargs)

    return wrapper

@custom_login_required
@login_required
def template_editor(request):
    fields = [
        '托运公司名称', '日期', '发站', '到站', '查询单号', '发货人', '收货人',
        '发货人电话', '收货人电话', '发货人地址', '收货人地址', '品名',
        '包装', '件数', '重量', '体积',
        '送货费', '保险费', '包装费', '货物价值',
        '运费', '备注', '合计费用', '回单要求',
        '客户单号', '发货人签名', '收货人签名', '身份证号', '制单人',
        '发站电话', '发站地址', '到站电话', '到站地址'
    ]

    template_id = request.GET.get('template_id')
    if template_id:
        template = get_object_or_404(CustomTemplate, id=template_id)
    else:
        template = None

    if request.method == 'POST':
        name = request.POST.get('template_name')
        content = request.POST.get('template_content')
        field_positions_str = request.POST.get('field_positions')  # 获取字段位置信息
        field_positions = json.loads(field_positions_str) if field_positions_str else {}

        if not content:
            # 如果 content 为空，返回错误信息
            return JsonResponse(
                {'status': 'error', 'message': 'The template content cannot be empty'},
                status=500)

        if template:
            template.name = name
            template.content = content
            template.field_positions = field_positions
            template.save()
        else:
            CustomTemplate.objects.create(name=name, content=content, field_positions=field_positions)

        return redirect('custom_template:template_list')

    return render(
        request,
        'custom_template/editor.html',
        {'fields': fields, 'template': template}
    )


def template_list(request):
    """模板列表"""
    templates = CustomTemplate.objects.all()
    return render(request, 'custom_template/list.html', {'templates': templates})


def generate_pdf(request, template_id, order_id):
    """根据模板和订单数据生成 PDF"""
    template = CustomTemplate.objects.get(id=template_id)
    order = Order.objects.get(id=order_id)

    # 创建中英文字段映射
    field_mapping = {
        '托运公司名称': 'company_name',
        '日期': 'date',
        '发站': 'departure_station',
        '到站': 'arrival_station',
        '查询单号': 'order_no',
        '发货人': 'sender_name',
        '收货人': 'receiver_name',
        '发货人电话': 'sender_phone',
        '收货人电话': 'receiver_phone',
        '发货人地址': 'sender_address',
        '收货人地址': 'receiver_address',
        '品名': 'items[0].product_name',
        '包装': 'items[0].package_type',
        '件数': 'items[0].quantity',
        '重量': 'items[0].weight',
        '体积': 'items[0].volume',
        '送货费': 'items[0].delivery_charge',
        '保险费': 'items[0].insurance_fee',
        '包装费': 'items[0].packaging_fee',
        '货物价值': 'items[0].goods_value',
        '运费': 'items[0].freight',
        '备注': 'items[0].remarks',
        '合计费用': 'total_fee',
        '回单要求': 'return_requirement',
        '客户单号': 'customer_order_no',
        '发货人签名': 'sender_sign',
        '收货人签名': 'receiver_sign',
        '身份证号': 'id_card',
        '制单人': 'order_maker',
        '发站电话': 'departure_station_phone',
        '发站地址': 'carrier_address',
        '到站电话': 'arrival_station_phone',
        '到站地址': 'arrival_address'
    }

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=landscape((24 * cm, 13.97 * cm)))

    # 替换中文占位符
    content = template.content
    for cn_field, en_field in field_mapping.items():
        placeholder = f"{{{{ {cn_field} }}}}"
        
        # 处理嵌套字段 (如 items[0].product_name)
        if '.' in en_field:
            parts = en_field.split('.')
            if parts[0].startswith('items['):
                # 获取items的第一个元素的属性
                items = getattr(order, 'items').all()
                if items:
                    item = items[0]  # 获取第一个item
                    value = getattr(item, parts[1], '')
                else:
                    value = ''
            else:
                # 处理其他可能的嵌套属性
                value = order
                for part in parts:
                    value = getattr(value, part, '')
        else:
            # 处理普通字段
            value = getattr(order, en_field, '')
        
        # 确保value是字符串
        content = content.replace(placeholder, str(value) if value is not None else '')

    # 绘制字段
    for cn_field, position in template.field_positions.items():
        x = float(position['x'])
        y = float(position['y'])
        width = float(position['width'])
        height = float(position['height'])

        # 获取字段值
        en_field = field_mapping.get(cn_field)
        if en_field:
            if '.' in en_field:
                parts = en_field.split('.')
                if parts[0].startswith('items['):
                    items = getattr(order, 'items').all()
                    if items:
                        item = items[0]
                        value = getattr(item, parts[1], '')
                    else:
                        value = ''
                else:
                    value = order
                    for part in parts:
                        value = getattr(value, part, '')
            else:
                value = getattr(order, en_field, '')
        else:
            value = ''

        # 绘制字段文本
        pdf.drawString(x + 5, y + height - 5, str(value) if value is not None else '')

    pdf.save()
    buffer.seek(0)
    return FileResponse(buffer, as_attachment=True, filename='order.pdf')


def delete_template(request, template_id):
    template = get_object_or_404(CustomTemplate, id=template_id)
    template.delete()
    return HttpResponseRedirect(reverse('custom_template:template_list'))


def template_list_api(request):
    """返回模板列表"""
    templates = CustomTemplate.objects.all()
    template_data = [{
        "id": template.id,
        "name": template.name,
        "created_at": template.created_at.strftime('%Y-%m-%d %H:%M:%S')
    } for template in templates]
    return JsonResponse(template_data, safe=False)


def template_detail_api(request, template_id):
    """根据模板 ID 返回模板详情"""
    template = get_object_or_404(CustomTemplate, id=template_id)
    return JsonResponse({
        "id": template.id,
        "name": template.name,
        "content": template.content,
        "field_positions": template.field_positions,  # 返回字段位置信息
        "created_at": template.created_at.strftime('%Y-%m-%d %H:%M:%S')
    })
