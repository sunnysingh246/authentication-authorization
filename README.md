# Authentication API Backend

A secure Node.js authentication backend built with Express.js, MongoDB, JWT, and Gmail OAuth2 email service. It provides user registration, login, email OTP verification, session management, refresh token rotation, and logout functionality.

---

## Features

* User registration with encrypted passwords
* Email OTP verification
* Secure password hashing using bcrypt
* JWT Access Token authentication
* HTTP-only Refresh Token cookies
* Refresh token rotation
* Session management for multiple devices
* Logout from current device
* Logout from all devices
* Gmail OAuth2 email integration using Nodemailer
* MongoDB database integration using Mongoose
* Secure environment variable management with `.env`

---

## Tech Stack

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Authentication & Security

* JSON Web Tokens (JWT)
* Bcrypt
* Crypto (SHA256 hashing)
* HTTP-only cookies

### Email Service

* Nodemailer
* Gmail OAuth2

---

## Project Structure

```text
src/
│
├── config/
│   └── config.js
│
├── controllers/
│   └── auth.controller.js
│
├── models/
│   ├── users.model.js
│   ├── session.model.js
│   └── otp.model.js
│
├── services/
│   └── email.service.js
│
├── utils/
│   └── utils.js
│
├── routes/
│   └── auth.routes.js
│
└── server.js
```



## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

GOOGLE_USER=your_email@gmail.com
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
```

---

## Running the Project

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server will run at:

```
http://localhost:5000
```

---

## API Endpoints

### Authentication

| Method | Endpoint                  | Description                 |
| ------ | ------------------------- | --------------------------- |
| POST   | `/api/auth/register`      | Register a new user         |
| POST   | `/api/auth/verify-email`  | Verify email using OTP      |
| POST   | `/api/auth/login`         | Login user                  |
| GET    | `/api/auth/me`            | Get current logged-in user  |
| POST   | `/api/auth/refresh-token` | Generate a new access token |
| POST   | `/api/auth/logout`        | Logout from current device  |
| POST   | `/api/auth/logout-all`    | Logout from all devices     |

---

## Authentication Flow

### Registration

1. User provides username, email, and password.
2. Password is encrypted using bcrypt.
3. User account is created.
4. An OTP is generated and sent to the user's email.
5. User verifies the OTP to activate the account.

---

### Login

1. User enters email and password.
2. Credentials are validated.
3. A JWT access token is generated.
4. A refresh token is stored in an HTTP-only cookie.
5. A session is created in the database.

---

### Token Refresh

1. Client sends the refresh token cookie.
2. Server validates the session.
3. A new access token is generated.
4. The refresh token is rotated for better security.

---

## Security Practices

* Passwords are hashed using bcrypt.
* Refresh tokens are stored as SHA256 hashes in the database.
* Sensitive information is stored in environment variables.
* HTTP-only cookies protect refresh tokens from JavaScript access.
* JWT access tokens have short expiration times.
* Session revocation allows secure logout.

---


## Author

Developed by **SUNNY**

---

## License

This project is licensed under the MIT License.
