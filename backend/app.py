from __future__ import annotations
from typing import Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ConfigDict
from backend.services.password_analyzer import analyze_password
from backend.services.password_generator import generate_password, generate_passphrase
from backend.services.analytics import save_analysis, dashboard_stats, weakness_stats
from backend.services.security_demo import hash_password, verify_password

app = FastAPI(title="Password Strength Analyzer & Security Tool", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], allow_credentials=False, allow_methods=["GET", "POST"], allow_headers=["*"])

class Context(BaseModel):
    first_name: str = ""
    birth_year: str = ""
    company: str = ""
    college: str = ""
    username: str = ""
    email: str = ""

class AnalyzeRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    password: str = Field(..., min_length=0, max_length=128)
    context: Context | None = None
    persist: bool = False

class GenerateRequest(BaseModel):
    length: int = Field(20, ge=16, le=128)
    uppercase: bool = True
    lowercase: bool = True
    numbers: bool = True
    symbols: bool = True
    passphrase_words: int | None = Field(None, ge=4, le=8)

class HashDemoRequest(BaseModel):
    password: str = Field(..., min_length=1, max_length=128)

@app.get("/api/health")
def health():
    return {"status": "ok", "privacy": "Passwords are processed in memory and are not stored."}

@app.post("/api/analyze")
def analyze(request: AnalyzeRequest):
    result = analyze_password(request.password, request.context.model_dump() if request.context else None)
    if request.persist and request.password:
        save_analysis(result)
    return result

@app.get("/api/dashboard/stats")
def stats():
    return dashboard_stats()

@app.get("/api/analytics/weaknesses")
def weaknesses():
    return {"weaknesses": weakness_stats()}

@app.post("/api/generate-password")
def generate(request: GenerateRequest):
    try:
        value = generate_passphrase(request.passphrase_words) if request.passphrase_words else generate_password(request.length, request.uppercase, request.lowercase, request.numbers, request.symbols)
        return {"password": value, "note": "Generated in memory with Python secrets; not stored by the server."}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

@app.post("/api/security-demo/hash")
def demo_hash(request: HashDemoRequest):
    return {"hash": hash_password(request.password), "algorithm": "Argon2id", "note": "Educational demo only; do not use this endpoint as a production auth service."}

@app.post("/api/security-demo/verify")
def demo_verify(payload: dict[str, Any]):
    if not isinstance(payload.get("password"), str) or not isinstance(payload.get("hash"), str):
        raise HTTPException(status_code=400, detail="password and hash are required")
    return {"valid": verify_password(payload["hash"], payload["password"])}
