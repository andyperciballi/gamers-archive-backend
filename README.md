# 🎮 Gamers Archive – Back-End API

This repository contains the back-end API for the Gamers Archive full-stack MERN application.

The API is built with Express and Node.js, uses MongoDB for data storage, and implements JWT-based authentication and authorization.

For full project details, screenshots, and usage instructions, please see the Front-End repository:

👉 https://github.com/andyperciballi/gamers-archive-react-frontend

---

## 🧱 Technologies Used

- Node.js
- Express
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcrypt
- CORS
- dotenv

---

## 🔐 Authentication

- JWT token-based authentication
- Secure password hashing with bcrypt
- Protected RESTful routes
- Authorization logic ensures only resource creators can modify or delete their data

---

## 🗂 Data Models

- User
- APIGame
- Library Item
- Review

Library items are owned by users but API Game items store a larger dataset relating to a library item. Reviews are tied to the API game and not the library item so if users remove games from libraries the game will retain the reviews
---

## 🌐 Deployment

Deployed API URL:
[Backend Deployment Link Here]

---

## 👥 Contributors

- Andrew Perciballi
- Felicia Bossom
- William De Los Santos
