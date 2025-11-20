# User Management System

## Database Structure

### Users Table
The `users` table contains all user information with the following fields:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `email` | VARCHAR(255) | Unique email address |
| `password_hash` | VARCHAR(255) | Hashed password (bcrypt) |
| `first_name` | VARCHAR(100) | User's first name |
| `last_name` | VARCHAR(100) | User's last name |
| `is_registered` | BOOLEAN | Whether user has registered account |
| `is_admin` | BOOLEAN | Whether user has admin privileges |
| `phone` | VARCHAR(20) | Phone number (optional) |
| `date_of_birth` | DATE | Date of birth (optional) |
| `location` | VARCHAR(255) | Location (optional) |
| `created_at` | TIMESTAMP | Account creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

### Related Tables
The following tables reference the `users` table with CASCADE DELETE:
- `user_training_progress` - Training program progress
- `user_achievements` - User achievements and badges
- `community_posts` - Community posts
- `community_post_comments` - Post comments
- `agent_conversations` - AI agent conversation history

## API Endpoints

### User Endpoints (Authenticated)
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update current user profile (registered only)
- `GET /api/users/stats` - Get user statistics (registered only)
- `GET /api/users/achievements` - Get user achievements (registered only)

### Admin Endpoints (Admin Only)
- `GET /api/admin/users` - List all users (with pagination and search)
  - Query params: `page`, `limit`, `search`
- `GET /api/admin/users/stats` - Get user statistics
- `GET /api/admin/users/:id` - Get user by ID
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `POST /api/admin/users/:id/reset-password` - Reset user password

## Usage Examples

### List All Users
```bash
curl -X GET "http://localhost:3001/api/admin/users?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Search Users
```bash
curl -X GET "http://localhost:3001/api/admin/users?search=john" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Get User by ID
```bash
curl -X GET "http://localhost:3001/api/admin/users/USER_ID" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Update User
```bash
curl -X PUT "http://localhost:3001/api/admin/users/USER_ID" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "isAdmin": false,
    "phone": "+1234567890"
  }'
```

### Delete User
```bash
curl -X DELETE "http://localhost:3001/api/admin/users/USER_ID" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Reset User Password
```bash
curl -X POST "http://localhost:3001/api/admin/users/USER_ID/reset-password" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "newSecurePassword123"
  }'
```

## Database Queries

### View All Users
```sql
SELECT id, email, first_name, last_name, is_registered, is_admin, created_at 
FROM users 
ORDER BY created_at DESC;
```

### User Statistics
```sql
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE is_registered = true) as registered_users,
  COUNT(*) FILTER (WHERE is_registered = false) as guest_users,
  COUNT(*) FILTER (WHERE is_admin = true) as admin_users
FROM users;
```

### Find User by Email
```sql
SELECT * FROM users WHERE email = 'user@example.com';
```

### Update User
```sql
UPDATE users 
SET first_name = 'John', last_name = 'Doe', updated_at = NOW()
WHERE id = 'USER_ID';
```

### Delete User (CASCADE will delete related records)
```sql
DELETE FROM users WHERE id = 'USER_ID';
```

## Security Notes

- All admin endpoints require authentication AND admin role
- Users cannot delete their own account via admin endpoint
- Password resets require minimum 8 characters
- Email uniqueness is enforced at database level
- All user-related data is deleted via CASCADE when user is deleted

