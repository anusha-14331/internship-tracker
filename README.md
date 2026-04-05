# Student Internship Tracker

A full-stack web app for students to manage internship tasks: register, log in, and track deadlines with pending/completed status.

## Tech stack

- **Frontend:** React (Vite), React Router, Axios
- **Backend:** Node.js, Express, JWT, bcrypt (via `bcryptjs`)
- **Database:** MongoDB with Mongoose

## Project structure

```
sky/
├── backend/
│   ├── config/
│   │   └── db.js           # MongoDB connection
│   ├── middleware/
│   │   └── auth.js         # JWT verification
│   ├── models/
│   │   ├── User.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js         # POST /register, /login
│   │   └── tasks.js        # CRUD (protected)
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios client
│   │   ├── context/        # Auth (token + user)
│   │   ├── pages/          # Login, Register, Dashboard
│   │   ├── App.jsx
│   │   └── ...
│   ├── vite.config.js      # dev server + /api proxy
│   └── package.json
└── README.md
```

## Prerequisites

1. [Node.js](https://nodejs.org/) (LTS recommended)
2. [MongoDB](https://www.mongodb.com/try/download/community) running locally, or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection string

## How to run (step by step)

### 1. MongoDB

- **Local:** start the MongoDB service so it listens on `mongodb://127.0.0.1:27017` (default), or note your URI.
- **Atlas:** create a cluster and copy the connection string (replace `<password>` with your DB user password).

### 2. Backend

Open a terminal:

```bash
cd backend
npm install
```

Create a `.env` file in `backend` (copy from `.env.example`):

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/internship_tracker
JWT_SECRET=use_a_long_random_secret_string_here
```

Optional: set `CLIENT_ORIGIN=http://localhost:5173` if you change the frontend URL.

Start the API:

```bash
npm run dev
```

You should see `MongoDB connected` and `Server running on http://localhost:5000`.

### 3. Frontend

Open a **second** terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite prints a local URL (usually `http://localhost:5173`). Open it in your browser.

The dev server proxies `/api` to `http://localhost:5000`, so you do not need a separate frontend `.env` unless you deploy or change ports.

### 4. Use the app

1. Go to **Register** and create an account.
2. You will be signed in and redirected to the **Dashboard**.
3. Add tasks, edit, delete, and mark tasks complete. Stats show total, completed, and pending counts.

## API overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register; returns JWT + user |
| POST | `/api/auth/login` | No | Login; returns JWT + user |
| GET | `/api/tasks` | Yes | List current user’s tasks |
| POST | `/api/tasks` | Yes | Create task |
| PUT | `/api/tasks/:id` | Yes | Update task |
| DELETE | `/api/tasks/:id` | Yes | Delete task |

Send the JWT as: `Authorization: Bearer <token>` (the app does this automatically after login).

## Production build (frontend)

```bash
cd frontend
npm run build
npm run preview
```

Point `VITE_API_URL` to your deployed API base (e.g. `https://your-api.com/api`) if the app is not served behind the same origin as the API.

## License

MIT
