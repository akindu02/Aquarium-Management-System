# 🎯 Role-Based Authentication Implementation - Quick Start Guide

## ✅ What Has Been Implemented

### Backend (Already Complete)
- ✅ User roles in database (admin, staff, supplier, customer)
- ✅ JWT tokens include user role
- ✅ Login API returns role in response
- ✅ Authorization middleware for role-based access control
- ✅ Multiple middleware functions (adminOnly, staffOnly, etc.)

### Frontend (New Implementation)
- ✅ Authentication utilities (token management, role checking)
- ✅ API utilities (login, register, logout)
- ✅ Protected route component (route guards)
- ✅ Redirect component (prevents logged-in users from accessing login/signup)
- ✅ Shared dashboard layout (responsive, role-aware)
- ✅ 4 role-specific dashboards:
  - Admin Dashboard (`/admin`)
  - Staff Dashboard (`/staff`)
  - Supplier Dashboard (`/supplier`)
  - Customer Dashboard (`/customer`)
- ✅ Updated sign-in flow with role-based redirection
- ✅ Route configuration with proper protection

## 🚀 How It Works

### Login Flow:
```
1. User enters credentials at /signin
2. Frontend calls API: loginAPI(email, password)
3. Backend verifies credentials and returns:
   - accessToken (JWT with role inside)
   - refreshToken
   - user object (with role field)
4. Frontend saves all data to localStorage
5. Frontend determines dashboard route based on role
6. User is redirected to their role-specific dashboard
```

### Route Protection:
```
1. User tries to access protected route (e.g., /admin)
2. ProtectedRoute component checks:
   a. Is user authenticated? (token exists)
   b. Does user have required role?
3. If yes → Show dashboard
4. If not authenticated → Redirect to /signin
5. If wrong role → Show 403 Access Denied page
```

### Backend Authorization:
```
1. Frontend makes API request with token
2. authenticate middleware verifies token
3. authorize middleware checks user role
4. If authorized → Process request
5. If not → Return 403 Forbidden
```

## 📁 New Files Created

### Frontend
```
src/
├── utils/
│   ├── auth.js                    # Authentication utilities
│   └── api.js                     # API request utilities
├── components/
│   ├── ProtectedRoute.jsx         # Route guard
│   ├── RedirectIfAuthenticated.jsx # Redirect logged-in users
│   └── DashboardLayout.jsx        # Shared dashboard layout
└── pages/
    ├── AdminDashboard.jsx         # Admin portal
    ├── StaffDashboard.jsx         # Staff portal
    ├── SupplierDashboard.jsx      # Supplier portal
    └── CustomerDashboard.jsx      # Customer portal
```

### Backend (Helper Scripts)
```
Backend/
└── scripts/
    └── createTestUsers.js         # Script to create test users
```

### Documentation
```
Root/
├── ROLE_BASED_AUTH.md            # Detailed implementation guide
└── QUICK_START.md                # This file
```

## 🧪 Testing the Implementation

### Step 1: Create Test Users

Run this command in the Backend directory:
```bash
cd Backend
node scripts/createTestUsers.js
```

This creates 4 test users:
- `admin@test.com` / `password123` (Admin)
- `staff@test.com` / `password123` (Staff)
- `supplier@test.com` / `password123` (Supplier)
- `customer@test.com` / `password123` (Customer)

### Step 2: Start the Servers

**Terminal 1 - Backend:**
```bash
cd Backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
```

### Step 3: Test Login & Redirection

1. Open browser to `http://localhost:5173/signin`
2. Login with `admin@test.com` / `password123`
3. You should be redirected to `/admin` (Admin Dashboard)
4. Logout using the sidebar button
5. Login with `customer@test.com` / `password123`
6. You should be redirected to `/customer` (Customer Dashboard)

### Step 4: Test Route Protection

1. While logged in as a customer, try to access `/admin` in the URL
2. You should see "403 Access Denied" page
3. Try typing `/staff`, `/supplier` - same result
4. Only `/customer` should work

### Step 5: Test Logout

1. Click the logout button in the sidebar
2. You should be redirected to `/signin`
3. Try accessing `/customer` again
4. You should be redirected to `/signin` (not logged in)

## 🔐 Security Features

| Feature | Description |
|---------|-------------|
| **JWT Tokens** | Secure, signed tokens with role embedded |
| **Route Guards** | Prevent unauthorized route access |
| **Role Validation** | Both frontend and backend verify roles |
| **Auto-Redirect** | Logged-in users can't access login page |
| **403 Handling** | Clear error for wrong role access |
| **Token in Headers** | API requests include Bearer token |
| **Active Account Check** | Backend verifies account is active |

## 🎨 Dashboard Features

