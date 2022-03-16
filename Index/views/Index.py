from django.views import View
from django.shortcuts import render


class Index(View):
    def get(self, request):

        return render(request, 'Index/index.html')
