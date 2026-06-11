import httpx
import uuid

BASE_URL = "http://localhost"

print("==================================================")
print("     STARTING COMPREHENSIVE ENDPOINT CHECK        ")
print("==================================================")

# Generate a unique user for testing
test_email = f"endpoint-check-{uuid.uuid4().hex[:6]}@example.com"
test_password = "PasswordStrong123!"
test_name = "Endpoint Tester"

# 1. Register User
print("\n[1] Testing POST /auth/register...")
r = httpx.post(f"{BASE_URL}/auth/register", json={
    "email": test_email,
    "password": test_password,
    "full_name": test_name
})
assert r.status_code == 201, f"Failed: {r.text}"
user_id = r.json()["user_id"]
print("Success! Created User ID:", user_id)

# 2. Login User
print("\n[2] Testing POST /auth/login...")
r = httpx.post(f"{BASE_URL}/auth/login", data={
    "username": test_email,
    "password": test_password
})
assert r.status_code == 200, f"Failed: {r.text}"
token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print("Success! Access token retrieved.")

# 3. Get /auth/me
print("\n[3] Testing GET /auth/me...")
r = httpx.get(f"{BASE_URL}/auth/me", headers=headers)
assert r.status_code == 200, f"Failed: {r.text}"
print("Success! Profile email:", r.json()["email"])

# 4. Put /auth/me/profile
print("\n[4] Testing PUT /auth/me/profile...")
r = httpx.put(f"{BASE_URL}/auth/me/profile", json={
    "full_name": "Updated Endpoint Tester"
}, headers=headers)
assert r.status_code == 200, f"Failed: {r.text}"
print("Success! Updated name:", r.json()["full_name"])

# 5. Get /team
print("\n[5] Testing GET /team...")
r = httpx.get(f"{BASE_URL}/team")
assert r.status_code == 200, f"Failed: {r.text}"
print("Success! Team members:", [m["name"] for m in r.json()["members"]])

# 6. Get /health & /auth/health
print("\n[6] Testing GET /health & /auth/health...")
r1 = httpx.get(f"{BASE_URL}/health")
r2 = httpx.get(f"{BASE_URL}/auth/health")
assert r1.status_code == 200, f"Failed /health: {r1.text}"
assert r2.status_code == 200, f"Failed /auth/health: {r2.text}"
print("Success! System Status is Healthy.")

# 7. Get /books
print("\n[7] Testing GET /books...")
r = httpx.get(f"{BASE_URL}/books")
assert r.status_code == 200, f"Failed: {r.text}"
print("Success! Total books in catalog:", r.json()["total"])

# 8. Get /fines
print("\n[8] Testing GET /fines...")
r = httpx.get(f"{BASE_URL}/fines", headers=headers)
assert r.status_code == 200, f"Failed: {r.text}"
print("Success! Fines list retrieved.")

print("\n==================================================")
print("     ALL CHECKED ENDPOINTS OPERATIONAL!           ")
print("==================================================")
