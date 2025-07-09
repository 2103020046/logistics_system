$(document).ready(function() {
    // 左侧菜单点击事件
    $('.sidebar-menu a[data-tab]').on('click', function(e) {
        e.preventDefault();
        const tabId = $(this).data('tab');
        const tabTitle = $(this).text().trim();
        const tabUrl = getTabUrl(tabId);
        
        // 检查标签页是否已存在
        if (!$(`#${tabId}-tab`).length) {
            addTab(tabId, tabTitle, tabUrl);
        }
        
        // 激活标签页
        $(`#${tabId}-tab`).tab('show');
        
        // 更新面包屑导航
        updateBreadcrumb(tabId, tabTitle);
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
    function loadTabContent(tabId, url) {
        // 如果是首页且内容已存在，则不再加载
        if (tabId === 'home' && $('#home').children().length > 0) {
            return;
        }

        $.get(url, function(data) {
            $(`#${tabId}`).html(data);
        }).fail(function() {
            $(`#${tabId}`).html('<div class="alert alert-danger">加载内容失败</div>');
        });
    }

    // 关闭标签页
    $(document).on('click', '.close-tab', function(e) {
        e.stopPropagation();
        const tabId = $(this).data('tab-id');
        
        // 如果是当前激活的标签页，需要激活首页标签页
        if ($(`#${tabId}-tab`).hasClass('active')) {
            $('#home-tab').tab('show');
        }
        
        // 移除标签页
        $(`#${tabId}-tab`).parent().remove();
        $(`#${tabId}`).remove();
    });
    
    // 更新面包屑导航
    function updateBreadcrumb(tabId, tabTitle) {
        const $breadcrumb = $('.breadcrumb');
        $breadcrumb.empty();
        
        // 首页始终显示
        $breadcrumb.append('<li class="breadcrumb-item home-item"><i class="fas fa-home"></i> 首页</li>');
        
        // 根据标签ID添加面包屑
        if (tabId === 'order') {
            $breadcrumb.append('<li class="breadcrumb-item">订单管理</li>');
            $breadcrumb.append(`<li class="breadcrumb-item active">${tabTitle}</li>`);
        } else if (tabId === 'history') {
            $breadcrumb.append('<li class="breadcrumb-item">订单管理</li>');
            $breadcrumb.append(`<li class="breadcrumb-item active">${tabTitle}</li>`);
        } else if (tabId === 'editor') {
            $breadcrumb.append('<li class="breadcrumb-item">模板管理</li>');
            $breadcrumb.append(`<li class="breadcrumb-item active">${tabTitle}</li>`);
        } else if (tabId === 'template-list') {
            $breadcrumb.append('<li class="breadcrumb-item">模板管理</li>');
            $breadcrumb.append(`<li class="breadcrumb-item active">${tabTitle}</li>`);
        } else {
            $breadcrumb.append('<li class="breadcrumb-item active">首页</li>');
        }
    }
    
    // 根据标签ID获取对应的URL
    function getTabUrl(tabId) {
        switch(tabId) {
            case 'home': return '/';
            case 'order': return '/order/';
            case 'history': return '/history/';
            case 'editor': return '/custom_template/editor/';
            case 'template-list': return '/custom_template/list/';
            default: return '/';
        }
    }
    
    // 初始化首页内容
    loadTabContent('home', '/');
    
    // 只保留菜单展开/折叠功能
    $(document).ready(function() {
        // 子菜单展开/折叠
        $('.has-submenu > a').on('click', function(e) {
            e.preventDefault();
            $(this).parent().toggleClass('active');
        });
    });

    // 首页标签页点击处理
    $('#home-tab').on('click', function() {
        $('.breadcrumb').html('<li class="breadcrumb-item home-item"><i class="fas fa-home"></i> 首页</li>');
    });
});