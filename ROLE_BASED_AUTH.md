# Role-Based Authentication & Authorization Implementation

This document describes the complete implementation of role-based authentication and authorization for the Aquarium Management System.

## Overview

The system now supports four distinct user roles:
- **Admin** - Full system access and management
- **Staff** - Operations and customer service
- **Supplier** - Product and order management
- **Customer** - Shopping and account management

## Backend Implementation

### 1. User Roles in Database
The `users` table includes a `role` column with the following values:
- `admin`
- `staff`
- `supplier`
- `customer`

### 2. JWT Token with Role
The JWT token payload includes:
```javascript
{
  userId: user.id,
  email: user.email,
  role: user.role  // <-- User role included
}
```

### 3. Login Response Structure
The login API (`/api/auth/login`) returns:
```javascript
{
  success: true,
  message: "Login successful",
  user: {
    id: 1,
    email: "user@example.com",
    firstName: "John",
    lastName: "Doe",
    role: "customer",  // <-- Role returned here
    phone: "1234567890",
    isActive: true,
    emailVerified: false,
    createdAt: "2026-01-21T..."
  },
  accessToken: "eyJhbGciOiJIUzI1NiIs...",
  refreshToken: "eyJhbGciOiJIUzI1NiIs..."
}
```

### 4. Authorization Middleware
Located in `Backend/middleware/authMiddleware.js`, provides:

- **`authenticate`** - Verifies JWT token and attaches user to request
- **`authorize(...roles)`** - Checks if user has any of the specified roles
- **`adminOnly`** - Only allows admin access
- **`staffOnly`** - Only allows staff access
- **`supplierOnly`** - Only allows supplier access
- **`customerOnly`** - Only allows customer access
- **`staffOrAdmin`** - Allows staff or admin access
- **`internalOnly`** - Allows admin and staff (employees only)
- **`externalOnly`** - Allows customers and suppliers only

#### Usage Example:
```javascript
// Protect route for admin only
router.get('/admin/users', authenticate, adminOnly, userController.getAllUsers);

// Protect route for staff or admin
router.get('/orders', authenticate, staffOrAdmin, orderController.getOrders);

// Protect route for specific roles
router.get('/dashboard', authenticate, authorize('admin', 'staff'), dashboardController.getDashboard);
```

## Frontend Implementation

### 1. Authentication Utilities (`src/utils/auth.js`)

Provides functions for managing authentication state:

- **`saveAuthData(accessToken, refreshToken, user)`** - Save tokens and user data to localStorage
- **`getAccessToken()`** - Retrieve access token
- **`getRefreshToken()`** - Retrieve refresh token
- **`getUserData()`** - Get user data object
- **`getUserRole()`** - Get current user's role
- **`isAuthenticated()`** - Check if user is logged in
- **`clearAuthData()`** - Clear all auth data (logout)
- **`getDashboardRoute(role)`** - Get dashboard route for a role
- **`hasRole(requiredRole)`** - Check if user has specific role
- **`hasAnyRole(requiredRoles)`** - Check if user has any of the roles

### 2. API Utilities (`src/utils/api.js`)

Provides API request functions:

- **`apiRequest(endpoint, options)`** - Make authenticated API request
- **`loginAPI(email, password)`** - Login API call
- **`registerAPI(userData)`** - Registration API call
- **`logoutAPI(refreshToken)`** - Logout API call
- **`getProfileAPI()`** - Get user profile
- **`refreshTokenAPI(refreshToken)`** - Refresh access token

### 3. Protected Route Component (`src/components/ProtectedRoute.jsx`)

A route guard component that:
1. Checks if user is authenticated
2. Verifies user has the required role
3. Redirects to login if not authenticated
4. Shows 403 Access Denied if role doesn't match

Usage:
```jsx
<Route 
  path="/admin" 
  element={
    <ProtectedRoute allowedRoles="admin">
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
```

### 4. Dashboard Layout (`src/components/DashboardLayout.jsx`)

A shared layout component for all dashboards featuring:
- Collapsible sidebar with role-specific styling
- User profile display
- Logout functionality
- Responsive design for mobile devices

Each role has its own configuration:
- Icon
- Title
- Color scheme

### 5. Role-Specific Dashboards

Four separate dashboard pages:

#### Admin Dashboard (`/admin`)
- User Management
- System Analytics
- System Settings
- Inventory Management

#### Staff Dashboard (`/staff`)
- Orders Processing
- Customer Support
- Inventory Checking
- Daily Tasks

#### Supplier Dashboard (`/supplier`)
- Purchase Orders
- Product Catalog
- Payment Tracking
- Customer Reviews

#### Customer Dashboard (`/customer`)
- My Orders
- My Aquariums
- Wishlist
- Support Tickets

### 6. Sign In Flow

The updated `SignIn.jsx` component:

1. User enters credentials
2. Calls `loginAPI(email, password)`
3. On success:
   - Saves `accessToken`, `refreshToken`, and `user` data to localStorage
   - Gets appropriate dashboard route based on user role
   - Redirects user to their role-specific dashboard
