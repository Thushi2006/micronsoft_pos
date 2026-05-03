from django.urls import path
from . import views

urlpatterns = [
    path('purchase/', views.purchase),
    path('analytics/', views.analytics),
    path('checkout/', views.checkout),
    path('products/', views.products),
]