# Password Reset Feature - Implementation Guide

## Overview
This document describes the complete password reset feature implementation with email-based OTP verification for the Aquarium Management System.

## Features Implemented

### 1. **Backend Implementation**

#### A. Email Service (`utils/emailService.js`)
- Nodemailer integration for sending emails via SMTP
- Beautiful HTML email templates
- Two email types:
  - **Password Reset Email**: Sends 6-digit OTP with expiration notice
  - **Confirmation Email**: Confirms successful password reset

#### B. Auth Service (`services/authService.js`)
Added three new methods:
- `requestPasswordReset(email)`: Generates and sends 6-digit OTP
- `verifyResetToken(email, token)`: Validates OTP
- `resetPassword(email, token, newPassword)`: Resets password

**Security Features:**
- 6-digit numeric OTP
- 15-minute expiration time
- Email enumeration prevention
- One-time token usage
- Automatic session invalidation after password reset

#### C. Auth Controller (`controllers/authController.js`)
Added three new endpoints:
- `requestPasswordReset`: POST /api/auth/forgot-password
- `verifyResetToken`: POST /api/auth/verify-reset-token
- `resetPassword`: POST /api/auth/reset-password

#### D. Routes (`routes/authRoutes.js`)
Added validation and routes for all three password reset endpoints

### 2. **Frontend Implementation**

#### A. API Utilities (`src/utils/api.js`)
Added three API functions:
- `forgotPasswordAPI(email)`: Request OTP
- `verifyResetTokenAPI(email, token)`: Verify OTP
- `resetPasswordAPI(email, token, newPassword)`: Reset password

#### B. Updated Pages:
1. **ForgotPassword.jsx**
   - Email input form
   - Backend API integration
   - Success/error message display

2. **VerifyOtp.jsx**
   - 6-digit OTP input
   - Real-time OTP verification
   - Resend OTP functionality
   - Success/error message display

3. **ResetPassword.jsx**
   - New password input with confirmation
   - Password validation (min 8 characters)
   - Backend API integration

4. **PasswordResetSuccess.jsx**
   - Already existed, no changes needed

## Configuration

### Backend Setup

1. **Install Dependencies:**
   ```bash
   cd Backend
   npm install nodemailer
   ```

2. **Environment Variables (.env):**
   Add the following to your `.env` file:
   ```env
   # Email Configuration (Gmail SMTP)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-gmail-app-password
   EMAIL_FROM=Aquarium Management <your-email@gmail.com>

   # Frontend URL
   FRONTEND_URL=http://localhost:5173
   ```

3. **Gmail App Password Setup:**
   - Go to Google Account Settings
   - Security → 2-Step Verification (must be enabled)
   - App Passwords → Generate new app password
   - Copy the 16-character password to `EMAIL_PASSWORD` in `.env`

### Database Schema
The `password_reset_tokens` table already exists in `schema.sql`:
```sql
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### 1. Request Password Reset
**POST** `/api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If the email exists, a password reset code has been sent."
}
```

### 2. Verify Reset Token
**POST** `/api/auth/verify-reset-token`

**Request Body:**
```json
{
  "email": "user@example.com",
  "token": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reset code verified successfully.",
  "userId": 1
}
```

### 3. Reset Password
**POST** `/api/auth/reset-password`

**Request Body:**
```json
{
  "email": "user@example.com",
  "token": "123456",
  "newPassword": "newSecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password has been reset successfully. Please login with your new password."
}
```

## User Flow

1. **User clicks "Forgot Password"** → Navigates to `/forgot-password`
2. **User enters email** → Backend sends 6-digit OTP via email
3. **User redirected to OTP page** → `/verify-otp`
4. **User enters OTP** → Backend validates token
5. **If valid** → User redirected to `/reset-password`
6. **User sets new password** → Backend updates password
7. **Success** → User redirected to `/password-reset-success`
8. **User can login** → Navigates to `/signin`

## Security Features

1. **Email Enumeration Prevention**: Always returns success message
2. **OTP Expiration**: 15-minute validity
3. **One-Time Use**: Token marked as used after successful reset
4. **Session Invalidation**: All refresh tokens deleted after password reset
5. **Password Strength**: Minimum 8 characters enforced
6. **Rate Limiting**: Should be added in production

## Testing

### Manual Testing Steps

1. **Start Backend Server:**
   ```bash
   cd Backend
   npm run dev
   ```

2. **Start Frontend Server:**
   ```bash
   cd Frontend
   npm run dev
   ```

3. **Test Flow:**
   - Navigate to `http://localhost:5173/forgot-password`
   - Enter a registered email address
   - Check your email for the OTP
   - Enter the 6-digit code
   - Set a new password (min 8 characters)
   - Verify success message
   - Test login with new password

### Common Issues

1. **Email not sending:**
   - Verify Gmail app password is correct
   - Check 2-Step Verification is enabled
   - Verify EMAIL_USER and EMAIL_PASSWORD in .env

2. **OTP expired:**
   - OTP is valid for 15 minutes only
   - Use resend functionality to get a new code

3. **Database error:**
   - Ensure `password_reset_tokens` table exists
   - Run database migrations if needed

## Future Enhancements

1. **Rate Limiting**: Prevent abuse by limiting requests per IP/email
2. **SMS OTP**: Alternative to email OTP
3. **Password History**: Prevent reusing recent passwords
4. **Account Lockout**: Temporary lock after multiple failed attempts
5. **Audit Logging**: Track password reset attempts

## Files Modified/Created

### Backend:
- ✅ `utils/emailService.js` (NEW)
- ✅ `services/authService.js` (MODIFIED)
- ✅ `controllers/authController.js` (MODIFIED)
- ✅ `routes/authRoutes.js` (MODIFIED)
- ✅ `.env` (MODIFIED)
- ✅ `package.json` (MODIFIED - added nodemailer)

### Frontend:
- ✅ `src/utils/api.js` (MODIFIED)
- ✅ `src/pages/ForgotPassword.jsx` (MODIFIED)
- ✅ `src/pages/VerifyOtp.jsx` (MODIFIED)
- ✅ `src/pages/ResetPassword.jsx` (MODIFIED)

## Support

For issues or questions, please refer to:
- Backend README: `Backend/README.md`
- Role-based Auth: `ROLE_BASED_AUTH.md`


---

**Implementation Date**: 2026-01-26  
**Version**: 1.0.0  
**Status**: ✅ Complete