4. On error:
   - Displays error message to user

Example flow:
```
User logs in → Backend returns role → Frontend saves data → Redirect to role-based dashboard
```

### 7. Route Configuration (`src/App.jsx`)

Routes are organized into two categories:

**Public Routes** (with Navbar and Footer):
- `/` - Home page
- `/signup` - Sign up page
- `/signin` - Sign in page

**Protected Dashboard Routes** (without Navbar and Footer):
- `/admin` - Admin dashboard (admin only)
- `/staff` - Staff dashboard (staff only)
- `/supplier` - Supplier dashboard (supplier only)
- `/customer` - Customer dashboard (customer only)

## Security Features

### Frontend Security
1. **Route Protection** - Unauthorized users can't access protected routes
2. **Role Validation** - Users can't access other roles' dashboards even if they know the URL
3. **Token Storage** - Tokens stored in localStorage (consider httpOnly cookies for production)
4. **Automatic Redirect** - Unauthenticated users redirected to login

### Backend Security
1. **JWT Verification** - All protected routes verify JWT token
2. **Role-Based Authorization** - Middleware checks user role before allowing access
3. **Database Validation** - User data refreshed from database on each request
4. **Active Account Check** - Ensures user account is active before allowing access

## Testing the Implementation

### 1. Create Test Users

Run the migration to update user roles, or manually create users:

```sql
-- Admin user
INSERT INTO users (email, password, first_name, last_name, role) 
VALUES ('admin@test.com', '<hashed_password>', 'Admin', 'User', 'admin');

-- Staff user
INSERT INTO users (email, password, first_name, last_name, role) 
VALUES ('staff@test.com', '<hashed_password>', 'Staff', 'User', 'staff');

-- Supplier user
INSERT INTO users (email, password, first_name, last_name, role) 
VALUES ('supplier@test.com', '<hashed_password>', 'Supplier', 'User', 'supplier');

-- Customer user (default)
-- Use the signup form; new users default to customer role
```

### 2. Test Login Flow

1. Start the backend server: `cd Backend && npm start`
2. Start the frontend: `cd Frontend && npm run dev`
3. Navigate to `http://localhost:5173/signin`
4. Login with different role credentials
5. Verify you're redirected to the correct dashboard
6. Try accessing another role's dashboard via URL (should show Access Denied)

### 3. Test API Authorization

Try calling protected endpoints with different role tokens:

```bash
# Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}'

# Use returned token to access admin-only endpoint
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer <admin_token>"
```

## Future Enhancements

1. **Refresh Token Flow** - Automatically refresh access token when expired
2. **Role Permissions** - Granular permissions within each role
3. **Multi-Factor Authentication** - Add 2FA for sensitive roles
4. **Session Management** - Track and manage user sessions
5. **Audit Logging** - Log all role-based actions for security
6. **Role Hierarchy** - Allow admins to access all features
7. **Dynamic Navigation** - Show/hide menu items based on role

## File Structure

```
Backend/
├── middleware/
│   └── authMiddleware.js       # Authentication & authorization middleware
├── services/
│   └── authService.js          # Auth business logic (includes role in tokens)
├── controllers/
│   └── authController.js       # Auth HTTP handlers
└── routes/
    └── authRoutes.js           # Auth API routes

Frontend/
├── src/
│   ├── utils/
│   │   ├── auth.js            # Auth utility functions
│   │   └── api.js             # API request utilities
│   ├── components/
│   │   ├── ProtectedRoute.jsx # Route guard component
│   │   └── DashboardLayout.jsx# Shared dashboard layout
│   ├── pages/
│   │   ├── SignIn.jsx         # Login page with role-based redirect
│   │   ├── AdminDashboard.jsx
│   │   ├── StaffDashboard.jsx
│   │   ├── SupplierDashboard.jsx
│   │   └── CustomerDashboard.jsx
│   └── App.jsx                # Route configuration
```

## API Endpoints Reference

### Public Endpoints
- `POST /api/auth/register` - Register new user (defaults to customer)
- `POST /api/auth/login` - Login (returns role in response)
- `POST /api/auth/refresh-token` - Refresh access token

### Protected Endpoints (Require Authentication)
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout current session
- `POST /api/auth/logout-all` - Logout all sessions

## Environment Variables

Ensure these are set in `Backend/.env`:

```env
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
REFRESH_TOKEN_EXPIRES_IN=30d
```

## Conclusion

The system now has complete role-based authentication and authorization:
- ✅ Backend returns user role in JWT and response
- ✅ Frontend saves token and role in localStorage
- ✅ Role-based redirection after login
- ✅ Separate dashboards for each role
- ✅ Route protection preventing unauthorized access
- ✅ Backend API authorization middleware
- ✅ Same layout with role-specific content

Users are automatically sent to the correct portal based on their role, and the system prevents access to unauthorized areas both on the frontend and backend.
