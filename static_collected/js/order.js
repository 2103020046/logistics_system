function validateForm() {
    const inputs = document.querySelectorAll('input[required], select[required]');
    let isValid = true;
    inputs.forEach(input => {
        if (!input.value.trim()) {  // 使用 trim() 去除空格
            alert(`请填写${input.name}字段`);
            input.focus();  // 将焦点移动到未填写的输入框
            isValid = false;
            return false;  // 中断循环
        }
    });
    return isValid;
}

// 监听返回按钮
document.getElementById('backButton').addEventListener('click', function () {
    window.history.back();
});
document.getElementById('orderForm').addEventListener('submit', function (event) {
    event.preventDefault();
    
    
    // 验证表单
    if (!validateForm()) return;

    // 准备表单数据
    const formData = new FormData(event.target);
    // 获取公司名称
    const companyName = document.querySelector('.title-underline').value;
    if (!companyName) {
        alert('请填写公司名称');
        return;
    }
    formData.set('companyName', companyName);  // 确保公司名称包含在表单数据中

    // 提取商品信息
    const rows = document.querySelectorAll('#goodsTbody tr');
    rows.forEach((row, index) => {
        const cells = row.querySelectorAll('td');
        const productName = cells[0].querySelector('input').value;
        const packageType = cells[1].querySelector('input').value;
        const quantity = parseFloat(cells[2].querySelector('input').value) || 0;
        const weight = parseFloat(cells[3].querySelector('input').value) || 0;
        const volume = parseFloat(cells[4].querySelector('input').value) || 0;
        const freight = parseFloat(cells[5].querySelector('input').value) || 0;
        const remarks = cells[6].querySelector('input').value;

        formData.set(`items[${index}][productName]`, productName);
        formData.set(`items[${index}][packageType]`, packageType);
        formData.set(`items[${index}][quantity]`, quantity);
        formData.set(`items[${index}][weight]`, weight);
        formData.set(`items[${index}][volume]`, volume);
        formData.set(`items[${index}][freight]`, freight);
        formData.set(`items[${index}][remarks]`, remarks);
    });

    // 发送数据到后端
    fetch('/api/orders/', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('订单已成功提交');
                const orderId = data.orderId;
                return fetch(`/api/orders/${orderId}`, {method: 'GET'});
            } else {
                alert(`提交订单失败：${data.message}`);
            }
        })
        .catch(error => {
            console.error(error);
            alert('提交订单失败，请重试');
        });
});

function updateCancelBtnVisibility() {
    // 获取货物信息行的数量
    const rowCount = document.querySelectorAll('#goodsTbody tr').length;
    // 根据行数决定是否显示或隐藏取消按钮
    document.getElementById('cancel-row-btn').style.display = rowCount > 1 ? 'inline-block' : 'none';
}

function addGoodsRow() {
    // 获取当前行数，用于生成唯一的name属性
    const tbody = document.getElementById('goodsTbody');
    const rowCount = tbody.rows.length;

    // 创建新的行元素
    const newRow = document.createElement('tr');

    // 动态创建并填充每个单元格的内容
    newRow.innerHTML = `
      <td><input type="text" name="items[${rowCount}][productName]" required></td>
      <td><input type="text" name="items[${rowCount}][packageType]" required></td>
      <td><input type="number" step="1" name="items[${rowCount}][quantity]" value="1"></td>
      <td><input type="number" step="0.1" name="items[${rowCount}][weight]" value="0.0"></td>
      <td><input type="number" step="0.1" name="items[${rowCount}][volume]" value="0.0"></td>
      <td><input type="number" step="0.01" name="items[${rowCount}][deliveryCharge]" value="0.00"></td>
      <td><input type="number" step="0.01" name="items[${rowCount}][insuranceFee]" value="0.00"></td>
      <td><input type="number" step="0.01" name="items[${rowCount}][packagingFee]" value="0.00"></td>
      <td><input type="number" step="0.01" name="items[${rowCount}][goodsValue]" value="0.00"></td>
      <td><input type="number" step="0.01" name="items[${rowCount}][freight]" value="0.00"></td>
      <td><input type="text" name="items[${rowCount}][remarks]"></td>
  `;

    // 将新行插入到表格中
    tbody.appendChild(newRow);

    // 更新取消按钮的可见性
    updateCancelBtnVisibility();
}

