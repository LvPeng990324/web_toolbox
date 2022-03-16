from django.urls import path

from Index.views.Index import Index

app_name = 'Index'

urlpatterns = [
    path('index/', Index.as_view(), name='index'),
]
