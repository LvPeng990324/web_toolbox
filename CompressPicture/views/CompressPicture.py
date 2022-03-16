from django.views import View
from django.shortcuts import render


class CompressPicture(View):
    """ 压缩图片
    """
    def get(self, reqeust):
        return render(reqeust, 'CompressPicture/compress-picture.html')
