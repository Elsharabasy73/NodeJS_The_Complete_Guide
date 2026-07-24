# Node.js Shop Platform

A full-stack, server-rendered e-commerce application built with Node.js and Express, following an MVC-inspired architecture with authentication, admin product management, cart and order workflows, input validation, and robust error handling.

This project is structured as a professional learning-grade codebase and can be used as a strong foundation for production-ready online store development.

## Table of Contents

1. Overview
2. Core Features
3. Architecture
4. Tech Stack
5. Project Structure
6. Getting Started
7. Environment Configuration
8. Available Scripts
9. Security Best Practices
10. Email Testing Utility
11. Troubleshooting
12. Roadmap
13. Contributing
14. License

## Overview

This repository demonstrates practical backend and full-stack web engineering patterns:

- Modular route/controller separation
- Model abstraction for business logic
- Server-side rendering with EJS
- Authentication and route protection
- Validation for auth and product forms
- Centralized error management
- Utility helpers for file and path handling

## Core Features

- Shop experience
  - Product listing and product detail pages
  - Cart management workflow
  - Checkout and orders pages

- Admin capabilities
  - Create and edit products
  - Dedicated admin product views and scripts

- Authentication
  - Signup/login/logout flow
  - Password reset and new password flow
  - Signup confirmation page
  - Auth middleware for protected resources

- Reliability and UX
  - Pagination partials and reusable templates
  - Custom 404 and 500 views
  - Static asset organization for scalable frontend styling

## Architecture

The application follows a layered approach:

- Routes: HTTP endpoints and request mapping
- Controllers: Request orchestration and response rendering
- Models: Data/business operations
- Middleware: Cross-cutting concerns such as authentication
- Validation: Request-level data validation rules
- Views: EJS templates and reusable partials
- Utilities: Shared helpers (file/path/domain)

## Tech Stack

- Runtime: Node.js
- Framework: Express.js
- View Engine: EJS
- Mailer: Nodemailer
- Validation: Custom validation modules
- Static Assets: Plain CSS and browser JavaScript

## Project Structure

```text
.
├── app.js
├── package.json
├── ENV_VARS.md
├── test.js
├── controllers/
│   ├── admin.js
│   ├── auth.js
│   ├── error.js
│   └── shop.js
├── routes/
│   ├── admin.js
│   ├── auth.js
│   └── shop.js
├── models/
│   ├── orders.js
│   ├── product.js
│   └── user.js
├── middleware/
│   └── is-auth.js
├── validation/
│   ├── auth.js
│   └── product.js
├── util/
│   ├── file.js
│   ├── mydomain.js
│   └── path.js
├── views/
│   ├── 404.ejs
│   ├── 500.ejs
│   ├── admin/
│   ├── auth/
│   ├── includes/
│   └── shop/
├── public/
│   ├── css/
│   ├── images/
│   └── js/
├── data/
│   └── invoices/
└── images/
```

## Getting Started

### 1. Prerequisites

- Node.js 18+
- npm 9+
- Access to configured environment variables (see `ENV_VARS.md`)

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Follow `ENV_VARS.md` and create your local environment setup.

If your app uses `.env`, create it at the project root and never commit it.

### 4. Run the Application

```bash
npm start
```

If development scripts are available in `package.json`, use:

```bash
npm run dev
```

### 5. Open in Browser

- Default: `http://localhost:3000`
- Use your configured port if different

## Environment Configuration

The exact required variables are documented in `ENV_VARS.md`. Typical categories include:

- Server
  - `PORT`
  - `NODE_ENV`

- Persistence and data layer
  - Database connection credentials/URI

- Session/auth
  - Session secret(s)
  - Token or cookie security settings

- Email/SMTP
  - SMTP host/port
  - SMTP user/password or app password

## Available Scripts

Use `package.json` as the source of truth. Common commands:

- `npm start`: Run the application
- `npm run dev`: Start in development mode (if defined)
- `npm test`: Run tests (if defined)

## Security Best Practices

This repository includes email testing helpers and learning artifacts. Before sharing publicly:

- Never store secrets in source files
- Move all credentials to environment variables
- Rotate any leaked/committed secrets immediately
- Add `.env` and secret files to `.gitignore`
- Use provider-specific app passwords (for Gmail, use App Password with 2FA)

## Email Testing Utility (`test.js`)

`test.js` sends a single SMTP test email using Nodemailer.

### What it needs

Before running, set these environment variables:

- `SENDER_EMAIL` (the sender Gmail address)
- `SENDER_PASSWORD` (the Gmail App Password)

> Note: Use a Gmail **App Password**, not your normal Gmail account password.

### Option 1: Run in one command (Linux/macOS)

```bash
SENDER_EMAIL="your@gmail.com" SENDER_PASSWORD="your_app_password" node test.js

Recommendations:

- Replace inline credentials with env vars
- Keep test utilities out of production deployment bundles
- Never push plaintext passwords

## Troubleshooting

### SMTP Authentication Fails

- Verify SMTP host, port, and secure mode
- Confirm credentials and account security settings
- For Gmail, ensure App Password is used when 2FA is enabled

### 404 or Missing Assets

- Confirm static middleware points to `public/`
- Verify file paths in EJS templates and partials

### Session/Auth Issues

- Validate session secrets and cookie settings
- Confirm auth middleware is attached to protected routes

### Template Rendering Errors

- Check EJS view names and include paths
- Ensure controller render calls map to existing templates

## Roadmap

Potential upgrades for production-level maturity:

- Add structured logging and request tracing
- Add unit/integration tests with coverage reports
- Containerize with Docker
- Add CI pipeline (lint, test, security scan)
- Introduce rate limiting and CSRF protection
- Add API documentation for hybrid SSR/API architecture

## Contributing

Contributions are welcome.

Suggested workflow:

1. Fork the repository
2. Create a feature branch
3. Make focused commits with clear messages
4. Open a pull request with context and testing notes

## License

No license file is currently included.

If you plan to publish or distribute this project, add a license file (for example, MIT) and update this section accordingly.
```
