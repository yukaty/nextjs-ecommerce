# Next.js eCommerce Application

An eCommerce application built with Next.js, TypeScript, and MySQL.

## Features

- Product catalog with search and filtering
- Shopping cart functionality
- User authentication
- Order management system
- Payment processing with Stripe
- Admin dashboard for product management

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL
- Stripe account for payments test

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables (create `.env.local`):

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASS=your_password
DB_NAME=your_database
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL with mysql2
- **Authentication**: JWT with jose
- **Payments**: Stripe

