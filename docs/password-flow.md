# Password Handling Flow

## Proper Sequence for Password Security

```
1. CLIENT INPUT
   ↓
2. VALIDATION (Joi Middleware)
   - Check password format (8-20 chars, at least one letter)
   - Validate other fields (email, username, etc.)
   ↓
3. BUSINESS LOGIC (Controller)
   - Check if user exists
   - Prepare user data
   ↓
4. PASSWORD HASHING (Model Hook)
   - Hash password with bcrypt (10 salt rounds)
   - Store hashed password in database
   ↓
5. DATABASE STORAGE
   - Save user with hashed password
   ↓
6. RESPONSE
   - Return user data (password excluded)
```

## Security Features

### ✅ Validation First
- Joi validates password format before any processing
- Prevents invalid passwords from reaching hashing stage
- Clear error messages for users

### ✅ Hashing After Validation
- Only valid passwords get hashed
- Uses bcrypt with 10 salt rounds
- Automatic hashing via Sequelize hooks

### ✅ Secure Storage
- Only hashed passwords stored in database
- Plain text passwords never saved
- Salt automatically included in hash

### ✅ Secure Retrieval
- Passwords excluded from API responses
- `user.toJSON()` method removes password
- `attributes: { exclude: ['password'] }` in queries

## Code Flow Example

```javascript
// 1. Client sends request
POST /api/users/register
{
  "username": "john_doe",
  "email": "john@example.com", 
  "password": "MySecurePass123!",
  "fullName": "John Doe"
}

// 2. Joi validation middleware
validateUserRegistration(req, res, next)
// ✅ Validates password format
// ✅ Validates other fields

// 3. Controller processes
createUser(req, res)
// ✅ Checks for existing user
// ✅ Prepares user data

// 4. Model hook hashes password
User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
})

// 5. Database stores hashed password
// password: "$2b$10$hashedPasswordHere..."

// 6. Response excludes password
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "John Doe"
    // password field is excluded
  }
}
```

## Login Flow

```javascript
// 1. Client sends login request
POST /api/users/login
{
  "email": "john@example.com",
  "password": "MySecurePass123!"
}

// 2. Find user by email
const user = await User.findOne({ where: { email } });

// 3. Compare password with hash
const isValid = await user.comparePassword(password);
// Uses bcrypt.compare() internally

// 4. Return user data (no password)
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
    // password excluded
  }
}
``` 