document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('canvas');
    const templateContentInput = document.createElement('textarea');
    templateContentInput.id = 'template_content';
    templateContentInput.name = 'template_content';
    templateContentInput.style.display = 'none';
    document.getElementById('templateForm').appendChild(templateContentInput);

    const fieldPositionsInput = document.createElement('input');
    fieldPositionsInput.type = 'hidden';
    fieldPositionsInput.id = 'field_positions';
    fieldPositionsInput.name = 'field_positions';
    document.getElementById('templateForm').appendChild(fieldPositionsInput);



    let draggedField = null;

    function initializeDraggableFields() {
        const draggableFields = document.querySelectorAll('.draggable-field, .field');

        draggableFields.forEach(field => {
            field.setAttribute('draggable', true);
            field.addEventListener('dragstart', handleDragStart);
        });

        canvas.addEventListener('dragover', e => e.preventDefault());
        canvas.addEventListener('drop', handleDrop);
    }

    function handleDragStart(e) {
        draggedField = e.target;
        e.dataTransfer.setData('text/plain', '');
    }

    function handleDrop(e) {
        e.preventDefault();

        if (!draggedField) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;


        if (canvas.contains(draggedField)) {
            console.log(draggedField)

            // 检查是否是从画布内部拖拽进来的字段
            const fieldName = draggedField.getAttribute('data-name');
            if (!fieldName || fieldName === 'undefined') return; // 避免无效字段名

            // 隐藏原始字段
            draggedField.style.display = 'none';

            // 创建新的字段元素并添加到新位置
            const fieldElement = createFieldElement(fieldName, x, y);
            canvas.appendChild(fieldElement);

            fieldElement.addEventListener('dragstart', handleDragStart);

            makeFieldDraggable(fieldElement);

            updateTemplateContentAndFieldPositions();
        } else {
            // 如果是从画布外部拖拽的字段
            const fieldName = draggedField.textContent.trim();
            if (fieldName === '') return; // 避免空字符串

            // 创建新的字段元素并添加到新位置
            const fieldElement = createFieldElement(fieldName, x, y);
            canvas.appendChild(fieldElement);

            fieldElement.addEventListener('dragstart', handleDragStart);

            makeFieldDraggable(fieldElement);

            updateTemplateContentAndFieldPositions();

            // 移除或隐藏原始字段
            draggedField.remove();
        }
    }

    function updateTemplateContentAndFieldPositions() {
        const fields = canvas.querySelectorAll('.field');
        const fieldPositions = {};

        fields.forEach(field => {
            const fieldName = field.getAttribute('data-name');
            if (!fieldName || fieldName === 'undefined') return; // 跳过无效字段名

            const rect = field.getBoundingClientRect();
            const parentRect = canvas.getBoundingClientRect();
            const x = rect.left - parentRect.left;
            const y = rect.top - parentRect.top;
            const width = rect.width;
            const height = rect.height;

            fieldPositions[fieldName] = { x, y, width, height };
        });

        templateContentInput.value = canvas.innerHTML;
        fieldPositionsInput.value = JSON.stringify(fieldPositions);
    }

    function makeFieldDraggable(field) {
        let isDragging = false;
        let offsetX, offsetY;

        field.addEventListener('mousedown', startDrag);
        field.addEventListener('mousemove', drag);
        field.addEventListener('mouseup', endDrag);

        function startDrag(e) {
            isDragging = true;
            offsetX = e.offsetX;
            offsetY = e.offsetY;
            field.style.cursor = 'grabbing';
        }

        function drag(e) {
            if (!isDragging) return;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left - offsetX;
            const y = e.clientY - rect.top - offsetY;

            // 确保字段不会移出画布
            if (x < 0) field.style.left = '0px';
            else if (x > rect.width - field.offsetWidth) field.style.left = `${rect.width - field.offsetWidth}px`;
            else field.style.left = `${x}px`;

            if (y < 0) field.style.top = '0px';
            else if (y > rect.height - field.offsetHeight) field.style.top = `${rect.height - field.offsetHeight}px`;
            else field.style.top = `${y}px`;

            updateTemplateContentAndFieldPositions();
        }

        function endDrag() {
            isDragging = false;
            field.style.cursor = 'grab';
        }
    }

    // 添加鼠标移动事件以更新字段位置
    canvas.addEventListener('mousemove', (event) => {
        if (draggedField && event.buttons === 1) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            draggedField.style.left = `${x}px`;
            draggedField.style.top = `${y}px`;

            updateTemplateContentAndFieldPositions();
        }
    });

    // 添加鼠标释放事件以结束拖拽
    canvas.addEventListener('mouseup', () => {
        draggedField = null;
    });

    const templateId = new URLSearchParams(window.location.search).get('template_id');

    if (templateId) {
        fetch(`/custom_template/api/templates/${templateId}/`)
            .then(response => response.json())
            .then(template => {
                // 设置模板名称
                document.getElementById('templateName').value = template.name;

                // 设置模板内容
                canvas.innerHTML = template.content;
                templateContentInput.value = template.content;

                // 设置字段位置
                const fieldPositions = JSON.stringify(template.field_positions);
                fieldPositionsInput.value = fieldPositions;

                // 初始化拖拽功能
                initializeDraggableFields();
            })
            .catch(error => console.error('加载模板内容失败:', error));
    } else {
        // 如果没有提供 template_id，则初始化空白画布
        initializeDraggableFields();
    }

    // 获取模板内容
    document.getElementById('templateForm').addEventListener('submit', function (e) {
        e.preventDefault(); // 阻止默认提交

        // 1. 检查画布内容
        const canvas = document.getElementById('canvas');
        const templateContent = canvas.innerHTML;
        if (!templateContent.trim()) {
            alert('模板内容不能为空！');
            return;
        }

        // 2. 收集字段位置信息
        const fieldPositions = {};
        const fields = document.querySelectorAll('.field');
        fields.forEach(field => {
            const fieldName = field.dataset.name;
            if (!fieldName || fieldName === 'undefined') return; // 跳过无效字段名

            const rect = field.getBoundingClientRect();
            const containerRect = canvas.getBoundingClientRect();
            fieldPositions[fieldName] = {
                x: rect.left - containerRect.left,
                y: rect.top - containerRect.top,
                width: rect.width,
                height: rect.height
            };
        });

        // 3. 添加隐藏字段
        const form = e.target;

        // 添加 template_content
        const contentInput = document.createElement('input');
        contentInput.type = 'hidden';
        contentInput.name = 'template_content';
        contentInput.value = templateContent;
        form.appendChild(contentInput);

        // 添加 field_positions
        const positionsInput = document.createElement('input');
        positionsInput.type = 'hidden';
        positionsInput.name = 'field_positions';
        positionsInput.value = JSON.stringify(fieldPositions);
        form.appendChild(positionsInput);

        // 4. 提交表单
        form.submit();
    });
});