document.getElementById('cancel-row-btn').addEventListener('click', function () {
    const tbody = document.getElementById('goodsTbody');
    if (tbody.rows.length > 1) { // 只有在有多于一行的时候才允许删除最后一行
        tbody.deleteRow(tbody.rows.length - 1);
    }
    // 更新取消按钮的可见性
    updateCancelBtnVisibility();
});

// 页面加载时初始化取消按钮的可见性
window.onload = function () {
    updateCancelBtnVisibility();
};


document.addEventListener('DOMContentLoaded', function () {
    // 获取模板选择下拉框
    const templateSelector = document.getElementById('templateSelector');

    // 从后端获取模板列表
    fetch('/custom_template/api/templates/') // 假设后端提供此接口
        .then(response => response.json())
        .then(templates => {
            templates.forEach(template => {
                const option = document.createElement('option');
                option.value = template.id;
                option.textContent = `${template.name} (${template.created_at})`;
                templateSelector.appendChild(option);
            });
        })
        .catch(error => console.error('加载模板列表失败:', error));
});


document.getElementById('previewButton').addEventListener('click', function () {
    const selectedTemplateId = document.getElementById('templateSelector').value;
    if (!selectedTemplateId) {
        alert('请先选择一个模板');
        return;
    }

    // 获取表单数据
    const formData = new FormData(document.getElementById('orderForm'));
    const data = {};
    
    // 将表单数据转换为对象，并转换为下划线格式
    formData.forEach((value, key) => {
        // 将驼峰命名转换为下划线命名
        const underscoreKey = key.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
        
        // 处理数组形式的字段名 (如 items[0][productName])
        const matches = underscoreKey.match(/^(\w+)(?:\[(\d+)\])?\[?(\w+)?\]?$/);
        if (matches) {
            const [, base, index, field] = matches;
            if (index !== undefined) {
                // 处理数组字段
                data[base] = data[base] || [];
                data[base][index] = data[base][index] || {};
                if (field) {
                    data[base][index][field] = value;
                }
            } else {
                // 处理普通字段
                data[base] = value;
            }
        } else {
            // 处理其他字段
            data[underscoreKey] = value;
        }
    });

    // 从后端获取模板内容
    fetch(`/custom_template/api/templates/${selectedTemplateId}/`)
        .then(response => response.json())
        .then(template => {
            let previewHtml = template.content;

            // 定义字段映射关系
            const fieldMapping = {
                '托运公司名称': data.company_name || '',
                '日期': data.date || '',
                '发站': data.departure_station || '',
                '到站': data.arrival_station || '',
                '查询单号': data.order_no || '',
                '发货人': data.sender_name || '',
                '收货人': data.receiver_name || '',
                '发货人电话': data.sender_phone || '',
                '收货人电话': data.receiver_phone || '',
                '发货人地址': data.sender_address || '',
                '收货人地址': data.receiver_address || '',
                '品名': data.items?.[0]?.product_name || '',
                '包装': data.items?.[0]?.package_type || '',
                '件数': data.items?.[0]?.quantity || '',
                '重量': data.items?.[0]?.weight || '',
                '体积': data.items?.[0]?.volume || '',
                '送货费': data.items?.[0]?.delivery_charge || '',
                '保险费': data.items?.[0]?.insurance_fee || '',
                '包装费': data.items?.[0]?.packaging_fee || '',
                '货物价值': data.items?.[0]?.goods_value || '',
                '运费': data.items?.[0]?.freight || '',
                '备注': data.items?.[0]?.remarks || '',
                '合计费用': data.total_fee || '',
                '付款方式': data.payment_method || '',
                '交货方式': data.delivery_method || '',
                '回单要求': data.return_requirement || '',
                '客户单号': data.customer_order_no || '',
                '发货人签名': data.sender_sign || '',
                '收货人签名': data.receiver_sign || '',
                '身份证号': data.id_card || '',
                '制单人': data.order_maker || '',
                '发站电话': data.departure_station_phone || '',
                '发站地址': data.carrier_address || '',
                '到站电话': data.arrival_station_phone || '',
                '到站地址': data.arrival_address || ''
            };

            // 替换占位符
            Object.entries(fieldMapping).forEach(([cnField, value]) => {
                const placeholder = `{{ ${cnField} }}`;
                // 替换所有匹配的占位符
                previewHtml = previewHtml.replace(new RegExp(placeholder, 'g'), value);
            });

            // 创建一个隐藏的iframe用于打印
            const printFrame = document.createElement('iframe');
            printFrame.style.position = 'fixed';
            printFrame.style.right = '0';
            printFrame.style.bottom = '0';
            printFrame.style.width = '0';
            printFrame.style.height = '0';
            printFrame.style.border = '0';
            document.body.appendChild(printFrame);

            // 设置iframe内容
            printFrame.contentDocument.write(`
                <!DOCTYPE html>
                <html lang="zh-CN">
                <head>
                    <meta charset="UTF-8">
                    <title>打印预览</title>
                    <style>
                        @media print {
                            body { margin: 0; padding: 0; }
                            .print-container { position: relative; width: 100%; height: 100%; }
                        }
                        body { font-family: Arial, sans-serif; }
                        .field { position: absolute; padding: 5px; }
                        
                        /* 添加特定字段的打印样式 */
                        .field[data-name="托运公司名称"] {
                            width: 200px !important;
                            font-size: 30px !important;
                        }
                        
                        .field[data-name="发货人"],
                        .field[data-name="发货人地址"],
                        .field[data-name="收货人地址"],
                        .field[data-name="发站地址"],
                        .field[data-name="到站地址"] {
                            width: 260px !important;
                            font-size: 20px !important;
                        }
                    </style>
                </head>
                <body>
                    <div class="print-container">
                        ${previewHtml}
                    </div>
                </body>
                </html>
            `);
            
            // 等待iframe内容加载完成后打印
            printFrame.onload = function() {
                try {
                    // 调用打印
                    printFrame.contentWindow.print();
                    
                    // 打印完成后移除iframe
                    setTimeout(function() {
                        document.body.removeChild(printFrame);
                    }, 1000);
                } catch (e) {
                    console.error('打印失败:', e);
                    alert('打印预览失败，请重试');
                    document.body.removeChild(printFrame);
                }
            };
            
            // 手动触发onload事件
            printFrame.contentDocument.close();
        })
        .catch(error => {
            console.error('加载模板内容失败:', error);
            alert('加载模板内容失败，请重试');
        });
});


// 在文件顶部添加日期初始化函数
document.addEventListener('DOMContentLoaded', function() {
    // 自动设置当前日期
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0]; // 格式化为YYYY-MM-DD
        dateInput.value = formattedDate;
        dateInput.placeholder = formattedDate;
    }
});
// 在DOMContentLoaded事件中添加运单号生成逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 自动设置当前日期
    const dateInput = document.getElementById('date');
    const orderNoInput = document.getElementById('orderNo');
    
    if (dateInput && orderNoInput) {
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        
        // 获取今天的订单数量（需要后端API支持）
        fetch('/api/orders/today_count/')
            .then(response => response.json())
            .then(data => {
                const todayCount = data.count || 0;
                orderNoInput.value = `${month}${day}-${todayCount + 1}`;
                orderNoInput.placeholder = orderNoInput.value;
            })
            .catch(error => {
                console.error('获取今日订单数失败:', error);
                // 默认从1开始
                orderNoInput.value = `${month}${day}-1`;
                orderNoInput.placeholder = orderNoInput.value;
            });
    }
});
