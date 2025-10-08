Admin creation endpoint

A protected endpoint is available to allow an existing admin to create other users (including admins).

Endpoint: POST /api/auth/register/admin

- Protected: requires a valid JWT token from an admin user (send cookie `token` or Authorization: Bearer <token>)
- Body JSON:
  {
  "nombre": "Admin",
  "apellido": "User",
  "email": "admin@example.com",
  "password": "someStrongPassword",
  "admin": true
  }

Behavior:

- The endpoint checks the requester is authenticated and has `admin: true`.
- If allowed, it creates the user and sets `admin` according to the body (true/false).
- Only existing admins can set `admin: true` on new users.

Testing with curl (assuming BACKEND runs on http://localhost:4000):

# First, login as existing admin to obtain cookie

curl -i -c cookiejar.txt -X POST -H "Content-Type: application/json" -d '{"email":"existing@admin.com","password":"password"}' http://localhost:4000/api/auth/login

# Then create new admin using saved cookie

curl -i -b cookiejar.txt -X POST -H "Content-Type: application/json" -d '{"nombre":"New","apellido":"Admin","email":"newadmin@example.com","password":"pass","admin":true}' http://localhost:4000/api/auth/register/admin

Notes:

- Ensure the backend's JWT secret and cookie settings are properly configured in env.
- This endpoint is rate-limited by express-rate-limit (same limits as /register and /login).
