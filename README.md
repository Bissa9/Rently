# 🚗 Rently

A peer-to-peer car rental platform, built as a team project. Renters search and book cars; owners ("hosts") list their cars, track earnings and withdraw money.

<!-- TODO: add a live demo link and 3-4 screenshots (home, search results, booking and payment, host dashboard). Save them in a docs/ folder, e.g.
[Live demo](https://your-demo-url) · ![Home page](docs/home.png) -->

## Features

**For renters**
- Search and filter cars by location, dates, make, type, seats, transmission, fuel type and price range, with sorting and pagination
- Booking flow with availability checks, plus modifying and cancelling bookings
- Card payments with Stripe, and automatic refunds when a paid booking is cancelled
- Loyalty program: points are earned for every completed rental day and can be redeemed for vouchers
- Reviews and star ratings for cars
- Rental history and in-app notifications
- Driving-licence details stored on the profile

**For car owners (hosts)**
- Become a host from your profile, then list cars with up to 5 images (Cloudinary uploads)
- Edit or delete listings
- Earnings overview and withdrawal requests, with history

**Accounts and security**
- Registration with email verification, and Google sign-in (Firebase)
- Login with JWT, and passwords hashed with bcrypt
- Password reset by emailed code
- Protected routes and role checks on the frontend and the API

**Support chatbot**
- A Rasa assistant (in `backend/rasabot`) answers questions about booking, cancellation, payment methods, the loyalty program, promo codes and hosting. The frontend talks to it through a chat button

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Redux, Tailwind CSS, Material UI, Ant Design, Framer Motion, Axios |
| Backend | Node.js, Express, MongoDB with Mongoose |
| Auth | JWT, bcrypt, Nodemailer (verification and reset emails), Firebase (Google sign-in) |
| Payments | Stripe (payment intents, refunds, webhook for completed checkout sessions) |
| Media | Cloudinary with Multer |
| Chatbot | Rasa |

## Project structure

```
Rently/
├── backend/
│   ├── server.js
│   ├── src/
│   │   ├── controllers/   # auth, bookings, cars, payments, webhooks, loyalty, reviews, withdrawals
│   │   ├── models/        # User, Car, Booking, Review, LoyaltyProgram, Notification
│   │   ├── routes/
│   │   ├── middlewares/   # JWT auth
│   │   └── services/      # Stripe payment service
│   └── rasabot/           # Rasa chatbot (NLU data, stories, rules, domain)
└── frontend/
    └── src/
        ├── pages/         # Home, Search, CarListing, Cardetails, PaymentProcess, Profile, LoyaltyProgram ...
        ├── components/
        ├── api/           # Axios clients
        └── redux/
```

## API overview

| Area | Base path | Examples |
|---|---|---|
| Auth | `/api/auth` | register, login, verify-email, forgot-password, reset-password |
| Users | `/api/users` | profile, update-profile, become-car-owner, update-password |
| Cars | `/api/cars` | create, update, delete, list with filters, get by id |
| Bookings | `/api/booking` | create, check-availability, history, pay, complete, cancel, owner earnings |
| Payments | `/api/payment` | pay, refund, Stripe webhook |
| Loyalty | `/api/loyaltyprog` | get points, redeem |
| Reviews | `/api/review` | create, update, delete, list by car |
| Withdrawals | `/api/withdrawals` | request, history |
| Notifications | `/api/notifications` | booking, cancellation and modification notifications |

A Postman collection of the API was used during development.

## Getting started

**Prerequisites:** Node.js 18+, a MongoDB database (local or Atlas), a Stripe test account, a Cloudinary account, and an email account for sending verification emails.

### 1. Backend

```bash
cd backend
npm install
# create backend/.env (see below)
npm run dev          # http://localhost:5000
```

Environment variables (`backend/.env`):

```
PORT=5000
MONGO_URI=
JWT_SECRET=
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

EMAIL_HOST=
EMAIL_PORT=
EMAIL_SECURE=
EMAIL_USER=
EMAIL_PASSWORD=
```

Never commit your `.env` file. Use Stripe **test** keys only.

### 2. Frontend

```bash
cd frontend
npm install
npm start            # http://localhost:3000
```

The dev server proxies `/api` to the backend on port 5000 and `/webhooks` to the Rasa server on port 5005.

### 3. Stripe webhook (local)

```bash
stripe listen --forward-to localhost:5000/api/payment/webhook
```

Copy the signing secret it prints into `STRIPE_WEBHOOK_SECRET`.

### 4. Chatbot (optional)

```bash
cd backend/rasabot
rasa train
rasa run --enable-api --cors "*"
```

## My role

Rently was a **team project**. I worked on the **frontend** (the React application) and on **part of the payment flow on the backend** (Stripe).

<!-- Optional: add specifics, e.g. which pages you built (search, car details, payment page, profile) and which payment endpoints you wrote. Also add your teammates' GitHub profiles if you want to credit them. -->

## What I learned

- Building a multi-role marketplace interface (renter and host) in React with Redux
- Multi-step forms, protected routes and API integration with Axios
- Handling payments with Stripe payment intents, refunds and webhooks
- Working as part of a team on a full-stack project

## Roadmap

- [ ] Require authentication on the payment routes and check that a booking belongs to the caller before paying or refunding
- [ ] Mark bookings as paid only from the Stripe webhook, once the payment is confirmed
- [ ] Add automated tests for booking and loyalty logic
- [ ] Deploy the frontend and backend
