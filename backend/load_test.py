import threading
import requests

URL = "http://127.0.0.1:8000/api/purchase/"
results = {"success": 0, "out_of_stock": 0, "error": 0}
lock = threading.Lock()

def make_purchase():
    try:
        r = requests.post(URL, json={"product_id": 1}, timeout=10)
        data = r.json()
        with lock:
            if r.status_code == 200:
                results["success"] += 1
            elif "Out of stock" in data.get("error", ""):
                results["out_of_stock"] += 1
            else:
                results["error"] += 1
    except Exception:
        with lock:
            results["error"] += 1

print("Firing 100 concurrent requests...")
threads = [threading.Thread(target=make_purchase) for _ in range(100)]
for t in threads: t.start()
for t in threads: t.join()

print(f"\n=== Results ===")
print(f"Successful  : {results['success']}")
print(f"Out of stock: {results['out_of_stock']}")
print(f"Errors      : {results['error']}")
print(f"Total       : {sum(results.values())} (should be 100)")