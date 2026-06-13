from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth_routes, chat_routes, ticket_routes, history_routes, dashboard_routes

app = FastAPI(title="SupportLens API", description="AI Customer Support Agent with Persistent Memory")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(chat_routes.router)
app.include_router(ticket_routes.router)
app.include_router(history_routes.router)
app.include_router(dashboard_routes.router)

@app.get("/")
def root():
    return {"message": "Welcome to SupportLens API"}
