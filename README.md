



# 📱 **WhatsApp Clone – Real-Time Chat Application**

*A full-stack real-time messaging application with OTP login & modern WhatsApp-like UI.*

---

## 🚀 **Overview**

This project is a fully functional **real-time chat application** inspired by WhatsApp.
It includes **email-based OTP authentication**, **one-to-one personal chats**, and a clean UI built using **React + Vite**.
Real-time messaging is powered by **Socket.io**, and all user/message data is stored using **MongoDB**.

This system is designed using **industry-standard architecture**, suitable for **major academic projects** or scalable real-world applications.

---

## ⭐ **Key Features**

### 🔐 **Authentication**

* Login using **email + OTP**
* Secure session handling using **JWT**
* No password storage → high security

### 💬 **Real-Time Chat**

* One-to-one messaging
* Instant delivery using **Socket.io**
* Chat bubbles (sent/received)
* Auto-scroll to latest message

### 👥 **User System**

* Shows list of all verified users
* Select any user & start chatting
* Messages are private between two users
* Tracks last message in chat list

### 🎨 **Modern UI**

* WhatsApp-like layout
* Responsive design (mobile + desktop)
* Clean sidebar & chat window
* Message timestamps & bubble styling

### 🗄️ **Backend Services**

* OTP generator
* Email sender (demo mode)
* Socket.io real-time server
* Message persistence in MongoDB

---

## 📂 **Project Structure**

```
whatsapp-clone/
│
├── backend/
│   ├── server.js
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── App.jsx
    │   ├── App.css
    ├── public/
    └── package.json
```

---

## 🛠️ **Technologies Used**

### **Frontend**

* React (Vite)
* CSS
* Socket.io Client

### **Backend**

* Node.js
* Express.js
* MongoDB + Mongoose
* Nodemailer (OTP system)
* JWT (authentication)
* Socket.io

---

## ⚙️ **Installation & Setup**

### **1️⃣ Clone the repository**

```sh
git clone https://github.com/<your-username>/<repo-name>.git
cd whatsapp-clone
```

---

### **2️⃣ Setup Backend**

```sh
cd backend
npm install
```

#### Create **.env** file:

```
JWT_SECRET=your_secret_key
EMAIL_FROM=example@gmail.com
EMAIL_PASS=your_app_password    # not required in demo mode
DEMO_MODE=true
MONGO_URI=your_mongo_connection_string
```

#### Run backend:

```sh
npm run dev
```

---

### **3️⃣ Setup Frontend**

```sh
cd ../frontend
npm install
npm run dev
```

---

## 🔌 **API Endpoints**

### **Authentication**

| Method | Endpoint               | Description              |
| ------ | ---------------------- | ------------------------ |
| POST   | `/api/auth/send-otp`   | Send OTP to email        |
| POST   | `/api/auth/verify-otp` | Verify OTP & create user |

### **Users**

| Method | Endpoint         | Description                    |
| ------ | ---------------- | ------------------------------ |
| GET    | `/api/users/all` | Get all users except logged-in |

### **Messages**

| Method | Endpoint                          | Description                  |
| ------ | --------------------------------- | ---------------------------- |
| POST   | `/api/messages/send`              | Store message                |
| GET    | `/api/messages/:userId1/:userId2` | Fetch chat between two users |

---

## ⚡ **Real-Time Socket Events**

### **Client → Server**

| Event          | Description            |
| -------------- | ---------------------- |
| `join`         | Join user room         |
| `send_message` | Send real-time message |

### **Server → Client**

| Event             | Description              |
| ----------------- | ------------------------ |
| `receive_message` | Receive incoming message |
| `user_joined`     | Notify user connected    |

---

## 📸 **Screenshots** *(Add images in repo → /screenshots)*

### 🔐 Login Page

`/screenshots/login.png`

### 📧 OTP Verification

`/screenshots/otp.png`

### 🏠 User Dashboard

`/screenshots/dashboard.png`

### 💬 Chat Window

`/screenshots/chat.png`

---

## 🧱 **System Design Flow**

```
User → Enters Email → OTP Generated → OTP Verified → JWT Session Created →

User List Loaded → Select User → Chat Room Created → Real-time Messaging
→ Messages Stored in DB → Auto-sync on both sides
```

---

## 📦 **Database Schema**

### **User**

```js
{
  name: String,
  email: String,
  createdAt: Date
}
```

### **Message**

```js
{
  fromUserId,
  toUserId,
  message,
  timestamp
}
```

---

## 🎯 **Conclusion**

This project demonstrates a complete end-to-end real-time messaging ecosystem with secure authentication, scalable backend, and clean UI.
It fulfills all requirements of a **final year engineering major project** and can be extended with advanced features like:

✔ Voice notes
✔ Media sharing
✔ Delivery receipts (✓, ✓✓, blue tick)
✔ Online/offline presence

---

## 🤝 **Contributions**

Feel free to fork, modify, or improve the project. PRs are welcome.

---

## 📜 License

This project is licensed under **MIT License**.

---


