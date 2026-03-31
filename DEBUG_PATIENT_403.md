# Patient 403 Forbidden Error - Debugging & Fixes

## 🔍 **Issue Identified**

Patients are getting **403 Forbidden** errors when accessing:
- `/api/patient/stats`
- `/api/requests/my-requests` 
- `/api/bookings/tests/book`
- `/api/bookings/tests/types`

## 🔧 **Debugging Added**

### **1. StatsController.js**
```javascript
// Added detailed logging
console.log('Patient stats request - User role:', req.user.role, 'User ID:', req.user.id);
console.log('Access denied - role mismatch. Expected: patient, Got:', req.user.role);
```

### **2. BloodRequestController.js**
```javascript
// Added logging for request tracking
console.log('Getting my requests for user:', req.user.id, 'Role:', req.user.role);
console.log('Found requests:', requests.length);
```

### **3. roleMiddleware.js**
```javascript
// Added comprehensive role debugging
console.log('Role check:', {
  userRole,
  allowedRoles,
  normalized,
  hasAccess: normalized.includes(userRole)
});
```

## 🎯 **Expected Console Output**

When patient logs in and tries to access dashboard, you should see:

```
Role check: {
  userRole: 'patient',
  allowedRoles: ['patient', 'donor'],
  normalized: ['patient', 'donor'],
  hasAccess: true
}

Patient stats request - User role: patient, User ID: 69ca148fbf13d10ec0fd99cf
Patient stats calculated: {
  activeRequests: 0,
  donorsFound: 12,
  nearbyCenters: 3
}

Getting my requests for user: 69ca148fbf13d10ec0fd99cf, Role: patient
Found requests: 0
```

## 🚨 **If Still Getting 403**

### **Check These:**

1. **JWT Token Content:**
```javascript
// In browser console
const token = localStorage.getItem('token');
const decoded = jwt.decode(token);
console.log('Decoded token:', decoded);
```

2. **User Role in Database:**
```javascript
// Check MongoDB directly
db.users.findOne({email: "patient2@gmail.com"})
```

3. **Headers Being Sent:**
```javascript
// Check Network tab in DevTools
// Look for Authorization header
// Should be: "Bearer [token]"
```

## 🔧 **Potential Root Causes**

### **1. Role Case Sensitivity**
- **Fixed:** Added `.toLowerCase()` to all role comparisons
- **Check:** Database role vs JWT token role

### **2. Missing User Object**
- **Fixed:** Added proper error handling
- **Check:** `req.user` exists in middleware chain

### **3. Token Format Issues**
- **Check:** Token starts with "Bearer "
- **Check:** Token is valid JWT

## 📋 **Next Steps**

1. **Restart Backend** to apply debugging changes
2. **Login as Patient** and check console logs
3. **Check Network Tab** for request headers
4. **Verify Database** user role field

## 🎯 **Expected Resolution**

After debugging, one of these will be revealed:
- **Role mismatch** in database vs token
- **Header format** issue
- **Middleware chain** problem
- **Token validation** failure

The debugging will pinpoint exact cause of 403 errors!
