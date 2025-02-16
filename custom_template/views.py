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


def template_editor(request):
    fields = [
        'date', 'departure_station', 'arrival_station', 'order_no', 'sender_name', 'receiver_name',
        'sender_phone', 'receiver_phone', 'sender_address', 'receiver_address', 'items[0].product_name',
        'items[0].package_type', 'items[0].quantity', 'items[0].weight', 'items[0].volume',
        'items[0].delivery_charge', 'items[0].insurance_fee','items[0].packaging_fee', 'items[0].goods_value',
        'items[0].freight', 'items[0].remarks', 'total_fee', 'return_requirement',
        'customer_order_no', 'sender_sign', 'receiver_sign', 'id_card', 'order_maker',
        'departure_station_phone', 'carrier_address', 'arrival_station_phone', 'arrival_address'
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

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=landscape((24 * cm, 13.97 * cm)))

    # 替换占位符
    content = template.content
    for field in order._meta.fields:
        placeholder = f"{{{{ {field.name} }}}}"
        value = getattr(order, field.name)
        content = content.replace(placeholder, str(value))

    # 绘制字段
    for field_name, position in template.field_positions.items():
        x = position['x']
        y = position['y']
        width = position['width']
        height = position['height']

        # 获取字段值
        value = getattr(order, field_name, '')

        # 绘制字段背景框
        pdf.rect(x, y, width, height, stroke=1, fill=0)

        # 绘制字段文本
        pdf.drawString(x + 5, y + height - 5, str(value))

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
