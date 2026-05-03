# Micronsoft POS - Software Engineering Internship Assessment

A full-stack Point of Sale system built with Django REST Framework + React.js + MySQL.

## Tech Stack
- Backend: Python (Django REST Framework)
- Frontend: React.js
- Database: MySQL


## How to Set Up and Run Locally

### Requirements
- Python 3.x
- Node.js
- MySQL (WAMP)

### 1. Clone the repository
git clone https://github.com/Thushi2006/micronsoft_pos.git
cd micronsoft-pos

### 2. Create the database
Open phpMyAdmin at http://localhost/phpmyadmin
Create a database called: micronsoft_pos

### 3. Backend Setup
cd micronsoft-pos
python -m venv venv
venv\Scripts\activate
pip install django djangorestframework django-cors-headers mysqlclient
cd backend
python manage.py makemigrations
python manage.py migrate
python manage.py runserver

### 4. Frontend Setup
Open a second terminal:
cd frontend
npm install
npm start

### 5. Open the app
http://localhost:3000


## How to Run the Data Population Script

This creates 8 products and 100,000 transactions:

cd backend
python populate_data.py


## Challenge Solutions

### Challenge 1 — High Concurrency
Used select_for_update() inside transaction.atomic() to place a row-level
lock on the product row during purchase. This means concurrent requests
queue up and wait instead of all reading the same stock value simultaneously.
This prevents stock from ever going below zero even with 500+ concurrent requests.

To test concurrency:
cd backend
python load_test.py

Expected result:
Firing 100 concurrent requests...
=== Results ===
Successful  : 50
Out of stock: 50
Errors      : 0
Total       : 100

### Challenge 2 — Big Data Query Optimization
Used Django ORM aggregation with annotate() and Sum() to generate a single
optimized SQL GROUP BY query instead of loading all 100,000 records into Python.
Added database indexes on created_at and product columns for fast lookups.
Results are cached for 5 minutes using Django's cache framework, ensuring
API response times well under 500ms despite 100k records.

Test it: http://127.0.0.1:8000/api/analytics/

### Challenge 3 — POS Transactional Integrity
Used transaction.atomic() to wrap the entire order creation process.
If any single item fails to save (e.g. out of stock, database error),
Django automatically rolls back ALL changes made in that block.
This ensures no partial orders are ever saved to the database.

Test it: http://localhost:3000



## API Endpoints

| Method | Endpoint | Description |
| GET | /api/products/ | List all products |
| POST | /api/purchase/ | Purchase single item (concurrency safe) |
| GET | /api/analytics/ | Daily revenue + top 5 products |
| POST | /api/checkout/ | POS checkout with atomic transaction |



## Load Test Results
- 100 concurrent requests fired simultaneously
- Zero errors
- Stock integrity maintained throughout

