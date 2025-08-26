# Next.js eCommerce Application

This full-stack eCommerce project was created to explore and implement the new features and best practices of Next.js 15 and TypeScript.

## Features

- Product browsing with search and filters
- Secure user accounts and authentication
- Cart, checkout, and payment integration
- Order and inventory management for Admin

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with pg
- **Authentication**: JWT with jose
- **Payments**: Stripe

## Local Setup

### Prerequisites

- Node.js 18+
- PostgreSQL
- Stripe account for test mode

### Installation

1. Clone the repository and install dependencies:
    ```bash
    npm install
    ```

2. Configure environment variables:
    ```bash
    cp .env.example .env
    ```

3. Set up the database:

    Run the SQL schema from `database/schema-postgres.sql` to create the required tables.

4. Run the development server:
    ```bash
    npm run dev
    ```

5. Set up Stripe webhook:
    ```bash
    stripe login
    stripe listen --forward-to localhost:3000/api/orders/webhook
    ```

    Copy the webhook signing secret from the CLI output and add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`.

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials

See `database/schema-postgres.sql` for sample user credentials.

For payment testing, see: https://docs.stripe.com/testing#cards

