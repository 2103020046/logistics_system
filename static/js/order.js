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

    // 获取表单数据并转换为嵌套对象
    const formData = new FormData(document.getElementById('orderForm'));
    const data = {};
    formData.forEach((value, key) => {
        // 将驼峰命名转换为下划线命名
        const underscoreKey = key.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
        const keys = underscoreKey.split(/[[\]]/).filter(k => k !== ""); // 分割键名
        let current = data;

        for (let i = 0; i < keys.length; i++) {
            const isArray = !isNaN(keys[i + 1]); // 判断下一个键是否为数组索引
            const isLast = i === keys.length - 1; // 判断是否为最后一个键

            if (!isLast) {
                current[keys[i]] = current[keys[i]] || (isArray ? [] : {});
                current = current[keys[i]]; // 进入下一层
            } else {
                current[keys[i]] = value;
            }
        }
    });



    // 从后端获取模板内容
    fetch(`/custom_template/api/templates/${selectedTemplateId}/`)
        .then(response => response.json())
        .then(template => {
            console.log('Template Content:', template.content); // 调试输出

            let previewHtml = template.content;

            // 替换占位符（支持嵌套字段）
            function replacePlaceholders(html, data, prefix = "") {
                for (const key in data) {
                    const fullKey = prefix ? `${prefix}.${key}` : key;
                    console.log(`Processing key: ${fullKey}`);

                    // 将字段名转换为下划线命名法
                    const snakeCaseKey = key.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
                    const escapedKey = fullKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const snakeCaseEscapedKey = `${prefix ? `${prefix}.` : ''}${snakeCaseKey}`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

                    if (typeof data[key] === "object" && data[key] !== null) {
                        if (Array.isArray(data[key])) {
                            html = html.replace(new RegExp(`{{\\s*${escapedKey}\$.*?\$\\..*?\\s*}}`, 'g'), ''); // 清除未匹配的占位符
                            data[key].forEach((item, index) => {
                                const arrayKey = `${fullKey}[${index}]`;
                                html = replacePlaceholders(html, item, arrayKey);
                            });
                        } else {
                            html = replacePlaceholders(html, data[key], fullKey);
                        }
                    } else {
                        // 构建正则表达式并替换占位符
                        const regexCamel = new RegExp(`{{\\s*${escapedKey}(?:\$.*?\$|\\.\\w+)?\\s*}}`, "g");
                        const regexSnake = new RegExp(`{{\\s*${snakeCaseEscapedKey}(?:\$.*?\$|\\.\\w+)?\\s*}}`, "g");

                        if (html.match(regexCamel)) {
                            console.log(`Replacing placeholder: {{${escapedKey}}} with value: ${data[key]}`);
                            html = html.replace(regexCamel, data[key]);
                        } else if (html.match(regexSnake)) {
                            console.log(`Replacing placeholder: {{${snakeCaseEscapedKey}}} with value: ${data[key]}`);
                            html = html.replace(regexSnake, data[key]);
                        } else {
                            console.warn(`No match found for placeholder: {{${escapedKey}}} or {{${snakeCaseEscapedKey}}}`);
                        }
                    }
                }
                return html;
            }

            previewHtml = replacePlaceholders(template.content, data);



            // 在新窗口中显示预览
            const previewWindow = window.open('', '_blank');
            previewWindow.document.write(`
                <!DOCTYPE html>
                <html lang="zh-CN">
                <head>
                    <meta charset="UTF-8">
                    <title>订单预览</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .field { position: absolute; padding: 5px; }
                    </style>
                </head>
                <body>
                    <div id="preview-container" style="position: relative;">
                        ${previewHtml}
                    </div>
                    <script>
                        // 应用字段位置信息
                        const fieldPositions = ${JSON.stringify(template.field_positions)};
                        const container = document.getElementById('preview-container');
                        Object.keys(fieldPositions).forEach(fieldName => {
                            const fieldElement = container.querySelector(\`[data-name="\${fieldName}"]\`);
                            if (fieldElement) {
                                const position = fieldPositions[fieldName];
                                fieldElement.style.left = \`\${position.x}px\`;
                                fieldElement.style.top = \`\${position.y}px\`;
                                fieldElement.style.width = \`\${position.width}px\`;
                                fieldElement.style.height = \`\${position.height}px\`;
                            }
                        });
                    </script>
                </body>
                </html>
            `);
        })
        .catch(error => console.error('加载模板内容失败:', error));
});