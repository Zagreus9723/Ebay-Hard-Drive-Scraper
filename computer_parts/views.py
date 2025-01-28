from django.shortcuts import render

# Create your views here.
def homepage(request):
    return render(request, 'computer_parts/home.html',{})

def hard_drives(request):
    return render(request, 'computer_parts/english.html',{})