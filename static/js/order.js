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


function previewOrder() {
    // 创建一个新的窗口
    const previewWindow = window.open('', '_blank');

    // 获取所有表格的数据
    const date = document.querySelector('input[name="date"]').value;
    const departureStation = document.querySelector('input[name="departureStation"]').value;
    const arrivalStation = document.querySelector('input[name="arrivalStation"]').value;
    const orderNo = document.querySelector('input[name="orderNo"]').value;
    const senderName = document.querySelector('input[name="senderName"]').value;
    const receiverName = document.querySelector('input[name="receiverName"]').value;
    const senderPhone = document.querySelector('input[name="senderPhone"]').value;
    const receiverPhone = document.querySelector('input[name="receiverPhone"]').value;
    const senderAddress = document.querySelector('input[name="senderAddress"]').value;
    const receiverAddress = document.querySelector('input[name="receiverAddress"]').value;

    const productName = document.querySelector('input[name="items[0][productName]"]').value;
    const packageType = document.querySelector('input[name="items[0][packageType]"]').value;
    const quantity = document.querySelector('input[name="items[0][quantity]"]').value;
    const weight = document.querySelector('input[name="items[0][weight]"]').value;
    const volume = document.querySelector('input[name="items[0][volume]"]').value;
    const deliveryCharge = document.querySelector('input[name="items[0][deliveryCharge]"]').value;
    const insuranceFee = document.querySelector('input[name="items[0][insuranceFee]"]').value;
    const packagingFee = document.querySelector('input[name="items[0][packagingFee]"]').value;
    const goodsValue = document.querySelector('input[name="items[0][goodsValue]"]').value;
    const freight = document.querySelector('input[name="items[0][freight]"]').value;
    const remarks = document.querySelector('input[name="items[0][remarks]"]').value;

    // 第二行商品信息（如果存在）
    const tbody = document.getElementById('goodsTbody');
    const rowCount = tbody.rows.length;
    let productName1 = '', packageType1 = '', quantity1 = '', weight1 = '',
        volume1 = '', deliveryCharge1 = '', insuranceFee1 = '', packagingFee1 = '',
        goodsValue1 = '', freight1 = '', remarks1 = '';
    if (rowCount > 1) {
        productName1 = document.querySelector('input[name="items[1][productName]"]').value || '0';
        packageType1 = document.querySelector('input[name="items[1][packageType]"]').value || '0';
        quantity1 = document.querySelector('input[name="items[1][quantity]"]').value || '0';
        weight1 = document.querySelector('input[name="items[1][weight]"]').value || '0';
        volume1 = document.querySelector('input[name="items[1][volume]"]').value || '0';
        deliveryCharge1 = document.querySelector('input[name="items[1][deliveryCharge]"]').value || '0';
        insuranceFee1 = document.querySelector('input[name="items[1][insuranceFee]"]').value || '0';
        packagingFee1 = document.querySelector('input[name="items[1][packagingFee]"]').value || '0';
        goodsValue1 = document.querySelector('input[name="items[1][goodsValue]"]').value || '0';
        freight1 = document.querySelector('input[name="items[1][freight]"]').value || '0';
        remarks1 = document.querySelector('input[name="items[1][remarks]"]').value || '0';
    }


    const totalFee = document.querySelector('input[name="totalFee"]').value;
    // const paymentMethod = document.querySelector('input[name="paymentMethod"]').value;
    // const deliveryMethod = document.querySelector('input[name="deliveryMethod()"]').value;
    const returnRequirement = document.querySelector('input[name="returnRequirement"]').value;
    const customerOrderNo = document.querySelector('input[name="customerOrderNo"]').value;
    const senderSign = document.querySelector('input[name="senderSign"]').value;
    const receiverSign = document.querySelector('input[name="receiverSign"]').value;
    const idCard = document.querySelector('input[name="idCard"]').value;
    const orderMaker = document.querySelector('input[name="orderMaker"]').value;
    const departureStationPhone = document.querySelector('input[name="departureStationPhone"]').value;
    const carrierAddress = document.querySelector('input[name="carrierAddress"]').value;
    const arrivalStationPhone = document.querySelector('input[name="arrivalStationPhone"]').value;
    const arrivalAddress = document.querySelector('input[name="arrivalAddress"]').value;
    // 构建要显示的内容
    let content = `
        <!DOCTYPE html>
<html lang="zh-CN">

<head>
  <meta charset="UTF-8">
  <title>物流公司托运单</title>
   <style>
    /* 页面打印样式 */
    @page {
      size: 24cm 13.97cm; /* 设置页面尺寸为24cm x 13.97cm */
      margin: 0; /* 去除默认页边距 */
    }

    /* 默认样式：正常显示所有内容 */
    body {
      font-family: Arial, sans-serif;
    }

    table {
      border-collapse: separate; /* 分离边框模式 */
      border-spacing: 8px; /* 设置单元格间距 */
      width: 80%;

    table,
    th,
    td {
      border: 1px solid black;
    }

    th,
    td {
      padding: 8px;
      text-align: center;
    }

    /* 打印时的样式 */
    @media print {
      /* 隐藏表格的边框 */
      table,
      th,
      td {
        border: none !important; /* 移除表格边框 */
      }

      /* 隐藏表头 */
      th {
        visibility: hidden !important; /* 隐藏表头，但保留空间 */
      }

      /* 隐藏不需要的单元格内容 */
      td {
        visibility: hidden !important; /* 隐藏单元格内容，但保留空间 */
      }

      /* 仅保留中的数据，并调整字体大小 */
      td[data-print]::before {
        content: attr(data-print); /* 显示中的数据 */
        visibility: visible !important; /* 确保数据可见 */
        font-size: 28px !important; /* 调大字体大小 */
        font-weight: bold; /* 可选：加粗字体以增强可读性 */
      }
      
      /* 如果 data-print 的值为空，则显示 "0" */
      td[data-print='']::before,
      td[data-print='undefined']::before,
      td[data-print='null']::before {
        content: '0'; /* 如果值为空或未定义，则显示 "0" */
      }
    }
  </style>
</head>

<body>
  <div>
    <!-- 正常显示的表格 -->
<!--    <h1 style="text-align: justify; color: red;">物流公司托运单</h1>-->
    <table>
      <tr>
        <th>日期</th>
        <td colspan="2" data-print="${date}"></td>
        <th>发站</th>
        <td colspan="3" data-print="${departureStation}"></td>
        <th>到站</th>
        <td data-print="${arrivalStation}"></td>
        <th colspan="2">查询单号</th>
        <td data-print="${orderNo}"></td>
      </tr>
      <tr>
        <th rowspan="3">发货方</th>
        <th colspan="2">发货人</th>
        <td colspan="3" data-print="${senderName}"></td>
        <th rowspan="3">收货方</th>
        <th>收货人</th>
        <td colspan="4" data-print="${receiverName}" style="text-align: center"></td>
      </tr>
      <tr>
        <th colspan="2">电话</th>
        <td colspan="3" data-print="${senderPhone}"></td>
        <th>电话</th>
        <td colspan="4" data-print="${receiverPhone}" style="text-align: center"></td>
      </tr>
      <tr>
        <th colspan="2">地址</th>
        <td colspan="3" data-print="${senderAddress}"></td>
        <th>地址</th>
        <td colspan="4" data-print="${receiverAddress}" style="text-align: center"></td>
      </tr>
      <tr>
        <th style="width: 20px;" colspan="2">品名</th>
        <th style="width: 200px">包装</th>
        <th style="width: 100px">件数</th>
        <th>重量</th>
        <th>体积</th>
        <th>送货费</th>
        <th>保险费</th>
        <th>包装费</th>
        <th>货物价值</th>
        <th style="width: 100px">运费</th>
        <th>备注</th>
      </tr>
      <tr>
        <td style="width: 20px; text-align: right" colspan="2" data-print="${productName}"></td>
        <td style="text-align: right" data-print="${packageType}"></td>
        <td style="text-align: center" data-print="${quantity}"></td>
        <td style="text-align: center" data-print="${weight}"></td>
        <td style="text-align: center" data-print="${volume}"></td>
        <td style="text-align: center" data-print="${deliveryCharge}"></td>
        <td style="text-align: center" data-print="${insuranceFee}"></td>
        <td style="text-align: center" data-print="${packagingFee}"></td>
        <td style="text-align: right" data-print="${goodsValue}"></td>
        <td style="text-align: right" data-print="${freight}"></td>
        <td style="text-align: right" data-print="${remarks}"></td>
      </tr>
      <tr>
        <td style="width: 20px; text-align: right" colspan="2" data-print="${productName1}"></td>
        <td style="text-align: right" data-print="${packageType1}"></td>
        <td style="text-align: center" data-print="${quantity1}"></td>
        <td style="text-align: center" data-print="${weight1}"></td>
        <td style="text-align: center" data-print="${volume1}"></td>
        <td style="text-align: center" data-print="${deliveryCharge1}"></td>
        <td style="text-align: center" data-print="${insuranceFee1}"></td>
        <td style="text-align: center" data-print="${packagingFee1}"></td>
        <td style="text-align: right" data-print="${goodsValue1}"></td>
        <td style="text-align: right" data-print="${freight1}"></td>
        <td style="text-align: right" data-print="${remarks1}"></td>
      </tr>
      <br>
      <tr>
        <th rowspan="2">合计金额</th>
        <td rowspan="2" colspan="6" style="text-align: right" data-print="${totalFee}.00"></td>
        <th>交货方式</th>
        <td colspan="2">等通知放货</td>
        <th>付款方式</th>
        <td>回单要求</td>
      </tr>
      <tr>
        <th>送货□自提□</th>
        <td colspan="2"></td>
        <th>提付□现付□</th>
        <td data-print="${returnRequirement}" style="text-align: right"></td>
      </tr>
      <tr>
        <th>代收货款</th>
        <td colspan="6"></td>
        <th>客户单号</th>
        <td colspan="4" data-print="${customerOrderNo}"></td>
      </tr>
      <tr>
        <th>发货人签名</th>
        <td colspan="2" data-print="${senderSign}"></td>
        <th>收货人签名</th>
        <td colspan="2" data-print="${receiverSign}" style="text-align: left"></td>
        <th>身份证号</th>
        <td colspan="3" data-print="${idCard}" style="text-align: left"></td>
        <th>制单人</th>
        <td colspan="2" data-print="${orderMaker}"></td>
      </tr>
    </table>
<!--    <h2 style="color: red;">温馨提示：托运人交付货物的行为，视为其已充分阅读理解本《托运单》背面条款且同意遵守。</h2>-->
    <br>
    <br>
    <table style="border: none;">
      <tr>
        <td style="text-align: left; width: 110px; border: none; padding: 0">发站查询电话:</td>
        <td style="text-align: right; width: 300px; border: none;" data-print="${departureStationPhone}"></td>
        <td style="text-align: left; width: 80px; border: none; padding: 0">发站地址:</td>
        <td style="text-align: center; border: none;" data-print="${carrierAddress}"></td>
      </tr>
      <tr>
        <td style="text-align: left; width: 110px; border: none; padding: 0">到站查询电话:</td>
        <td style="text-align: right; width: 300px; border: none;" data-print="${arrivalStationPhone}"></td>
        <td style="text-align: left; width: 80px; border: none; padding: 0">到站地址:</td>
        <td style="text-align: center; border: none;" data-print="${arrivalAddress}"></td>
      </tr>
    </table>
  </div>
</body>

</html>
    `;

    // 在新窗口中显示内容
    previewWindow.document.write(content);
    previewWindow.document.close();
}

