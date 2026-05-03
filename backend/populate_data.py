import os, sys, django, random
from datetime import timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.utils import timezone
from api.models import Product, Transaction

PRODUCTS = [
    ("Laptop", 999.99, 200),
    ("Mouse", 29.99, 500),
    ("Keyboard", 59.99, 400),
    ("Monitor", 349.99, 150),
    ("Headphones", 89.99, 300),
    ("USB Hub", 19.99, 600),
    ("Webcam", 79.99, 250),
    ("Desk Lamp", 34.99, 350),
]

print("Creating products...")
products = []
for name, price, stock in PRODUCTS:
    p, _ = Product.objects.get_or_create(
        name=name, defaults={'price': price, 'stock': stock}
    )
    products.append(p)
print(f"  {len(products)} products ready.")

print("Creating 100,000 transactions (this takes ~30 seconds)...")
batch = []
now = timezone.now()

for i in range(100_000):
    product = random.choice(products)
    qty = random.randint(1, 5)
    days_ago = random.randint(0, 180)
    t = Transaction(
        product=product,
        quantity=qty,
        total_amount=float(product.price) * qty,
        created_at=now - timedelta(
            days=days_ago,
            hours=random.randint(0, 23)
        ),
    )
    batch.append(t)
    if len(batch) == 5000:
        Transaction.objects.bulk_create(batch)
        batch = []
        print(f"  {i+1} records inserted...")

if batch:
    Transaction.objects.bulk_create(batch)

print("Done! 100,000 transactions created.")