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

document.getElementById('orderForm').addEventListener('submit', function (event) {
    event.preventDefault();

    // 验证表单
    if (!validateForm()) return;

    // 准备表单数据
    const formData = new FormData(event.target);

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

        formData.set(`items[${index}][productName]`, productName);
        formData.set(`items[${index}][packageType]`, packageType);
        formData.set(`items[${index}][quantity]`, quantity);
        formData.set(`items[${index}][weight]`, weight);
        formData.set(`items[${index}][volume]`, volume);
        formData.set(`items[${index}][freight]`, freight);
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
                const userConfirm = confirm('是否现在查看订单预览？');
                if (userConfirm) {
                    previewOrder();
                }
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
}


function previewOrder() {
    // 创建一个新的窗口
    const previewWindow = window.open('', '_blank');

    // 获取所有表格的数据
    const orderDetails = document.querySelector('.orderTable').outerHTML;
    const goodsDetails = document.querySelector('.goodsTable').outerHTML;
    const additionalDetails = document.querySelector('.additionalTable').outerHTML;

    // 构建要显示的内容
    let content = `
        <html>
            <head>
                <title>订单预览 - 双木林物流系统</title>
                <!-- 确保样式一致 -->
                <link rel="stylesheet" href="/static/css/order.css">
            </head>
            <body>
                <h2 style="text-align: center;">货物托运单 - 预览</h2>
                ${orderDetails}
                ${goodsDetails}
                ${additionalDetails}
                <button onclick="window.print();">打印</button>
            </body>
        </html>
    `;

    // 在新窗口中显示内容
    previewWindow.document.write(content);
    previewWindow.document.close();
}

