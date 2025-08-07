# Daily Word Generator (AI-Powered)

This project is a **full-stack backend service** built using **FastAPI** and **Firebase Firestore** that allows users to sign up, log in, and generate AI-powered word content based on their job title. The system ensures secure user authentication using JWT tokens and bcrypt for password hashing. It integrates an LLM-based word generation engine to provide personalized content daily.

## 🚀 Features

* **User Signup & Login**
  Secure authentication with hashed passwords and JWT tokens. Users are uniquely identified by email and `user_id`.

* **Token-Based Authentication**
  Uses `OAuth2PasswordBearer` and `JWT` to protect routes and ensure only authenticated users can access data generation and retrieval endpoints.

* **AI-Powered Word Generation**
  Once per day, each user can generate a custom word object related to their job title via the `wordgenerator` module (LLM-backed).

* **Daily Tracking & History**
  The system checks if the word data has already been generated for the user for the current day and fetches it instead of regenerating.

* **Firebase Firestore as Database**
  Firestore is used to store:

  * User details (`users` collection)
  * Daily word generation data (`words_generation_info` collection)

* **CORS Enabled**
  Fully configured for frontend integration, including React or any other SPA.

## 🛠️ Tech Stack

* **Backend Framework**: FastAPI
* **Database**: Firebase Firestore
* **Authentication**: OAuth2 + JWT
* **Password Security**: Passlib (`bcrypt`)
* **AI Integration**: `wordgenerator` (presumably an LLM-based custom module)
* **UUID**: For unique user identification
* **Date Handling**: `datetime`
* **Environment**: CORS Middleware enabled for API access across domains

## 📌 API Endpoints

| Method | Endpoint         | Description                                      |
| ------ | ---------------- | ------------------------------------------------ |
| `GET`  | `/`              | Health check route                               |
| `POST` | `/signup`        | Register new user                                |
| `POST` | `/login`         | Authenticate and get token                       |
| `GET`  | `/generate-data` | Generate daily word data (protected)             |
| `GET`  | `/get-data`      | Retrieve today's generated word data (protected) |

> Protected endpoints require the `Authorization: Bearer <token>` header.

---

## 🔐 Authentication Flow

1. User signs up with email and password.
2. Password is securely hashed using `bcrypt`.
3. On login, user receives a JWT access token.
4. Protected endpoints use `Depends(get_current_user)` to validate and extract user context.

---

## 🧠 How Word Generation Works

1. Authenticated user hits `/generate-data`.
2. Checks if today's word is already generated.
3. If not, uses the LLM-powered `wordgenerator(job_title)` function.
4. Saves the output to Firestore with the current date.
5. Returns the result to the user.

