"""
run_all.py — Starts server, runs all tests, prints results.
Run: python run_all.py
"""
import sys, os, time, json, urllib.request, urllib.error, subprocess, signal
sys.stdout.reconfigure(encoding='utf-8')

PYTHON = r"C:\Users\cheru\AppData\Local\Programs\Python\Python311\python.exe"
BASE   = "http://localhost:8000"

# ── helpers ───────────────────────────────────────────────────────────────────
def call(method, path, body=None, token=None):
    data    = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(BASE + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=8) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())

results = []
def check(label, status, body, expect_status, keys=None):
    ok = (status == expect_status) and (not keys or all(k in body for k in keys))
    results.append(ok)
    tag     = "PASS" if ok else "FAIL"
    preview = json.dumps(body)[:100]
    print(f"  [{tag}] {label}")
    print(f"         HTTP {status} -> {preview}")
    return body

# ── start server ──────────────────────────────────────────────────────────────
print("Starting FastAPI server...")
srv = subprocess.Popen(
    [PYTHON, "-m", "uvicorn", "app.main:app", "--port", "8000"],
    cwd=os.path.dirname(__file__),
    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
)

# wait for server to be ready
for i in range(15):
    time.sleep(1)
    try:
        urllib.request.urlopen(BASE + "/health", timeout=2)
        print(f"Server ready after {i+1}s\n")
        break
    except Exception:
        pass
else:
    print("ERROR: server did not start in 15s")
    srv.terminate()
    sys.exit(1)

token = None
try:
    print("=" * 52)
    print("MannMitra API -- Live Endpoint Tests")
    print("=" * 52)

    # 1. Health
    print("\n[1] GET /health")
    s, b = call("GET", "/health")
    check("GET /health -> 200", s, b, 200, ["status"])

    # 2. Register new user
    print("\n[2] POST /api/auth/register (new user)")
    s, b = call("POST", "/api/auth/register", {
        "email": "test_runner@mannmitra.dev",
        "password": "TestPass@1234",
        "display_name": "Test Runner"
    })
    if s in (200, 201): token = b.get("access_token")
    check("Register new user -> 201 + access_token", s, b, 201, ["access_token", "user"])

    # 3. Duplicate register -> 409
    print("\n[3] POST /api/auth/register (duplicate) -> 409")
    s, b = call("POST", "/api/auth/register", {
        "email": "test_runner@mannmitra.dev",
        "password": "TestPass@1234",
        "display_name": "Test Runner"
    })
    check("Duplicate email -> 409", s, b, 409)

    # 4. Login correct
    print("\n[4] POST /api/auth/login (correct)")
    s, b = call("POST", "/api/auth/login", {"email": "test_runner@mannmitra.dev", "password": "TestPass@1234"})
    if s == 200: token = b.get("access_token")
    check("Login correct -> 200 + access_token", s, b, 200, ["access_token", "user"])

    # 5. Login wrong password -> 401
    print("\n[5] POST /api/auth/login (wrong password) -> 401")
    s, b = call("POST", "/api/auth/login", {"email": "test_runner@mannmitra.dev", "password": "WrongPass!999"})
    check("Wrong password -> 401", s, b, 401)

    # 6. Login unknown email -> 401
    print("\n[6] POST /api/auth/login (unknown email) -> 401")
    s, b = call("POST", "/api/auth/login", {"email": "ghost@mannmitra.dev", "password": "Whatever@123"})
    check("Unknown email -> 401", s, b, 401)

    # 7. GET /me valid token
    print("\n[7] GET /api/auth/me (valid token)")
    s, b = call("GET", "/api/auth/me", token=token)
    check("GET /me valid token -> 200", s, b, 200, ["id", "email", "display_name"])

    # 8. GET /me no token -> 401
    print("\n[8] GET /api/auth/me (no token) -> 401")
    s, b = call("GET", "/api/auth/me")
    check("GET /me no token -> 401", s, b, 401)

    # 9. GET /me bad token -> 401
    print("\n[9] GET /api/auth/me (bad token) -> 401")
    s, b = call("GET", "/api/auth/me", token="not.a.jwt")
    check("GET /me bad token -> 401", s, b, 401)

    # 10. Login seeded demo user
    print("\n[10] POST /api/auth/login (demo@mannmitra.dev)")
    s, b = call("POST", "/api/auth/login", {"email": "demo@mannmitra.dev", "password": "Demo@1234"})
    check("Login demo user -> 200", s, b, 200, ["access_token"])

    # 11. Login seeded student1
    print("\n[11] POST /api/auth/login (student1@mannmitra.dev)")
    s, b = call("POST", "/api/auth/login", {"email": "student1@mannmitra.dev", "password": "Student@1234"})
    check("Login student1 -> 200", s, b, 200, ["access_token"])

    # 12. Short password -> 422
    print("\n[12] POST /api/auth/register (password too short) -> 422")
    s, b = call("POST", "/api/auth/register", {"email": "x@y.com", "password": "123", "display_name": "X"})
    check("Short password -> 422", s, b, 422)

finally:
    srv.terminate()
    print("\nServer stopped.")

# ── summary ───────────────────────────────────────────────────────────────────
passed, total = sum(results), len(results)
print(f"\n{'='*52}")
print(f"Results: {passed}/{total} passed")
if passed == total:
    print("ALL TESTS PASSED")
else:
    failed = [i+1 for i,r in enumerate(results) if not r]
    print(f"FAILED tests: {failed}")
    sys.exit(1)
