from django.urls import path

from CompressPicture.views.CompressPicture import CompressPicture

app_name = 'CompressPicture'

urlpatterns = [
    path('compress-picture/', CompressPicture.as_view(), name='compress_picture'),
]
