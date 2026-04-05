# Watch Store E-Commerce Platform

Watch Store is an e-commerce platform for selling authentic watches with customer-facing shopping features and a complete administration system.

## Table of Contents

- [Overview](#overview)
- [Main Features](#main-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [System Requirements](#system-requirements)
- [Setup and Run](#setup-and-run)
- [API Overview](#api-overview)
- [Development Commands](#development-commands)
- [Contribution Guide](#contribution-guide)
- [License](#license)

## Overview

- Course: Web Programming with Java
- Team: 08
- Term: 2024-2025
- Scope: Full-stack web application (Java Spring Boot backend and React frontend)

The project supports two user groups:

- Customers: browse products, add to cart, checkout, track orders, review products, chat support, and manage wishlist.
- Administrators: manage products, categories, brands, suppliers, orders, promotions, users, content, reports, and notifications.

## Main Features

### Customer Features

- Account registration and login (JWT based)
- Google and Facebook OAuth login
- Product listing, filtering, searching, and detail pages
- Shopping cart for authenticated users and guests
- Checkout with COD and VNPay payment gateway
- Order tracking and order history
- Product review and rating
- Real-time chat with admin and AI assistant chat
- Wishlist management

### Admin Features

- Dashboard for sales and operational overview
- Product CRUD with image upload
- Category, brand, and supplier management
- Promotion and banner management
- Order processing and status update
- User and role management
- Report and analytics views
- CMS for posts and content blocks
- Review moderation
- Inventory tracking
- Payment monitoring

### Security and Access

- JWT authentication and token refresh flow
- Role-based access control (ADMIN, USER)
- Password reset flow through email

## Technology Stack

### Frontend

- React 19
- Vite 7
- React Router 7
- Axios
- Tailwind CSS 4
- Radix UI
- Recharts
- Sonner
- STOMP and SockJS for real-time messaging

### Backend

- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- WebSocket
- Maven

### Integrations

- VNPay payment gateway
- Cloudinary media upload
- Google OAuth
- Facebook OAuth

## Project Structure

```text
WatchStoreShopping/
├── backend/                # Spring Boot backend
│   ├── src/main/java/
│   ├── src/main/resources/
│   └── pom.xml
├── frontend/               # React + Vite frontend
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

## System Requirements

- Java 17 or newer
- Maven 3.8 or newer
- Node.js 18 or newer
- npm 9 or newer
- Git

## Setup and Run

## 1. Clone Repository

```bash
git clone https://github.com/TanDuy274/WWW_JAVA_Nhom08.git
cd WWW_JAVA_Nhom08
```

## 2. Run Backend

```bash
cd backend
./mvnw spring-boot:run
```

For Windows:

```bash
cd backend
mvnw.cmd spring-boot:run
```

Default backend base URL:

```text
http://localhost:8080/api
```

## 3. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Default frontend URL:

```text
http://localhost:5173
```

## 4. Frontend Environment Variables

Create file `frontend/.env` and configure:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_VNPAY_RETURN_URL=http://localhost:5173/vnpay-return
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_FACEBOOK_APP_ID=your_facebook_app_id
```

## API Overview

Base URL:

```text
http://localhost:8080/api
```

Sample endpoint groups:

- Authentication: `/auth/*`
- Products: `/products/*`
- Orders: `/orders/*`
- Payments: `/payments/*`
- Uploads: `/upload/*`
- Notifications: `/notifications/*`

Refer to backend controller classes for complete endpoint details.

## Development Commands

### Frontend

```bash
cd frontend
npm run dev
npm run build
npm run preview
npm run lint
```

### Backend

```bash
cd backend
./mvnw test
./mvnw spring-boot:run
```

For Windows:

```bash
cd backend
mvnw.cmd test
mvnw.cmd spring-boot:run
```

## Contribution Guide

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes with clear commit messages.
4. Push the branch to your fork.
5. Open a pull request.

Coding standards:

- Follow ESLint rules for frontend.
- Follow Java and Spring Boot conventions for backend.
- Use PascalCase for React component names.
- Use camelCase for function and variable names.
- Add comments only for non-obvious business logic.

## License

This project is released under the MIT License.