// 创建字段元素
function createFieldElement(fieldName, x, y) {
    const fieldElement = document.createElement('div');
    fieldElement.className = 'field draggable';
    fieldElement.setAttribute('data-name', fieldName);
    fieldElement.textContent = `{{ ${fieldName} }}`;
    fieldElement.style.position = 'absolute';
    fieldElement.style.left = `${x}px`;
    fieldElement.style.top = `${y}px`;
    
    // 根据字段名称设置不同样式
    if (fieldName === '托运公司名称') {
        fieldElement.style.width = '200px';
        fieldElement.style.fontSize = '24px';
    } else if (['发货人', '发货人地址', '收货人地址', '发站地址', '到站地址'].includes(fieldName)) {
        fieldElement.style.width = '260px';
    } else {
        fieldElement.style.width = '180px';
        fieldElement.style.fontSize = '20px';
    }
    
    fieldElement.style.height = '30px';
    return fieldElement;
}

document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('canvas');
    const uploadBackgroundInput = document.getElementById('uploadBackground');

    // 监听文件选择事件
    uploadBackgroundInput.addEventListener('change', function (event) {
        const file = event.target.files[0];

        if (file) {
            // 创建一个 FileReader 对象读取文件
            const reader = new FileReader();

            // 当文件加载完成时，设置画布背景
            reader.onload = function (e) {
                canvas.style.backgroundImage = `url(${e.target.result})`;
            };

            // 读取文件为 Data URL
            reader.readAsDataURL(file);
        } else {
            alert('请选择一张图片作为背景！');
        }
    });

    // 初始化拖拽字段等其他逻辑...
    initializeDraggableFields();

    // 其他逻辑保持不变...
});

