# SMS Login Environment Variables

Add these to your `.env.local` file:

```bash
# Aliyun SMS Configuration
ALIYUN_ACCESS_KEY_ID=your_access_key_id
ALIYUN_ACCESS_KEY_SECRET=your_access_key_secret
ALIYUN_SMS_SIGN_NAME=STEM故事
ALIYUN_SMS_TEMPLATE_CODE=SMS_123456789
```

## Setup Instructions

1. **Run Database Migration**
   ```bash
   mysql -u your_user -p your_database < migrations/add_sms_login.sql
   ```

2. **Configure Aliyun SMS**
   - Log in to Aliyun Console
   - Enable SMS service
   - Create SMS template with verification code parameter: `${code}`
   - Get template code and update `ALIYUN_SMS_TEMPLATE_CODE`
   - Create signature and update `ALIYUN_SMS_SIGN_NAME`

3. **Test the Implementation**
   - Start dev server: `npm run dev`
   - Navigate to `/login`
   - Switch to "验证码登录" tab
   - Enter phone number and request verification code
   - Enter code and login

## Features

- Phone number validation (Chinese mobile format)
- Rate limiting (phone + IP based)
- 5-minute code expiration
- 3 verification attempts per code
- Auto-registration for new users
- Seamless integration with existing auth system
