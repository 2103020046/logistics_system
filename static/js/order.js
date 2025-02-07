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

    const productName1 = document.querySelector('input[name="items[1][productName]"]').value;
    const packageType1 = document.querySelector('input[name="items[1][packageType]"]').value;
    const quantity1 = document.querySelector('input[name="items[1][quantity]"]').value;
    const weight1 = document.querySelector('input[name="items[1][weight]"]').value;
    const volume1 = document.querySelector('input[name="items[1][volume]"]').value;
    const deliveryCharge1 = document.querySelector('input[name="items[1][deliveryCharge]"]').value;
    const insuranceFee1 = document.querySelector('input[name="items[1][insuranceFee]"]').value;
    const packagingFee1 = document.querySelector('input[name="items[1][packagingFee]"]').value;
    const goodsValue1 = document.querySelector('input[name="items[1][goodsValue]"]').value;
    const freight1 = document.querySelector('input[name="items[1][freight]"]').value;
    const remarks1 = document.querySelector('input[name="items[1][remarks]"]').value;

    const totalFee = document.querySelector('input[name="totalFee"]').value;
    // const paymentMethod = document.querySelector('input[name="paymentMethod"]').value;
    // const deliveryMethod = document.querySelector('input[name="deliveryMethod()"]').value;
    const returnRequirement = document.querySelector('input[name="returnRequirement"]').value;
    const customerOrderNo  = document.querySelector('input[name="customerOrderNo"]').value;
    const senderSign  = document.querySelector('input[name="senderSign"]').value;
    const receiverSign  = document.querySelector('input[name="receiverSign"]').value;
    const idCard  = document.querySelector('input[name="idCard"]').value;
    const orderMaker  = document.querySelector('input[name="orderMaker"]').value;
    const departureStationPhone = document.querySelector('input[name="departureStationPhone"]').value;
    const carrierAddress = document.querySelector('input[name="carrierAddress"]').value;
    const arrivalStationPhone = document.querySelector('input[name="arrivalStationPhone"]').value;
    const arrivalAddress = document.querySelector('input[name="arrivalAddress"]').value;
    // 构建要显示的内容
    let content = `
        <!DOCTYPE html>
<html lang="zh - CN">

<head>
  <meta charset="UTF - 8">
  <title>物流公司托运单</title>
  <style>
    table {
      border-collapse: collapse;
      width: 80%;
    }

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
  </style>
</head>

<body>
  <div>
    <h1 style="text-align: justify; color: red;">&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;______________物流公司托运单</h1>
    <table>
      <tr>
        <th>日期</th>
        <td colspan="2">${date}</td>
        <th>发站</th>
        <td colspan="2">${departureStation}</td>
        <th colspan="2">到站</th>
        <td>${arrivalStation}</td>
        <th colspan="2">查询单号</th>
        <td>${orderNo}</td>
      </tr>
      <tr>
        <th rowspan="3">发货方</th>
        <th>发货人</th>
        <td colspan="4">${senderName}</td>
        <th rowspan="3">收货人</th>
        <th>收货人</th>
        <td colspan="4">${receiverName}</td>
      </tr>
      <tr>
        <th>电话</th>
        <td colspan="4">${senderPhone}</td>
        <th>电话</th>
        <td colspan="4">${receiverPhone}</td>
      </tr>
      <tr>
        <th>地址</th>
        <td colspan="4">${senderAddress}</td>
        <th>地址</th>
        <td colspan="4">${receiverAddress}</td>
      </tr>
      <tr>
        <th style="width: 20px;" colspan="2">品名</th>
        <th>包装</th>
        <th>件数</th>
        <th>重量</th>
        <th>体积</th>
        <th>送货费</th>
        <th>保险费</th>
        <th>包装费</th>
        <th>货物价值</th>
        <th>运费</th>
        <th>备注</th>
      </tr>
      <tr>
        <td style="width: 20px;" colspan="2">${productName}</td>
        <td>${packageType}</td>
        <td>${quantity}</td>
        <td>${weight}</td>
        <td>${volume}</td>
        <td>${deliveryCharge}</td>
        <td>${insuranceFee}</td>
        <td>${packagingFee}</td>
        <td>${goodsValue}</td>
        <td>${freight}</td>
        <td>${remarks}</td>
      </tr>
      <tr>
        <td style="width: 20px;" colspan="2">${productName1}</td>
        <td>${packageType1}</td>
        <td>${quantity1}</td>
        <td>${weight1}</td>
        <td>${volume1}</td>
        <td>${deliveryCharge1}</td>
        <td>${insuranceFee1}</td>
        <td>${packagingFee1}</td>
        <td>${goodsValue1}</td>
        <td>${freight1}</td>
        <td>${remarks1}</td>
      </tr>
      <tr>
        <th rowspan="2">合计金额</th>
        <td rowspan="2" colspan="6">
          &emsp;&emsp;&emsp;万&emsp;&emsp;&emsp;仟&emsp;&emsp;&emsp;佰&emsp;&emsp;&emsp;拾&emsp;&emsp;&emsp;元&emsp;&emsp;&emsp;￥:${totalFee}
        </td>
        <th>交货方式</th>
        <td colspan="2">等通知放货</td>
        <th>付款方式</th>
        <td>回单要求</td>
      </tr>
      <tr>
        <th>送货□自提□</th>
        <td colspan="2"></td>
        <th>提付□现付□</th>
        <th>${returnRequirement}</th>
      </tr>
      <tr>
        <th>代收货款</th>
        <td colspan="6">
          &emsp;&emsp;&emsp;万&emsp;&emsp;&emsp;仟&emsp;&emsp;&emsp;佰&emsp;&emsp;&emsp;拾&emsp;&emsp;&emsp;元&emsp;&emsp;&emsp;￥:
        </td>
        <th>客户单号</th>
        <td colspan="4">${customerOrderNo}</td>
      </tr>
      <tr>
        <th>发货人签名</th>
        <td colspan="2">${senderSign}</td>
        <th>收货人签名</th>
        <td colspan="2">${receiverSign}</td>
        <th>身份证号</th>
        <td colspan="3">${idCard}</td>
        <th>制单人</th>
        <td colspan="2">${orderMaker}</td>
      </tr>
    </table>
    <h2 style="color: red;">温馨提示：托运人交付货物的行为，视为其已充分阅读理解本《托运单》背面条款且同意遵守。</h2>
    <table style="border: none;">
      <tr>
        <td style="text-align: left; border: none;">发站查询电话</td>
        <td style="text-align: left; border: none;" colspan="4">${departureStationPhone}</td>
        <td style="text-align: left; border: none;">发站地址</td>
        <td style="text-align: left; border: none;" colspan="4">${carrierAddress}</td>
      </tr>
      <tr>
        <td style="text-align: left; border: none;">到站查询电话</td>
        <td style="text-align: left; border: none;" colspan="4">${arrivalStationPhone}</td>
        <td style="text-align: left; border: none;">到站地址</td>
        <td style="text-align: left; border: none;" colspan="4">${arrivalAddress}</td>
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

