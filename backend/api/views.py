from django.db import transaction
from django.db.models import Sum
from django.db.models.functions import TruncDate
from django.core.cache import cache
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Product, Transaction, Order, OrderItem
from datetime import timedelta


@api_view(['POST'])
def purchase(request):
    product_id = request.data.get('product_id', 1)
    try:
        with transaction.atomic():
            product = Product.objects.select_for_update().get(id=product_id)
            if product.stock <= 0:
                return Response({'error': 'Out of stock'}, status=400)
            product.stock -= 1
            product.save()
            Transaction.objects.create(product=product, quantity=1, total_amount=product.price)
            return Response({'success': True, 'remaining_stock': product.stock})
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)


@api_view(['GET'])
def analytics(request):
    cached = cache.get('analytics_data')
    if cached:
        return Response(cached)
    thirty_days_ago = timezone.now() - timedelta(days=30)
    daily_revenue = (
        Transaction.objects
        .filter(created_at__gte=thirty_days_ago)
        .annotate(date=TruncDate('created_at'))
        .values('date')
        .annotate(revenue=Sum('total_amount'))
        .order_by('date')
    )
    top_products = (
        Transaction.objects
        .values('product__name')
        .annotate(total_revenue=Sum('total_amount'))
        .order_by('-total_revenue')[:5]
    )
    data = {
        'daily_revenue': [{'date': str(i['date']), 'revenue': float(i['revenue'])} for i in daily_revenue],
        'top_products': [{'name': i['product__name'], 'revenue': float(i['total_revenue'])} for i in top_products],
    }
    cache.set('analytics_data', data, 300)
    return Response(data)


@api_view(['POST'])
def checkout(request):
    items = request.data.get('items', [])
    total_amount = request.data.get('total_amount', 0)
    if not items:
        return Response({'error': 'Cart is empty'}, status=400)
    try:
        with transaction.atomic():
            order = Order.objects.create(total_amount=total_amount)
            for item in items:
                product = Product.objects.select_for_update().get(id=item['product_id'])
                if product.stock < item['quantity']:
                    raise ValueError(f"Not enough stock for {product.name}")
                product.stock -= item['quantity']
                product.save()
                OrderItem.objects.create(order=order, product=product, quantity=item['quantity'], price=product.price)
                Transaction.objects.create(product=product, quantity=item['quantity'], total_amount=product.price * item['quantity'])
            return Response({'success': True, 'order_id': order.id, 'total': float(order.total_amount)})
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)
    except ValueError as e:
        return Response({'error': str(e)}, status=400)


@api_view(['GET'])
def products(request):
    prods = Product.objects.filter(stock__gt=0).values('id', 'name', 'price', 'stock')
    return Response(list(prods))