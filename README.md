# DevPulse API

Live URL: https://dev-pulse-three-psi.vercel.app/

## Features
- User registration and login with JWT
- Role-based access (contributor, maintainer)
- Create, list, view, update, and delete issues
- Filtering and sorting for issues

## Tech Stack
- Node.js (LTS)
- TypeScript
- Express.js
- PostgreSQL (pg)
- bcrypt, jsonwebtoken

## Setup
1. Install dependencies
	```
	npm install
	```
2. Create a .env file
	```
	CONNECTIONSTRING=your_postgres_connection_string
	JWT_SECRET=your_jwt_secret
	PORT=4000
	```
3. Run in development
	```
	npm run dev
	```
4. Build and run
	```
	npm run build
	npm start
	```

## API Endpoints

### Auth
- POST /api/auth/signup
- POST /api/auth/login

### Issues
- POST /api/issues (auth)
- GET /api/issues
- GET /api/issues/:id
- PATCH /api/issues/:id (auth)
- DELETE /api/issues/:id (auth, maintainer only)

## Database Schema Summary

### users
- id (serial, primary key)
- name (varchar, required)
- email (varchar, unique, required)
- password (text, required)
- role (varchar, default contributor)
- created_at (timestamp)
- updated_at (timestamp)

### issues
- id (serial, primary key)
- title (varchar, max 150)
- description (text, min 20)
- type (bug | feature_request)
- status (open | in_progress | resolved)
- reporter_id (int)
- created_at (timestamp)
- updated_at (timestamp)
