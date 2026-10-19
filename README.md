# Lemea Fragrance — Backend API

Backend REST API for **Lemea Fragrance**, built with [NestJS](https://nestjs.com/), [TypeORM](https://typeorm.io/), and PostgreSQL. It manages products, categories, orders, reviews, authentication, media uploads via Cloudinary, and transactional email notifications.

---

## 🛠 Tech Stack

- **Framework:** NestJS 11 (Node.js & TypeScript)
- **Database:** PostgreSQL with TypeORM
- **Authentication:** JWT (JSON Web Tokens) with Passport
- **Media Uploads:** Cloudinary API
- **Emails:** Resend HTTP API & Nodemailer (SMTP fallback)
- **API Documentation:** Swagger / OpenAPI
- **Validation:** `class-validator` & `class-transformer`

---

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/) (running locally or a remote connection like Railway / Supabase)
- [npm](https://www.npmjs.com/)

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/ermalkamishi/Lemea-Flagrance-Back.git
cd Lemea-Flagrance-Back
npm install
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Configure `.env` with your actual credentials:

```ini
# Runtime
NODE_ENV=development
PORT=3000

# PostgreSQL Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=lemea-flagrance

# TypeORM
TYPEORM_SYNC=false
TYPEORM_MIGRATIONS_RUN=false
TYPEORM_LOGGING=false

# Authentication
JWT_SECRET=your_jwt_secret_key

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:4173

# Cloudinary (Media storage & product image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email & Notifications (Resend / SMTP)
EMAIL=your_email@example.com
EMAIL_PASS=your_email_password
RESEND_API_KEY=re_your_resend_api_key
```

> **Note:** `.env` is ignored by Git and will never be committed.

---

## 🗄 Database & Migrations

To run database migrations:

```bash
# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

---

## 🏃 Running the Application

```bash
# Development (with hot-reload)
npm run start:dev

# Production build
npm run build

# Start production server
npm run start:prod
```

Once running, the server will be available at:
`http://localhost:3000`

---

## 📖 API Documentation (Swagger)

Interactive Swagger UI documentation is available at:

```
http://localhost:3000/api/docs
```

Explore endpoints, test request payloads, and view DTO schemas directly from the browser.

---

## 📂 Core Modules

- **Auth (`/auth`):** User registration, login, role guards, and JWT authentication.
- **Products (`/products`):** Product catalog, multi-language translation fields, and image uploads.
- **Categories (`/categories`):** Product categorizations and hierarchy.
- **Orders (`/orders`):** Checkout processing, IP rate-limiting, stock validation, and email alerts.
- **Reviews (`/reviews`):** Product reviews and rating submission.
- **Cloudinary (`/cloudinary`):** Cloudinary stream uploader for media assets.
- **Contact (`/contact`):** Customer inquiries handled through Resend.

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 📄 License

This project is proprietary and confidential to **Lemea Fragrance**.
