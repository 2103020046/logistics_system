from django.urls import path
from .views import FinanceListView, ExportExcelView, verify_order, FinanceOrderDetailView  # 修改导入的类名

urlpatterns = [
    path('', FinanceListView.as_view(), name='finance_list'),
    path('export/', ExportExcelView.as_view(), name='export_excel'),
    path('verify/<int:record_id>/', verify_order, name='verify_order'),
    path('finance-detail/<int:pk>/', FinanceOrderDetailView.as_view(), name='finance_order_detail'),  # 修改路由和名称
]