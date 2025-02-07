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
document.getElementById('backButton').addEventListener('click', function() {
    window.history.back();
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

