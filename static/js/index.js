$(document).ready(function() {
    // 左侧菜单点击事件
    $('.sidebar .nav-link[data-tab]').on('click', function(e) {
        e.preventDefault();
        const tabId = $(this).data('tab');
        const tabTitle = $(this).text().trim();
        const tabUrl = $(this).attr('href');
        
        // 检查标签页是否已存在
        if (!$(`#${tabId}-tab`).length) {
            addTab(tabId, tabTitle, tabUrl);
        }
        
        // 激活标签页
        $(`#${tabId}-tab`).tab('show');
    });

    // 添加标签页
    function addTab(tabId, tabTitle, tabUrl) {
        // 创建标签页按钮
        const tabButton = $(`
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="${tabId}-tab" data-bs-toggle="tab" 
                        data-bs-target="#${tabId}" type="button" role="tab">
                    <span>${tabTitle}</span>
                    <span class="close-tab" data-tab-id="${tabId}">×</span>
                </button>
            </li>
        `);
        
        // 创建标签页内容区
        const tabContent = $(`
            <div class="tab-pane fade" id="${tabId}" role="tabpanel">
                <div class="tab-loading">加载中...</div>
            </div>
        `);
        
        // 添加到DOM
        $('#mainTabs').append(tabButton);
        $('#mainTabsContent').append(tabContent);
        
        // 加载内容
        loadTabContent(tabId, tabUrl);
    }

    // 加载标签页内容
    // 修改loadTabContent函数
    function loadTabContent(tabId, url) {
        $.get(url, function(data) {
            $(`#${tabId}`).html(data);
            updateBreadcrumb(url); // 加载内容后更新面包屑
        }).fail(function() {
            $(`#${tabId}`).html('<div class="alert alert-danger">加载内容失败</div>');
            updateBreadcrumb(url); // 即使失败也更新面包屑
        });
    }
    
    // 更新面包屑导航函数
    function updateBreadcrumb(url) {
        const $breadcrumb = $('.breadcrumb');
        $breadcrumb.empty();
        
        // 首页始终显示
        $breadcrumb.append('<li class="breadcrumb-item home-item"><i class="fas fa-home"></i> 首页</li>');
        
        // 根据URL添加面包屑
        if (url.includes('/order/')) {
            $breadcrumb.append('<li class="breadcrumb-item active">新增订单</li>');
        } else if (url.includes('/history/')) {
            $breadcrumb.append('<li class="breadcrumb-item active">历史订单</li>');
        } else if (url.includes('/custom_template/editor/')) {
            $breadcrumb.append('<li class="breadcrumb-item active">自定义打印模板</li>');
        } else if (url.includes('/custom_template/list/')) {
            $breadcrumb.append('<li class="breadcrumb-item active">模板列表</li>');
        } else {
            $breadcrumb.append('<li class="breadcrumb-item active">首页</li>');
        }
    }
    
    // 关闭标签页
    $(document).on('click', '.close-tab', function(e) {
        e.stopPropagation();
        const tabId = $(this).data('tab-id');
        
        // 如果是当前激活的标签页，需要激活其他标签页
        if ($(`#${tabId}-tab`).hasClass('active')) {
            $('#home-tab').tab('show');
        }
        
        // 移除标签页
        $(`#${tabId}-tab`).parent().remove();
        $(`#${tabId}`).remove();
    });
    
    // 更新面包屑导航
    function updateBreadcrumb() {
        const path = window.location.pathname;
        const $breadcrumb = $('.breadcrumb');
        $breadcrumb.empty();
        
        // 首页始终显示
        $breadcrumb.append('<li class="breadcrumb-item home-item"><i class="fas fa-home"></i> 首页</li>');
        
        // 根据路径添加面包屑
        if (path.includes('/order/')) {
            $breadcrumb.append('<li class="breadcrumb-item active">新增订单</li>');
        } else if (path.includes('/history/')) {
            $breadcrumb.append('<li class="breadcrumb-item active">历史订单</li>');
        } else if (path.includes('/custom_template/editor/')) {
            $breadcrumb.append('<li class="breadcrumb-item active">自定义打印模板</li>');
        } else if (path.includes('/custom_template/list/')) {
            $breadcrumb.append('<li class="breadcrumb-item active">模板列表</li>');
        } else {
            $breadcrumb.append('<li class="breadcrumb-item active">首页</li>');
        }
    }
    
    // 初始化面包屑导航
    updateBreadcrumb();
});