from django.urls import path

from StitchPicture.views.StitchPicture import StitchPicture

app_name = 'StitchPicture'

urlpatterns = [
    path('stitch-picture/', StitchPicture.as_view(), name='stitch_picture'),
]
