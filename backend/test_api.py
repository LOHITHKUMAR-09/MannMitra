"""
test_api.py — End-to-end tests for all auth endpoints.
Run while the server is up:  python test_api.py
"""
import sys, json, urllib.request, urllib.error
sys.stdout.reconfigure(encoding='utf-8')

BASE = "http://localhost:8000"
results = []

def call(method, path, body=None, token=None):
    url = BASE + path
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())

def check(label, status, body, expect_status, expect_keys=None):
    ok = (status == expect_status)
    if ok and expect_keys:
        ok = all(k in body for k in expect_keys)
    tag = "PASS" if ok else "FAIL"
    results.append(ok)
    print(f"  [{tag}] {label}")
    preview = json.dumps(body)[:110]
    print(f"         HTTP {status} -> {preview}")
    return body

print("\nMannMitra API -- Endpoint Tests")
print(f"Target: {BASE}\n")

# 1. Health check
print("[1] GET /health")
s, b = call("GET", "/health")
check("GET /health -> 200 + status:ok", s, b, 200, ["status"])

# 2. Register new user
print("\n[2] POST /api/auth/register")
s, b = call("POST", "/api/auth/register", {
    "email": "test_runner@mannmitra.dev",
    "password": "TestPass@1234",
    "display_name": "Test Runner"
})
token = b.get("access_token") if s in (200, 201) else None
check("Register new user -> 201 + access_token + user", s, b, 201, ["access_token", "user"])

# 3. Register same email again -> 409
print("\n[3] POST /api/auth/register (duplicate) -> 409")
s, b = call("POST", "/api/auth/register", {
    "email": "test_runner@mannmitra.dev",
    "password": "TestPass@1234",
    "display_name": "Test Runner"
})
check("Duplicate email -> 409 Conflict", s, b, 409)

# 4. Login correct credentials
print("\n[4] POST /api/auth/login (correct password)")
s, b = call("POST", "/api/auth/login", {
    "email": "test_runner@mannmitra.dev",
    "password": "TestPass@1234"
})
if s == 200:
    token = b.get("access_token")
check("Login correct -> 200 + access_token", s, b, 200, ["access_token", "user"])

# 5. Login wrong password -> 401
print("\n[5] POST /api/auth/login (wrong password) -> 401")
s, b = call("POST", "/api/auth/login", {
    "email": "test_runner@mannmitra.dev",
    "password": "WrongPassword!999"
})
check("Wrong password -> 401", s, b, 401)

# 6. Login unknown email -> 401
print("\n[6] POST /api/auth/login (unknown email) -> 401")
s, b = call("POST", "/api/auth/login", {
    "email": "ghost@mannmitra.dev",
    "password": "Whatever@1234"
})
check("Unknown email -> 401", s, b, 401)

# 7. GET /me with valid token
print("\n[7] GET /api/auth/me (valid token)")
s, b = call("GET", "/api/auth/me", token=token)
check("GET /me valid token -> 200 + id/email/display_name", s, b, 200, ["id", "email", "display_name"])

# 8. GET /me without token -> 401
print("\n[8] GET /api/auth/me (no token) -> 401")
s, b = call("GET", "/api/auth/me")
check("GET /me no token -> 401", s, b, 401)

# 9. GET /me bad token -> 401
print("\n[9] GET /api/auth/me (invalid token) -> 401")
s, b = call("GET", "/api/auth/me", token="not.a.real.jwt.token")
check("GET /me bad token -> 401", s, b, 401)

# 10. Login as hardcoded demo user
print("\n[10] POST /api/auth/login (seeded demo user)")
s, b = call("POST", "/api/auth/login", {
    "email": "demo@mannmitra.dev",
    "password": "Demo@1234"
})
check("Login demo@mannmitra.dev -> 200", s, b, 200, ["access_token"])

# 11. Login as seeded student
print("\n[11] POST /api/auth/login (seeded student)")
s, b = call("POST", "/api/auth/login", {
    "email": "student1@mannmitra.dev",
    "password": "Student@1234"
})
check("Login student1@mannmitra.dev -> 200", s, b, 200, ["access_token"])

# 12. Register with short password -> 422 validation error
print("\n[12] POST /api/auth/register (password too short) -> 422")
s, b = call("POST", "/api/auth/register", {
    "email": "short@mannmitra.dev",
    "password": "123",
    "display_name": "Short"
})
check("Short password -> 422 Unprocessable Entity", s, b, 422)

# Summary
passed = sum(results)
total  = len(results)
print(f"\n{'='*50}")
print(f"Results: {passed}/{total} passed")
if passed == total:
    print("All endpoints working correctly.")
else:
    print(f"{total - passed} test(s) FAILED -- check output above.")
    sys.exit(1)
print()
