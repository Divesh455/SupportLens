# SupportLens - Support That Remembers

## Project Overview

SupportLens is an AI-powered customer support platform that remembers previous customer interactions using persistent memory. Traditional support systems and chatbots often forget conversations, causing customers to repeatedly explain the same issues and support teams to spend valuable time reviewing old tickets.

SupportLens solves this problem by combining:
* AI-powered conversations
* Long-term memory
* Ticket management
* Customer history
* Sentiment analysis

The system remembers customer issues and automatically uses previous context to generate better responses.

## Features

* **Persistent Memory**: Uses Hindsight to remember previous conversations, tickets, solutions, preferences, and sentiment.
* **AI Customer Support Chat**: ChatGPT-style interface with memory retrieval before generating responses.
* **Automatic Ticket Creation**: Automatically creates tickets when support-related issues are detected.
* **Customer History**: Complete customer timeline including tickets, conversations, resolutions, and sentiment history.
* **Sentiment Analysis**: Classifies interactions as Positive, Neutral, or Negative.
* **Ticket Summary Generation**: Generates AI-powered summaries of support tickets.
* **Dashboard Analytics**: Analytics dashboard with charts and key metrics.
* **JWT Authentication**: Secure user registration and login.

## Architecture Diagram

```
React Frontend
      ↓
FastAPI Backend
      ↓
Authentication Layer
      ↓
Business Logic Layer
      ↓
Groq + Hindsight + PostgreSQL
```

## Installation Guide

### Prerequisites
* Python 3.10+
* Node.js 18+
* PostgreSQL database

### Backend Setup
1. Clone the repository and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy `.env.example` to `.env` and fill in your variables.
5. Apply database migrations (or run the app to auto-create tables).
6. Run the server:
   ```bash
   uvicorn app:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the `backend` directory based on `.env.example`:

```
DATABASE_URL=postgresql://user:password@localhost/supportlens
GROQ_API_KEY=your_groq_api_key
HINDSIGHT_API_KEY=your_hindsight_api_key
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

## API Documentation

### Authentication
* `POST /register`: Register a new user.
* `POST /login`: Authenticate and receive a JWT.
* `GET /profile`: Get the current user's profile.

### Chat
* `POST /chat`: Send a message to the AI agent.
* `GET /conversation/{user_id}`: Retrieve the conversation history for a user.

### Tickets
* `POST /ticket`: Create a new ticket.
* `GET /tickets`: List all tickets (admin/agent).
* `GET /tickets/{user_id}`: List tickets for a specific user.
* `PATCH /ticket/{id}`: Update a ticket status/priority.

### History
* `GET /history/{user_id}`: Get the complete history timeline for a user.

### Dashboard
* `GET /dashboard/stats`: Get statistics for the dashboard.

## Deployment Guide

### Frontend (Vercel)
1. Push your code to a Git repository.
2. Import the project in Vercel.
3. Set the Root Directory to `frontend`.
4. Add any necessary environment variables (e.g., `VITE_API_URL`).
5. Deploy.

### Backend (Render)
1. Create a new Web Service in Render.
2. Connect your Git repository.
3. Set the Root Directory to `backend`.
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `uvicorn app:app --host 0.0.0.0 --port $PORT`
6. Add environment variables.

### Database (Neon PostgreSQL)
1. Create a project in Neon.
2. Copy the connection string.
3. Add it as `DATABASE_URL` in your backend environment variables.

## Future Improvements

* Add WebSocket support for real-time chat.
* Implement role-based access control (RBAC) with more granular permissions.
* Enhance the dashboard with more advanced analytics and filtering.
* Add email notifications for ticket updates.
* Multi-language support.