Each dashboard has:
- **Role-specific icon and color** - Visual identity per role
- **User profile display** - Shows name and role
- **Collapsible sidebar** - Better mobile experience
- **Role-specific cards** - Different features per role
- **Logout button** - Easy session termination
- **Responsive design** - Works on all screen sizes

### Admin Dashboard Features:
- User Management
- System Analytics
- System Settings
- Inventory Overview

### Staff Dashboard Features:
- Order Processing
- Customer Support
- Inventory Checking
- Daily Tasks

### Supplier Dashboard Features:
- Purchase Orders
- Product Catalog
- Payment Tracking
- Customer Reviews

### Customer Dashboard Features:
- My Orders
- My Aquariums
- Wishlist
- Support Tickets

## 🔧 API Endpoints

### Public (No Auth Required)
- `POST /api/auth/register` - Create new account (defaults to customer)
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/refresh-token` - Refresh access token

### Protected (Auth Required)
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout current session
- `POST /api/auth/logout-all` - Logout all sessions

### Protected with Role Authorization (Examples)
```javascript
// Admin only
router.get('/admin/users', authenticate, adminOnly, handler);

// Staff or Admin
router.get('/orders', authenticate, staffOrAdmin, handler);

// Multiple roles
router.get('/data', authenticate, authorize('admin', 'staff'), handler);
```

## 🎯 Key Functions

### Authentication Utilities (`utils/auth.js`)
```javascript
saveAuthData(token, refresh, user)  // Save login data
getAccessToken()                     // Get current token
getUserRole()                        // Get user role
isAuthenticated()                    // Check if logged in
clearAuthData()                      // Logout
getDashboardRoute(role)              // Get dashboard URL for role
hasRole(role)                        // Check specific role
```

### API Utilities (`utils/api.js`)
```javascript
loginAPI(email, password)            // Login
registerAPI(userData)                // Register
logoutAPI(refreshToken)              // Logout
getProfileAPI()                      // Get profile
apiRequest(endpoint, options)        // Generic API call
```

## 📱 Responsive Design

The dashboards are fully responsive:
- **Desktop (>768px)**: Full sidebar (280px wide)
- **Mobile (<768px)**: Overlay sidebar (toggle button)
- **All devices**: Touch-friendly buttons and cards
- **Dark theme**: Premium glassmorphism design

## 🚨 Common Issues & Solutions

### Issue: "Cannot read property 'role' of null"
**Solution:** User data not saved properly. Check if login API returns user object.

### Issue: Redirected to login immediately after signing in
**Solution:** Check if token is being saved to localStorage correctly.

### Issue: Can access wrong dashboard by typing URL
**Solution:** Make sure ProtectedRoute component is wrapping the dashboard routes.

### Issue: API returns 401 Unauthorized
**Solution:** Check if token is being sent in Authorization header.

### Issue: API returns 403 Forbidden
**Solution:** User doesn't have required role. Check user role in database.

## 🔄 Extending the System

### Add a New Role:

1. **Database:** Add new role to users table
2. **Backend:** Update role validation if needed
3. **Frontend:**
   - Create new dashboard page (e.g., `ManagerDashboard.jsx`)
   - Add route in `App.jsx` with `ProtectedRoute`
   - Update `getDashboardRoute()` in `utils/auth.js`
   - Add role config in `DashboardLayout.jsx`

### Add Role-Specific Features:

1. **Backend:** Add API endpoint with role middleware
   ```javascript
   router.get('/manager/reports', 
     authenticate, 
     authorize('manager'), 
     controller.getReports
   );
   ```

2. **Frontend:** Add feature to dashboard
   ```jsx
   // In ManagerDashboard.jsx
   <DashboardCard 
     icon="📊"
     title="Reports"
     onClick={() => fetchReports()}
   />
   ```

## 📚 Next Steps

1. ✅ **Test all roles** - Login with each test user
2. ✅ **Test route protection** - Try accessing wrong dashboards
3. ⬜ **Add more features** - Build out each dashboard
4. ⬜ **Add refresh token flow** - Auto-refresh expired tokens
5. ⬜ **Add role management UI** - Let admins change user roles
6. ⬜ **Add audit logging** - Track role-based actions
7. ⬜ **Deploy to production** - Set proper JWT secrets

## 💡 Tips

- **Development:** Use the test users for quick testing
- **Production:** Change all passwords and JWT secrets
- **Security:** Consider httpOnly cookies instead of localStorage
- **UX:** Add loading states and better error messages
- **Performance:** Implement token refresh before expiration
- **Analytics:** Track which roles use which features

## 📞 Support

For detailed documentation, see:
- `ROLE_BASED_AUTH.md` - Complete technical documentation
- Backend middleware files - Implementation details
- Frontend component files - Usage examples

---

**🎉 You're all set!** The role-based authentication and authorization system is now fully implemented and ready to use.
