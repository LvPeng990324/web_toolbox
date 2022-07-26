from django.views import View
from django.shortcuts import render


class StitchPicture(View):
    """ 拼接图片
    """
    def get(self, reqeust):
        return render(reqeust, 'StitchPicture/stitch-picture.html')
