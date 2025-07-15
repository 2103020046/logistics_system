from django.shortcuts import render, redirect
from django.contrib import messages
from .models import Consultation

def home(request):
    if request.method == 'POST':
        try:
            Consultation.objects.create(
                company_name=request.POST.get('company_name'),
                cargo_type=request.POST.get('cargo_type'),
                phone=request.POST.get('phone'),
                content=request.POST.get('content')
            )
            messages.success(request, '咨询提交成功！我们会尽快与您联系')
            return redirect('/company_website/')
        except Exception as e:
            messages.error(request, f'提交失败: {str(e)}')
            return redirect('/company_website/')
    return render(request, 'gzdxj.html')


def consultation_list(request):
    consultations = Consultation.objects.all().order_by('-created_at')
    return render(request, 'consultation_list.html', {'consultations': consultations})