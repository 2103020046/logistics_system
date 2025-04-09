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
    # 在fields列表中添加以下字段
    fields = [
        '托运公司名称', '日期', '发站', '到站', '查询单号', '发货人', '收货人',
        '发货人电话', '收货人电话', '发货人地址', '收货人地址', '品名',
        '包装', '件数', '重量', '体积',
        '送货费', '保险费', '包装费', '货物价值',
        '运费', '备注', '合计费用', '付款方式', '交货方式', '回单要求',
        '客户单号', '发货人签名', '收货人签名', '身份证号', '制单人',
        '发站电话', '发站地址', '到站电话', '到站地址', '万', '仟', '佰', '拾', '个'
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
    # 在generate_pdf函数的field_mapping中添加
    field_mapping = {
        # ...原有映射...
        '万': 'fee_wan',
        '仟': 'fee_qian',
        '佰': 'fee_bai',
        '拾': 'fee_shi',
        '个': 'fee_ge'
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
