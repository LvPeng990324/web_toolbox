from django.views import View
from django.shortcuts import render


class TextEncodeDecode(View):
    """ 文本加解密
    """
    def get(self, request):
        return render(request, 'TextEncodeDecode/text-encode-decode.html')
