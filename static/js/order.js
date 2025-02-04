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
        method: 'POST', body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('订单已成功提交');
            } else {
                alert(`提交订单失败：${data.message}`);
            }
        })
        .catch(error => {
            console.error(error);
            alert('提交订单失败，请重试');
        });
});

// 动态添加货物行的函数
// function addGoodsRow() {
//     const tbody = document.getElementById('goodsTbody');
//     const newRow = `
//         <tr>
//             <td><input type="text" name="items[${tbody.rows.length}][productName]" required></td>
//             <td><input type="text" name="items[${tbody.rows.length}][packageType]" required></td>
//             <td><input type="number" step="1" name="items[${tbody.rows.length}][quantity]" required value="1"></td>
//             <td><input type="number" step="0.1" name="items[${tbody.rows.length}][weight]" required value="0.0"></td>
//             <td><input type="number" step="0.1" name="items[${tbody.rows.length}][volume]" required value="0.0"></td>
//             <td><input type="number" step="0.01" name="items[${tbody.rows.length}][freight]" required value="0.00"></td>
//         </tr>`;
//     tbody.insertAdjacentHTML('beforeend', newRow);
// }

function addGoodsRow() {
    const tbody = document.getElementById('goodsTbody');
    const newRow = `
        <tr>
            <td><input type="text" name="items[${tbody.rows.length}][productName]" required></td>
            <td><input type="text" name="items[${tbody.rows.length}][packageType]" required></td>
            <td><input type="number" step="1"></td>
            <td><input type="number" step="0.1"></td>
            <td><input type="number" step="0.1"></td>
            <td><input type="number" step="0.01"></td>
        </tr>`;
    tbody.insertAdjacentHTML('beforeend', newRow);
}
