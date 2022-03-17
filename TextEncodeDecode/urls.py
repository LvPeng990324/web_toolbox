from django.urls import path

from TextEncodeDecode.views.TextEncodeDecode import TextEncodeDecode

app_name = 'TextEncodeDecode'

urlpatterns = [
    path('text-encode-decode/', TextEncodeDecode.as_view(), name='text-encode-decode'),
]
