Environment variables used by this project

- MONGODB_URL: MongoDB connection string. Default: mongodb://localhost:27017/
- SESSION_SECRET: Express session secret. Required to secure session cookies.
- STRIPE*SECRET: Stripe secret key (sk_test*... for test mode). Keep private.
- STRIPE*PUBLISHABLE_KEY: Stripe publishable key (pk_test*...) used client-side.
- SENDGRID_API_KEY: API key for SendGrid (used for emails).
- SENDGRID_SENDER: Sender email for outgoing emails (e.g., 'My Shop' shop@example.com).
- PORT: Optional server port (default 3000).

Usage:

- Copy `.env` and fill in real values (do not commit your `.env` to git).
- Start app:

```bash
npm run start
```
